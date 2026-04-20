import { Worker, Job, UnrecoverableError } from 'bullmq';
import { getRedisConnection } from '../configs/redis.config.js';
import {
    DOCUMENT_QUEUE_NAME,
    type DocumentJobPayload,
} from '../queues/document.queue.js';
import {
    uploadToCloudinary,
    deleteFromCloudinary,
} from '../utils/fileHandler/cloudinary.js';
import {
    upsertDocument,
    findDocumentBySemester,
} from '../modules/students/repositories/document.repository.js';
import fs from 'fs/promises';

// Initialize the Document Upload Worker.
// Listens for jobs on the 'documentQueue' and performs Cloudinary uploads + DB writes.
export const initializeDocumentWorker = () => {
    const documentWorker = new Worker(
        DOCUMENT_QUEUE_NAME,
        async (job: Job<DocumentJobPayload>) => {
            const { userId, files } = job.data;
            console.log(
                `[Document Worker] Processing job ${job.id} for user ${userId} (${files.length} file(s))...`
            );

            for (const fileEntry of files) {
                const { fieldname, filePath, type, folder, semester } =
                    fileEntry;
                const semesterUndefined =
                    semester === null ? undefined : semester;
                let newPublicId: string | null = null;

                try {
                    // 1. Conflict Check: Find existing doc for Cloudinary cleanup
                    const existing = await findDocumentBySemester(
                        userId,
                        type,
                        semesterUndefined
                    );
                    const oldPublicId = existing?.publicId;

                    // 2. Upload new file to Cloudinary
                    const cloudRes = await uploadToCloudinary(filePath, folder);
                    newPublicId = cloudRes.public_id;

                    // 3. Sync with DB (upserts, restores soft-deleted records)
                    await upsertDocument(
                        userId,
                        type,
                        cloudRes.secure_url,
                        cloudRes.public_id,
                        semesterUndefined
                    );

                    // 4. DB confirmed — delete old Cloudinary file
                    if (oldPublicId) {
                        deleteFromCloudinary(oldPublicId).catch((err) =>
                            console.error(
                                `[Document Worker] Cloudinary cleanup failed for ${oldPublicId}:`,
                                err.message
                            )
                        );
                    }

                    console.log(
                        `[Document Worker] ✅ ${fieldname} processed for user ${userId}`
                    );
                } catch (err: any) {
                    const message =
                        err instanceof Error ? err.message : 'Unknown error';
                    const isRateLimit = message.includes('429');

                    // Compensate: delete newly uploaded Cloudinary file if DB write fails
                    if (newPublicId) {
                        deleteFromCloudinary(newPublicId).catch((e) =>
                            console.error(
                                `[Document Worker] Orphan cleanup failed for ${newPublicId}:`,
                                e instanceof Error ? e.message : e
                            )
                        );
                    }
                    console.error(
                        `[Document Worker] ❌ Failed to process ${fieldname}:`,
                        message
                    );

                    if (isRateLimit) {
                        console.warn(`[Document Worker] Rate limit reached. Marking job as permanently failed.`);
                        throw new UnrecoverableError(`Rate limit reached: ${message}`);
                    }

                    throw err; // Trigger BullMQ retry for other errors
                } finally {
                    // Always cleanup the local temp file from disk
                    await fs.unlink(filePath).catch(() => {});
                }
            }
        },
        {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            connection: getRedisConnection() as any,
            concurrency: 3, // Process up to 3 bulk upload jobs in parallel
        }
    );

    documentWorker.on('failed', (job, error) => {
        console.error(
            `❌ Document job ${job?.id} failed for user ${job?.data.userId}:`,
            error.message
        );
    });

    documentWorker.on('completed', (job) => {
        console.log(
            `✅ Document job ${job.id} completed for user ${job.data.userId}`
        );
    });

    console.log(
        `[Document Worker] Initialized worker for queue: ${DOCUMENT_QUEUE_NAME}`
    );
};
