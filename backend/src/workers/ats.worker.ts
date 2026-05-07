import { Worker, Job, UnrecoverableError } from 'bullmq';
import { getRedisConnection } from '../configs/redis.config.js';
import { ATS_QUEUE_NAME, type ATSJobPayload } from '../queues/ats.queue.js';
import { llm } from '../configs/langchain.config.js';
import { ATS_ANALYSIS_PROMPT } from '../utils/prompts/atsPrompts.js';
import { ATSResultSchema } from '../types/students/ats.js';
import { updateAtsResult } from '../modules/students/repositories/ats.repository.js';
import { InternalServerError } from '../utils/errors/httpErrors.js';

// Initialize the ATS Worker.
export const initializeAtsWorker = async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const structuredLlm = llm.withStructuredOutput(ATSResultSchema as any);

    const atsWorker = new Worker(
        ATS_QUEUE_NAME,
        async (job: Job<ATSJobPayload>) => {
            const { atsResultId, userId, resumeText, jobDescription } = job.data;

            console.log(
                `[ATS Worker] Processing job ${job.id} for analysis ${atsResultId}...`
            );

            try {
                // 1. Mark as PROCESSING
                await updateAtsResult(atsResultId, { status: 'PROCESSING' });

                // 2. Build and invoke the LangChain analysis chain
                const chain = ATS_ANALYSIS_PROMPT.pipe(structuredLlm);
                const result = await chain.invoke({
                    resumeText,
                    jobDescription: jobDescription || 'General domain analysis',
                });

                // 3. Save the structured result and mark as COMPLETED
                await updateAtsResult(atsResultId, {
                    ...(result as any),
                    status: 'COMPLETED',
                });

                console.log(
                    `[ATS Worker] Successfully processed analysis ${atsResultId}`
                );
            } catch (error: any) {
                const message = error?.message || 'Unknown error';
                const isRateLimit = message.includes('429');

                console.error(
                    `[ATS Worker] Failed to process analysis ${atsResultId}:`,
                    message
                );

                // Mark as FAILED in database
                await updateAtsResult(atsResultId, { status: 'FAILED' }).catch(
                    () => {}
                );

                if (isRateLimit) {
                    console.warn(`[ATS Worker] Rate limit reached.`);
                    throw new UnrecoverableError(`Rate limit reached: ${message}`);
                }

                throw new InternalServerError(
                    `ATS Analysis failed: ${message}`
                );
            }
        },
        {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            connection: getRedisConnection() as any,
            concurrency: 2,
        }
    );

    atsWorker.on('failed', (job, error) => {
        console.error(
            `❌ ATS job ${job?.id} failed for user ${job?.data.userId}:`,
            error
        );
    });

    atsWorker.on('completed', (job) => {
        console.log(
            `✅ ATS job ${job.id} completed successfully for user ${job.data.userId}`
        );
    });

    console.log(`[ATS Worker] Initialized worker for queue: ${ATS_QUEUE_NAME}`);
};

