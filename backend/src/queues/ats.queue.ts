import { Queue } from 'bullmq';
import { getRedisConnection } from '../configs/redis.config.js';
import { InternalServerError } from '../utils/errors/httpErrors.js';

export const ATS_QUEUE_NAME = 'atsQueue';

// Initialize the ATS Analysis Queue.
export const atsQueue = new Queue(ATS_QUEUE_NAME, {
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

// Interface for ATS job payload.
export interface ATSJobPayload {
    userId: number;
    resumeText: string;
    jobDescription: string;
}

// Adds a new ATS analysis job to the queue.
export const addAtsJobToQueue = async (payload: ATSJobPayload) => {
    try {
        const job = await atsQueue.add(ATS_QUEUE_NAME, payload);
        return job;
    } catch (error: unknown) {
        console.error('Error while adding ATS job to queue:', error);
        throw new InternalServerError('Failed to queue ATS analysis.');
    }
};
