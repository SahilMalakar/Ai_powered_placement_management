import { Worker, Job, UnrecoverableError } from 'bullmq';
import { getRedisConnection } from '../configs/redis.config.js';
import {
    RESUME_QUEUE_NAME,
    type ResumeJobPayload,
} from '../queues/resume.queue.js';
import {
    updateResumeJson,
    findResumeById,
    updateResumePdfUrl,
} from '../modules/students/repositories/resume.repository.js';
import { uploadBufferToCloudinary } from '../utils/fileHandler/cloudinary.js';
import { ResumeTemplate } from '../utils/templates/resumeTemplate.js';
import { renderToBuffer } from '@react-pdf/renderer';
import React from 'react';
import { RunnableSequence } from '@langchain/core/runnables';
import { llm } from '../configs/langchain.config.js';
import {
    resumeJsonSchema,
    type ResumeGenerationInput,
} from '../types/students/resume.js';
import {
    AUDIT_PROMPT,
    GENERATION_PROMPT,
    ROLE_IDENTIFICATION_PROMPT,
} from '../utils/prompts/resumePrompts.js';
import { InternalServerError } from '../utils/errors/httpErrors.js';

// AI-Driven Resume Generation Chain (Audit -> Identity Role -> Generate)
const structuredLlm = llm.withStructuredOutput(resumeJsonSchema);

const resumeGenerationChain = RunnableSequence.from([
    {
        // Stage 1: Fact Audit
        auditedFacts: async (input: ResumeGenerationInput) => {
            const chain = AUDIT_PROMPT.pipe(llm);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const res = await (chain as any).invoke({
                profileData: JSON.stringify(input.profileData),
            });
            return res.content;
        },
        branch: (input: ResumeGenerationInput) => input.branch,
        profileData: (input: ResumeGenerationInput) =>
            JSON.stringify(input.profileData),
    },
    {
        // Stage 2: Branch-Specific Role Identification
        identifiedRole: async (input: Record<string, unknown>) => {
            const chain = ROLE_IDENTIFICATION_PROMPT.pipe(llm);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const res = await (chain as any).invoke({
                auditedFacts: input.auditedFacts,
                branch: input.branch,
            });
            return res.content;
        },
        auditedFacts: (input: Record<string, unknown>) => input.auditedFacts,
        branch: (input: Record<string, unknown>) => input.branch,
        profileData: (input: Record<string, unknown>) => input.profileData,
    },
    // Stage 3: High-Impact Generation (Directly to Structured Output)
    GENERATION_PROMPT,
    structuredLlm,
]);

// Initialize the Resume Worker.
// Processes AI Generation and PDF Export jobs in the background.
export const initializeResumeWorker = async () => {
    const resumeWorker = new Worker(
        RESUME_QUEUE_NAME,
        async (job: Job<ResumeJobPayload>) => {
            const { type, userId, resumeId, profileData, branch } = job.data;
            console.log(
                `[Resume Worker] Processing ${type} for user ${userId}...`
            );

            try {
                if (type === 'GENERATE_RESUME') {
                    if (!resumeId)
                        throw new Error(
                            'Resume ID missing for generation job.'
                        );

                    // 1. AI Generation
                    const generatedResume = await resumeGenerationChain.invoke({
                        profileData: profileData || {},
                        branch: branch as string,
                    });

                    // 2. Persistence: Ensure the record still exists before updating
                    const resumeExists = await findResumeById(resumeId);
                    if (!resumeExists) {
                        console.warn(
                            `[Resume Worker] Resume record ${resumeId} was deleted. Skipping persistence.`
                        );
                        return;
                    }

                    await updateResumeJson(resumeId, generatedResume);

                    console.log(
                        `[Resume Worker] Successfully generated resume content for ID ${resumeId}`
                    );
                } else if (type === 'EXPORT_RESUME') {
                    if (!resumeId)
                        throw new Error('Resume ID missing for export job.');

                    // 1. Fetch Resume JSON
                    const resume = await findResumeById(resumeId);
                    if (!resume)
                        throw new Error(
                            `Resume with ID ${resumeId} not found.`
                        );

                    // 2. Validate resume data before rendering
                    const jsonData = resume.jsonData as Record<string, unknown>;
                    const validation = resumeJsonSchema.safeParse(jsonData);

                    if (!validation.success) {
                        const issues = validation.error.issues
                            .map((i) => `${i.path.join('.')}: ${i.message}`)
                            .join('; ');
                        throw new Error(
                            `Resume data is incomplete or invalid. AI generation may still be in progress. Details: ${issues}`
                        );
                    }

                    // 3. Render PDF to Buffer using @react-pdf/renderer
                    const pdfBuffer = await renderToBuffer(
                        <ResumeTemplate data={validation.data} />
                    );

                    // 4. Upload Buffer directly to Cloudinary
                    const uploadResult = await uploadBufferToCloudinary(
                        pdfBuffer,
                        'exported_resumes',
                        'image' // Changed from 'raw' to 'image' for proper PDF handling
                    );

                    // 5. Update Database with PDF URL
                    await updateResumePdfUrl(resumeId, uploadResult.secure_url);

                    console.log(
                        `[Resume Worker] Successfully exported PDF for resume ${resumeId}`
                    );
                }
            } catch (error: any) {
                const message = error?.message || 'Unknown error';
                const isRateLimit = message.includes('429');

                console.error(
                    `[Resume Worker] Failed to process ${type} job ${job.id}:`,
                    message
                );

                if (isRateLimit) {
                    console.warn(`[Resume Worker] Rate limit reached. Marking job as permanently failed to avoid token waste.`);
                    throw new UnrecoverableError(`Rate limit reached: ${message}`);
                }

                throw new InternalServerError(`${type} failed: ${message}`);
            }
        },
        {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            connection: getRedisConnection() as any,
            concurrency: 2,
        }
    );

    resumeWorker.on('failed', (job, error) => {
        console.error(
            `❌ Resume job ${job?.id} failed for user ${job?.data.userId}:`,
            error
        );
    });

    resumeWorker.on('completed', (job) => {
        console.log(
            `✅ Resume job ${job.id} completed successfully for user ${job.data.userId}`
        );
    });

    console.log(
        `[Resume Worker] Initialized worker for queue: ${RESUME_QUEUE_NAME}`
    );
};
