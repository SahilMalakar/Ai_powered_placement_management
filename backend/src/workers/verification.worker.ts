import { Worker, Job } from "bullmq";
import { getRedisConnection } from "../configs/redis.config.js";
import { VERIFICATION_QUEUE_NAME, type VerificationJobPayload } from "../queues/verification.queue.js";
import { findProfileByUserId } from "../modules/students/repositories/student.repository.js";
import { 
  getStudentSgpaDocuments, 
  updateVerificationStatus,
  saveVerifiedAcademicData
} from "../modules/students/repositories/verification.repository.js";
import { extractTextFromPdfBuffer } from "../utils/fileHandler/pdfParser.js";
import { VerificationStatus } from "../prisma/generated/prisma/enums.js";
import { verificationRawTextSchema } from "../types/students/verification.js";
import { CACHE_KEYS } from "../utils/cacheKeys.js";
import { getRedisConnectionForCaching } from "../configs/redis.config.js";

// Helper to validate name tokens against extracted text for robustness
const validateNameTokens = (dbFullName: string, extractedName: string): boolean => {
  if (!extractedName) return false;
  // Normalize both strings to lowercase and strip special characters
  const dbTokens = dbFullName.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(/\s+/);
  const extractClean = extractedName.toLowerCase().replace(/[^a-z0-9 ]/g, '');
  // Every token in the database name must be present in the extracted text
  return dbTokens.every(token => extractClean.includes(token));
};

