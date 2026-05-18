import { addExportJobToQueue } from '../../../queues/export.queue.js';
import { getRedisConnectionForCaching } from '../../../configs/redis.config.js';
import { CACHE_KEYS } from '../../../utils/cacheKeys.js';
import { NotFoundError } from '../../../utils/errors/httpErrors.js';
import type { ExportRequestInput, ExportJobResult } from '../../../types/admin/export.js';

export const requestExportService = async (payload: ExportRequestInput, userId: number) => {
    // 1. Queue the BullMQ job
    const job = await addExportJobToQueue({
        ...payload,
        requestedBy: userId,
    });

    // 2. Store initial processing state in Redis (Expires in 1 hour)
    const cacheClient = getRedisConnectionForCaching();
    const cacheKey = CACHE_KEYS.EXPORT_JOB(job.id!);
    const initialResult: ExportJobResult = {
        status: 'processing',
        createdAt: new Date().toISOString(),
    };
    await cacheClient.set(cacheKey, JSON.stringify(initialResult), 'EX', 3600);

    return { jobId: job.id };
};

export const getExportStatusService = async (jobId: string) => {
    const cacheClient = getRedisConnectionForCaching();
    const cacheKey = CACHE_KEYS.EXPORT_JOB(jobId);
    const cachedData = await cacheClient.get(cacheKey);

    if (!cachedData) {
        throw new NotFoundError('Export job not found or expired');
    }

    const jobResult: ExportJobResult = JSON.parse(cachedData);
    return jobResult;
};
