import { Worker, Job } from "bullmq";
import { getRedisConnection } from "../configs/redis.config.js";
import { ATS_QUEUE_NAME, type ATSJobPayload } from "../queues/ats.queue.js";
import { llm } from "../configs/langchain.config.js";
import { ATS_ANALYSIS_PROMPT } from "../utils/prompts/atsPrompts.js";
import { ATSResultSchema } from "../types/students/ats.js";
import { createAtsResult } from "../modules/students/repositories/ats.repository.js";
import { InternalServerError } from "../utils/errors/httpErrors.js";

// Initialize the ATS Worker.
// Listens for jobs on the 'atsQueue' and performs LLM-based analysis.
export const initializeAtsWorker = async () => {
  const structuredLlm = llm.withStructuredOutput(ATSResultSchema as any);

  const atsWorker = new Worker(
    ATS_QUEUE_NAME,
    async (job: Job<ATSJobPayload>) => {
      console.log(`[ATS Worker] Processing job ${job.id} for user ${job.data.userId}...`);

      const { userId, resumeText, jobDescription } = job.data;

      try {
        // Build and invoke the LangChain analysis chain
        const chain = ATS_ANALYSIS_PROMPT.pipe(structuredLlm);
        const result = await chain.invoke({
          resumeText,
          jobDescription,
        });

        // Save the structured result to the database
        await createAtsResult(userId, jobDescription, result as any);

        console.log(`[ATS Worker] Successfully processed job ${job.id}`);
      } catch (error: any) {
        console.error(`[ATS Worker] Failed to process job ${job.id}:`, error.message);
        throw new InternalServerError(`ATS Analysis failed: ${error.message}`);
      }
    },
    {
      connection: getRedisConnection() as any,
      concurrency: 2, // Process up to 2 analyses in parallel
    }
  );

  atsWorker.on("failed", (job, error) => {
    console.error(`❌ ATS job ${job?.id} failed for user ${job?.data.userId}:`, error);
  });

  atsWorker.on("completed", (job) => {
    console.log(`✅ ATS job ${job.id} completed successfully for user ${job.data.userId}`);
  });

  console.log(`[ATS Worker] Initialized worker for queue: ${ATS_QUEUE_NAME}`);
};