// Initialize the Verification Worker to process marksheet validation
export const initializeVerificationWorker = async () => {
  const verificationWorker = new Worker(
    VERIFICATION_QUEUE_NAME,
    async (job: Job<VerificationJobPayload>) => {
      const { userId } = job.data;
      console.log(`[Verification Worker] Processing user ${userId}...`);

      try {
        // 1. Fetch source documents
        const [profile, sgpaDocs] = await Promise.all([
          findProfileByUserId(userId),
          getStudentSgpaDocuments(userId)
        ]);

        if (!profile) throw new Error("Student profile not found");
        
        let isOverallCorrect = true;
        const mismatchDetails: string[] = [];
        
        // Data to be extracted and aggregated
        const extractedSgpas: { semester: number; sgpa: number }[] = [];
        let detectedAstuRollNo: string | null = null;
        let detectedBacklog = false;
        const detectedBacklogSubjects = new Set<string>();

        // 3. Process each marksheet PDF sequentially
        for (const doc of sgpaDocs) {
          if (!doc.url || doc.semester == null) continue;

          try {
            const response = await fetch(doc.url);
            if (!response.ok) throw new Error(`Download failed for sem ${doc.semester}`);
            
            const buffer = Buffer.from(await response.arrayBuffer());
            const text = await extractTextFromPdfBuffer(buffer);
            console.log(`[DEBUG] Raw Text for Sem ${doc.semester}:`, text);

            // Extraction using Zod transformer
            const zodResult = verificationRawTextSchema.safeParse(text);

            if (!zodResult.success) {
              isOverallCorrect = false;
              mismatchDetails.push(`Sem ${doc.semester}: Extraction failed.`);
              continue;
            }

            const { rollNo, name, sgpa } = zodResult.data;

            // Identity Match: Every doc must belong to the student
            if (!validateNameTokens(profile.fullName, name)) {
              isOverallCorrect = false;
              mismatchDetails.push(`Sem ${doc.semester}: Identity mismatch (extracted name: ${name}).`);
              continue;
            }

            // Consitency: Keep track of Roll Number
            if (!detectedAstuRollNo) {
              detectedAstuRollNo = rollNo;
            } else if (detectedAstuRollNo !== rollNo) {
              isOverallCorrect = false;
              mismatchDetails.push(`Sem ${doc.semester}: Roll No inconsistency (${rollNo} vs ${detectedAstuRollNo}).`);
            }

            // Backlog Detection Logic: Verifies 'F' grade AND 'Not Completed' status
            // Capture Group 1: Subject Code, Capture Group 2: Subject Name
            const backlogRegex = /([A-Z]{2,}\d{3,}[A-Z0-9-]*)\s+(.*?)\s+F\s+(?:\d+)\s+Not Completed/gi;
            let match;
            while ((match = backlogRegex.exec(text)) !== null) {
              detectedBacklog = true;
              if (match[2]) detectedBacklogSubjects.add(match[2].trim());
            }

            // Add to aggregation
            extractedSgpas.push({ semester: doc.semester, sgpa });

          } catch (error: any) {
            isOverallCorrect = false;
            mismatchDetails.push(`Sem ${doc.semester}: OCR/Structural error.`);
          }
        }

        // 4. Final Processing & Persistence
        // Strict Integrity Check: Only verify if EVERY uploaded document was successfully parsed
        const allDocsProcessed = extractedSgpas.length === sgpaDocs.length;

        if (isOverallCorrect && allDocsProcessed && detectedAstuRollNo) {
          // Calculate CGPA using the Highest Semester as the divisor (Cherry-picking protection)
          const maxSemester = Math.max(...extractedSgpas.map(s => s.semester));
          const sum = extractedSgpas.reduce((acc, curr) => acc + curr.sgpa, 0);
          
          // If a student only uploads Sem 1 and 4, the divisor is 4, effectively counting gaps as 0.
          const averageCgpa = parseFloat((sum / maxSemester).toFixed(2));

          // Save EVERYTHING to DB
          await saveVerifiedAcademicData(userId, {
            astuRollNo: detectedAstuRollNo,
            cgpa: averageCgpa,
            semesters: extractedSgpas,
            backlog: detectedBacklog,
            backlogSubjects: Array.from(detectedBacklogSubjects),
            verificationReason: "Automated document extraction successful."
          });

          console.log(`[VERIFIED] Student ${userId} successfully verified. RollNo: ${detectedAstuRollNo}, CGPA: ${averageCgpa}, Backlogs: ${detectedBacklogSubjects.size}`);

        } else {
          const finalReason = mismatchDetails.length > 0 
            ? mismatchDetails.join(" ") 
            : !allDocsProcessed 
              ? "Some documents could not be read. Please ensure all uploads are clear PDFs."
              : "No valid academic data could be extracted.";
            
          await updateVerificationStatus(userId, VerificationStatus.FAILED, finalReason);
          console.log(`[Verification Worker] Job FAILED for ${userId} -> Reason: ${finalReason}`);
        }

        // 5. Redis Cache Purge (Executed for both SUCCESS and FAILURE to keep UI in sync)
        const cacheClient = getRedisConnectionForCaching();
        const profileKey = CACHE_KEYS.STUDENT_PROFILE(userId);
        const sessionKey = CACHE_KEYS.USER_SESSION(userId);
        
        await Promise.all([
          cacheClient.del(profileKey),
          cacheClient.del(sessionKey)
        ]);
        console.log(`[Verification Worker] Cache Invalidated for user ${userId}`);

      } catch (error: any) {
        console.error(`[Verification Worker] Fatal error for job ${job.id}:`, error.message);
        // Job will retry automatically via BullMQ attempts
      }
    },
    {
      connection: getRedisConnection() as any,
      concurrency: 5,
    }
  );

  // Monitor permanent failures (after all retries)
  verificationWorker.on("failed", async (job, error) => {
    console.error(`[Verification Worker] Job ${job?.id} failed permanently:`, error.message);
    
    if (job?.data?.userId) {
      try {
        await updateVerificationStatus(
          job.data.userId, 
          VerificationStatus.FAILED, 
          "System error during document processing. Please try again or contact support."
        );
        
        // Purge cache so student sees the FAILED status
        const cacheClient = getRedisConnectionForCaching();
        await cacheClient.del(CACHE_KEYS.STUDENT_PROFILE(job.data.userId));
        console.log(`[Verification Worker] Reset status to FAILED for user ${job.data.userId}`);
      } catch (dbError: any) {
        console.error(`[Verification Worker] Failed to reset status in DB:`, dbError.message);
      }
    }
  });

  console.log(`[Verification Worker] Initialized and listening for jobs...`);
};
