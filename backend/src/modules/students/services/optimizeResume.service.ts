import {
    createResumeRepository,
    getAllResumesRepository,
    getNextVersionRepository,
    getResumeByIdRepository,
    softDeleteResumeRepository,
} from '../repositories/optimizeResume.repository.js';
import { addOptimizeResumeJobToQueue } from '../../../shared/queues/optimizeResume.queue.js';
import { getRedisConnectionForCaching } from '../../../infra/redis.config.js';
import { CACHE_KEYS } from '../../../shared/utils/cacheKeys.js';
import { NotFoundError } from '../../../shared/utils/errors/httpErrors.js';

export const requestOptimizeResumeService = async (userId: number, rawText: string) => {
    const version = await getNextVersionRepository(userId);
    const resume = await createResumeRepository(userId, version);
    const job = await addOptimizeResumeJobToQueue({ userId, rawText, resumeId: resume.id });

    const cache = getRedisConnectionForCaching();
    await cache.set(
        CACHE_KEYS.RESUME_JOB(job.id!),
        JSON.stringify({ status: 'processing', createdAt: new Date().toISOString() }),
        'EX',
        3600
    );

    return { jobId: job.id, resumeId: resume.id };
};

export const getResumeByIdService = async (id: number, userId: number) => {
    const resume = await getResumeByIdRepository(id, userId);
    if (!resume) throw new NotFoundError('Resume not found');
    return resume;
};

export const getAllResumesService = async (userId: number) => {
    return getAllResumesRepository(userId);
};

export const deleteResumeService = async (id: number, userId: number) => {
    const resume = await getResumeByIdRepository(id, userId);
    if (!resume) throw new NotFoundError('Resume not found');
    await softDeleteResumeRepository(id, userId);
};

export const getOptimizeResumeJobStatusService = async (jobId: string) => {
    const cache = getRedisConnectionForCaching();
    const cacheKey = CACHE_KEYS.RESUME_JOB(jobId);
    const cachedData = await cache.get(cacheKey);

    if (!cachedData) {
        throw new NotFoundError('Resume optimization job not found or expired');
    }

    return JSON.parse(cachedData);
};
