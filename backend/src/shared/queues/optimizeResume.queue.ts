import { Queue } from 'bullmq';
import { getRedisConnection } from '../../infra/redis.config.js';
import type { OptimizeResumeJobPayload } from '../types/students/optimizeResume.js';
import { InternalServerError } from '../utils/errors/httpErrors.js';

export const OPTIMIZE_RESUME_QUEUE_NAME = 'optimizeResumeQueue';

export const optimizeResumeQueue = new Queue(OPTIMIZE_RESUME_QUEUE_NAME, {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    connection: getRedisConnection() as any,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 5000,
        },
        removeOnComplete: true,
        removeOnFail: false,
    },
});

export const addOptimizeResumeJobToQueue = async (payload: OptimizeResumeJobPayload) => {
    try {
        const job = await optimizeResumeQueue.add(OPTIMIZE_RESUME_QUEUE_NAME, payload);
        return job;
    } catch (error: unknown) {
        console.error('[Optimize Resume Queue] Error while adding job:', error);
        throw new InternalServerError('Failed to queue resume optimization.');
    }
};
