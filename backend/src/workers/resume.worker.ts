import { Worker, Job } from "bullmq";
import { getRedisConnection } from "../configs/redis.config.js";
import { RESUME_QUEUE_NAME, type ResumeJobPayload } from "../queues/resume.queue.js";
import { 
  updateResumeJson, 
  findResumeById, 
  updateResumePdfUrl 
} from "../modules/students/repositories/resume.repository.js";
import { uploadToCloudinary } from "../utils/fileHandler/cloudinary.js";
import { generateResumeHtml } from "../utils/templates/resumeTemplate.js";
import { RunnableSequence } from "@langchain/core/runnables";
import { llm } from "../configs/langchain.config.js";
import { resumeJsonSchema, type ResumeGenerationInput } from "../types/students/resume.js";
import { AUDIT_PROMPT, GENERATION_PROMPT, ROLE_IDENTIFICATION_PROMPT } from "../utils/prompts/resumePrompts.js";
import puppeteer from "puppeteer";
import fs from "fs/promises";
import path from "path";
import { InternalServerError } from "../utils/errors/httpErrors.js";




// AI-Driven Resume Generation Chain (Audit -> Identity Role -> Generate)
const structuredLlm = llm.withStructuredOutput(resumeJsonSchema);

const resumeGenerationChain = RunnableSequence.from([
  {
    // Stage 1: Fact Audit
    auditedFacts: async (input: ResumeGenerationInput) => {
      const chain = AUDIT_PROMPT.pipe(llm);
      const res = await (chain as any).invoke({ profileData: JSON.stringify(input.profileData) });
      return res.content;
    },
    // Pass along raw inputs
    branch: (input: ResumeGenerationInput) => input.branch,
    profileData: (input: ResumeGenerationInput) => JSON.stringify(input.profileData),
  },
  {
    // Stage 2: Branch-Specific Role Identification
    identifiedRole: async (input: any) => {
      const chain = ROLE_IDENTIFICATION_PROMPT.pipe(llm);
      const res = await (chain as any).invoke({
        auditedFacts: input.auditedFacts,
        branch: input.branch
      });
      return res.content;
    },
    // Pass along previous audit and full context
    auditedFacts: (input: any) => input.auditedFacts,
    branch: (input: any) => input.branch,
    profileData: (input: any) => input.profileData,
  },
  // Stage 3: High-Impact Fresher Generation (Directly to Structured Output)
  GENERATION_PROMPT,
  structuredLlm
]);

// Initialize the Resume Worker.
// Processes AI Generation and PDF Export jobs in the background.
export const initializeResumeWorker = async () => {
  const resumeWorker = new Worker(
    RESUME_QUEUE_NAME,
    async (job: Job<ResumeJobPayload>) => {
      const { type, userId, resumeId, profileData, branch } = job.data;
      console.log(`[Resume Worker] Processing ${type} for user ${userId}...`);

      try {
        if (type === "GENERATE_RESUME") {
          if (!resumeId) throw new Error("Resume ID missing for generation job.");

          // 1. AI Generation
          const generatedResume = await resumeGenerationChain.invoke({
            profileData: JSON.parse(profileData || "{}"),
            branch: branch as any
          });

          // 2. Persistence: Update the existing placeholder record
          await updateResumeJson(resumeId, generatedResume);
          
          console.log(`[Resume Worker] Successfully generated resume content for ID ${resumeId}`);
        } 
        
        else if (type === "EXPORT_RESUME") {
          if (!resumeId) throw new Error("Resume ID missing for export job.");

          // 1. Fetch Resume JSON
          const resume = await findResumeById(resumeId);
          if (!resume) throw new Error(`Resume with ID ${resumeId} not found.`);

          // 2. Generate HTML from Template
          const htmlContent = generateResumeHtml(resume.jsonData as any);

          // 3. Launch Puppeteer to capture PDF
          const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
          });

          try {
            const page = await browser.newPage();
            await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
            const pdfBuffer = await page.pdf({
              format: 'A4',
              printBackground: true,
              margin: { top: '0', bottom: '0', left: '0', right: '0' }
            });

            // 4. Temporarily save to local disk for Cloudinary upload utility
            const tempDir = path.join(process.cwd(), "public/temp");
            if (!(await fs.access(tempDir).catch(() => false))) {
              await fs.mkdir(tempDir, { recursive: true });
            }
            const tempPath = path.join(tempDir, `resume-${resumeId}-${Date.now()}.pdf`);
            await fs.writeFile(tempPath, Buffer.from(pdfBuffer));

            // 5. Upload to Cloudinary (using 'raw' for PDFs is more reliable than 'auto' or 'image' delivery)
            const uploadResult = await uploadToCloudinary(tempPath, "exported_resumes", "raw");
            
            // 6. Update Database with PDF URL
            await updateResumePdfUrl(resumeId, uploadResult.secure_url);

            // 7. Cleanup temp file
            await fs.unlink(tempPath).catch(() => {});

            console.log(`[Resume Worker] Successfully exported PDF for resume ${resumeId}`);
          } finally {
            await browser.close();
          }
        }
      } catch (error: any) {
        console.error(`[Resume Worker] Failed to process ${type} job ${job.id}:`, error.message);
        throw new InternalServerError(`${type} failed: ${error.message}`);
      }
    },
    {
      connection: getRedisConnection() as any,
      concurrency: 2, // Allow 2 generation/exports in parallel
    }
  );

  resumeWorker.on("failed", (job, error) => {
    console.error(`❌ Resume job ${job?.id} failed for user ${job?.data.userId}:`, error);
  });

  resumeWorker.on("completed", (job) => {
    console.log(`✅ Resume job ${job.id} completed successfully for user ${job.data.userId}`);
  });

  console.log(`[Resume Worker] Initialized worker for queue: ${RESUME_QUEUE_NAME}`);
};
