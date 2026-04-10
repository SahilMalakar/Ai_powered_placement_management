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

            // Backlog Detection Logic (Simplified: Check for 'F' grade per doc)
            // TODO: Enhance this with specific subject extraction if needed
            if (text.includes(" F ") || text.toLowerCase().includes("fail")) {
              detectedBacklog = true;
              // Extracting subject next to 'F' as a heuristic
              const failMatch = text.match(/([A-Z0-9-]+)\s*F/g);
              if (failMatch) failMatch.forEach(m => detectedBacklogSubjects.add(m.split(" ")[0]!));
            }

            // Add to aggregation
            extractedSgpas.push({ semester: doc.semester, sgpa });

          } catch (error: any) {
            isOverallCorrect = false;
            mismatchDetails.push(`Sem ${doc.semester}: OCR/Structural error.`);
          }
        }

        // 4. Final Processing & Persistence
        if (isOverallCorrect && extractedSgpas.length > 0 && detectedAstuRollNo) {
          // Calculate CGPA
          const sum = extractedSgpas.reduce((acc, curr) => acc + curr.sgpa, 0);
          const averageCgpa = parseFloat((sum / extractedSgpas.length).toFixed(2));

          // Save EVERYTHING to DB
          await saveVerifiedAcademicData(userId, {
            astuRollNo: detectedAstuRollNo,
            cgpa: averageCgpa,
            semesters: extractedSgpas,
            backlog: detectedBacklog,
            backlogSubjects: Array.from(detectedBacklogSubjects),
            verificationReason: "Automated document extraction successful."
          });

          console.log(`[Verification Worker] Job completed for ${userId} -> Status: VERIFIED`);
        } else {
          const finalReason = mismatchDetails.length > 0 
            ? mismatchDetails.join(" ") 
            : "No valid academic data could be extracted.";
            
          await updateVerificationStatus(userId, VerificationStatus.FAILED, finalReason);
          console.log(`[Verification Worker] Job FAILED for ${userId} -> Reason: ${finalReason}`);
        }

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

  // Monitor failures
  verificationWorker.on("failed", (job, error) => {
    console.error(`[Verification Worker] Job ${job?.id} failed:`, error.message);
  });

  console.log(`[Verification Worker] Initialized and listening for jobs...`);
};
