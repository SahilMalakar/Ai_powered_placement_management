import { Worker, Job } from "bullmq";
import { getRedisConnection } from "../configs/redis.config.js";
import { VERIFICATION_QUEUE_NAME, type VerificationJobPayload } from "../queues/verification.queue.js";
import { findProfileByUserId } from "../modules/students/repositories/student.repository.js";
import { 
  getStudentSgpaDocuments, 
  getSemesterResults, 
  updateVerificationStatus 
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
        // 1. Fetch data from repositories (Ensures layered architecture)
        const [profile, sgpaDocs, dbSgpas] = await Promise.all([
          findProfileByUserId(userId),
          getStudentSgpaDocuments(userId),
          getSemesterResults(userId)
        ]);

        if (!profile) throw new Error("Student profile not found");
        
        let isOverallCorrect = true;
        const mismatchDetails: string[] = [];

        // 2. Map SGPAs by semester for efficient lookup
        const expectedSgpas = new Map(dbSgpas.map(s => [s.semester, s.sgpa]));

        // 3. Process each marksheet PDF sequentially
        for (const doc of sgpaDocs) {
          if (!doc.url || doc.semester == null) continue;

          try {
            // Download PDF buffer from Cloudinary URL
            const response = await fetch(doc.url);
            if (!response.ok) throw new Error(`Download failed for semester ${doc.semester}`);
            
            const buffer = Buffer.from(await response.arrayBuffer());
            const text = await extractTextFromPdfBuffer(buffer);

            // Zod Validation & Extraction: Uses the transformer schema to pluck Roll No, Name, and SGPA
            const zodResult = verificationRawTextSchema.safeParse(text);

            if (!zodResult.success) {
              isOverallCorrect = false;
              mismatchDetails.push(`Sem ${doc.semester}: Unified layout extraction failed (Invalid document).`);
              continue;
            }

            const { rollNo, name, sgpa } = zodResult.data;

            // Comparison: Roll Number (Normalized match)
            const expectedRoll = profile.astuRollNo.toLowerCase().replace(/[^a-z0-9]/g, '');
            if (rollNo !== expectedRoll) {
              isOverallCorrect = false;
              mismatchDetails.push(`Sem ${doc.semester}: Roll No mismatch.`);
            }

            // Comparison: Name (Token-based match)
            if (!validateNameTokens(profile.fullName, name)) {
              isOverallCorrect = false;
              mismatchDetails.push(`Sem ${doc.semester}: Name mismatch.`);
            }

            // Comparison: SGPA (0.01 float tolerance)
            const expectedSgpa = expectedSgpas.get(doc.semester);
            if (expectedSgpa !== undefined && Math.abs(expectedSgpa - sgpa) > 0.01) {
              isOverallCorrect = false;
              mismatchDetails.push(`Sem ${doc.semester}: SGPA mismatch.`);
            }

          } catch (error: any) {
            isOverallCorrect = false;
            mismatchDetails.push(`Sem ${doc.semester}: Structural error or invalid file.`);
            console.error(`[Worker Error] ${error.message}`);
          }
        }

        // 4. Update Final DB Status strictly (VERIFIED or FAILED only)
        const finalStatus = isOverallCorrect ? VerificationStatus.VERIFIED : VerificationStatus.FAILED;
        const finalReason = isOverallCorrect ? "Automated verification successful." : mismatchDetails.join(" ");

        await updateVerificationStatus(userId, finalStatus, finalReason);
        console.log(`[Verification Worker] Job completed for ${userId} -> Result: ${finalStatus}`);

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
