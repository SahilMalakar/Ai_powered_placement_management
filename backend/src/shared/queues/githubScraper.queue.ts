import { Queue } from 'bullmq';
import { getRedisConnection } from '../../infra/redis.config.js';
import type { GithubScraperJobPayload } from '../types/students/githubScraper.js';
import { InternalServerError } from '../utils/errors/httpErrors.js';

export const GITHUB_SCRAPER_QUEUE_NAME = 'githubScraperQueue';

export const githubScraperQueue = new Queue(GITHUB_SCRAPER_QUEUE_NAME, {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    connection: getRedisConnection() as any,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 3000,
        },
        removeOnComplete: true,
        removeOnFail: false,
    },
});

export const addGithubScraperJobToQueue = async (payload: GithubScraperJobPayload) => {
    try {
        const job = await githubScraperQueue.add(GITHUB_SCRAPER_QUEUE_NAME, payload);
        return job;
    } catch (error: unknown) {
        console.error('[GitHub Scraper Queue] Error while adding job:', error);
        throw new InternalServerError('Failed to queue GitHub scrape.');
    }
};
