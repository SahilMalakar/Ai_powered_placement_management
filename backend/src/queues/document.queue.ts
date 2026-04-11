import { Queue } from 'bullmq';
import { getRedisConnection } from '../configs/redis.config.js';
import { InternalServerError } from '../utils/errors/httpErrors.js';
import { DocumentType } from '../prisma/generated/prisma/enums.js';

export const DOCUMENT_QUEUE_NAME = 'documentQueue';

// Payload structure for each individual file in a bulk upload job.
export interface DocumentJobFile {
    fieldname: string;
    filePath: string; // Local temp file path (Multer disk storage)
    type: DocumentType;
    folder: string; // Cloudinary folder: "marksheets" or "certificates"
    semester: number | null;
}

// Payload for a full bulk upload job (may contain multiple files).
export interface DocumentJobPayload {
    userId: number;
    files: DocumentJobFile[];
}

// Initialize the Document Upload Queue.
export const documentQueue = new Queue(DOCUMENT_QUEUE_NAME, {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    connection: getRedisConnection() as any,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 3000,
        },
        removeOnComplete: true,
        removeOnFail: false, // Keep failed jobs for debugging
    },
});

// Adds a new bulk document upload job to the queue.
export const addDocumentJobToQueue = async (payload: DocumentJobPayload) => {
    try {
        const job = await documentQueue.add(DOCUMENT_QUEUE_NAME, payload);
        return job;
    } catch (error: unknown) {
        console.error('[Document Queue] Error while adding job:', error);
        throw new InternalServerError('Failed to queue document upload.');
    }
};
