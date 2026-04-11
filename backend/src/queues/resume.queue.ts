import { Queue } from 'bullmq';
import { getRedisConnection } from '../configs/redis.config.js';
import { InternalServerError } from '../utils/errors/httpErrors.js';

export const RESUME_QUEUE_NAME = 'resumeQueue';

// initialize the queue instance
export const resumeQueue = new Queue(RESUME_QUEUE_NAME, {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    connection: getRedisConnection() as any,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 5000,
        },
        removeOnComplete: true,
    },
});

export type ResumeJobType = 'GENERATE_RESUME' | 'EXPORT_RESUME';

export interface ResumeJobPayload {
    type: ResumeJobType;
    userId: number;
    resumeId?: number; // Needed for EXPORT
    profileData?: Record<string, unknown>; // Needed for GENERATE
    branch?: string; // Needed for GENERATE
}

// Adds a new resume-related job to the queue
export const addResumeJobToQueue = async (payload: ResumeJobPayload) => {
    try {
        const job = await resumeQueue.add(payload.type, payload);
        return job;
    } catch (error: unknown) {
        console.error(
            `Error while adding ${payload.type} job to queue:`,
            error
        );
        throw new InternalServerError(
            `Failed to queue resume ${payload.type.toLowerCase().replace('_', ' ')}.`
        );
    }
};
