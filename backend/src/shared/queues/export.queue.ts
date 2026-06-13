import { Queue } from 'bullmq';
import { getRedisConnection } from '../../infra/redis.config.js';
import type { ExportRequestInput } from '../types/admin/export.js';
import { InternalServerError } from '../utils/errors/httpErrors.js';


export const EXPORT_QUEUE_NAME = 'exportQueue';

export interface ExportJobPayload extends ExportRequestInput {
    requestedBy: number; // Admin userId
}

export const exportQueue = new Queue(EXPORT_QUEUE_NAME, {
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

export const addExportJobToQueue = async (payload: ExportJobPayload) => {
    try {
        const job = await exportQueue.add(EXPORT_QUEUE_NAME, payload);
        return job;
    } catch (error: unknown) {
        console.error('[Export Queue] Error while adding job:', error);
        throw new InternalServerError('Failed to queue CSV export.');
    }
};
