import { prisma } from '../../../prisma/prisma.js';
import { addGithubScraperJobToQueue } from '../../../shared/queues/githubScraper.queue.js';
import { NotFoundError } from '../../../shared/utils/errors/httpErrors.js';
import { getRedisConnectionForCaching } from '../../../infra/redis.config.js';
import { CACHE_KEYS } from '../../../shared/utils/cacheKeys.js';

export const requestGithubScrapeService = async (
    userId: number,
    githubUrl: string
) => {
    const profile = await prisma.studentProfile.findUnique({
        where: { userId },
        select: { id: true },
    });
    if (!profile) throw new NotFoundError('Student profile not found');

    const job = await addGithubScraperJobToQueue({ userId, githubUrl });
    return { jobId: job.id };
};

export const getGithubScrapeStatusService = async (jobId: string) => {
    const cache = getRedisConnectionForCaching();
    const cacheKey = CACHE_KEYS.GITHUB_SCRAPE_JOB(jobId);
    const cachedData = await cache.get(cacheKey);

    if (!cachedData) {
        throw new NotFoundError('GitHub scrape job not found or expired');
    }

    return JSON.parse(cachedData);
};

