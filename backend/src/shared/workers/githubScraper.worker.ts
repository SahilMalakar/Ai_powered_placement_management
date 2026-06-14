import { Worker, Job } from 'bullmq';
import axios from 'axios';
import { prisma } from '../../prisma/prisma.js';
import { GITHUB_SCRAPER_QUEUE_NAME } from '../queues/githubScraper.queue.js';
import { getRedisConnection, getRedisConnectionForCaching } from '../../infra/redis.config.js';
import { CACHE_KEYS } from '../utils/cacheKeys.js';
import { callLLM } from '../utils/llmHelper.js';
import { GITHUB_README_SUMMARIZER_SYSTEM } from '../utils/prompts/stagePrompts.js';

export const initializeGithubScraperWorker = () => {
    const scraperWorker = new Worker(
        GITHUB_SCRAPER_QUEUE_NAME,
        async (job: Job) => {
            const { projectId, userId, githubUrl } = job.data;
            console.log(`[GitHub Scraper Worker] Processing job ${job.id} for project ${projectId} (User: ${userId})...`);

            const cache = getRedisConnectionForCaching();
            const cacheKey = CACHE_KEYS.GITHUB_SCRAPE_JOB(job.id!);

            // Set initial status
            await cache.set(
                cacheKey,
                JSON.stringify({ status: 'processing', createdAt: new Date().toISOString() }),
                'EX',
                3600
            );

            try {
                // Extract owner and repo from Github URL
                const match = githubUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
                if (!match) {
                    throw new Error('Invalid GitHub repository URL. Ensure it follows: https://github.com/owner/repo');
                }
                const owner = match[1];
                const repo = match[2].replace(/\.git$/, '').replace(/\/$/, '');

                let readmeText = '';
                console.log(`[GitHub Scraper Worker] Fetching README for ${owner}/${repo}...`);

                // Attempt 1: Fetch raw README from main branch
                try {
                    const res = await axios.get(`https://raw.githubusercontent.com/${owner}/${repo}/main/README.md`);
                    readmeText = res.data;
                } catch (err) {
                    // Attempt 2: Fetch raw README from master branch
                    try {
                        const res = await axios.get(`https://raw.githubusercontent.com/${owner}/${repo}/master/README.md`);
                        readmeText = res.data;
                    } catch (err2) {
                        // Attempt 3: Fetch using GitHub API
                        const res = await axios.get(`https://api.github.com/repos/${owner}/${repo}/readme`, {
                            headers: { Accept: 'application/vnd.github.raw' }
                        });
                        readmeText = res.data;
                    }
                }

                if (!readmeText || readmeText.trim().length === 0) {
                    throw new Error('Fetched README content is empty');
                }

                console.log(`[GitHub Scraper Worker] README fetched successfully (${readmeText.length} characters). Summarizing with LLM...`);

                // Call LLM to summarize README
                const summary: any = await callLLM(GITHUB_README_SUMMARIZER_SYSTEM, readmeText);
                const { bullets, liveUrl } = summary;

                if (!bullets || !Array.isArray(bullets) || bullets.length === 0) {
                    throw new Error('LLM failed to produce project bullet points');
                }

                console.log(`[GitHub Scraper Worker] Summarized. Bullets: ${bullets.length}, Live URL: ${liveUrl}. Updating Project...`);

                // Update Project model in Prisma DB
                await prisma.project.update({
                    where: { id: projectId },
                    data: {
                        description: bullets,
                        ...(liveUrl ? { link: liveUrl } : {})
                    }
                });

                // Update Redis cache with success status
                const successResult = {
                    status: 'completed',
                    projectId,
                    bullets,
                    liveUrl,
                    createdAt: new Date().toISOString()
                };
                await cache.set(cacheKey, JSON.stringify(successResult), 'EX', 3600);
                console.log(`[GitHub Scraper Worker] ✅ Job ${job.id} successfully completed`);

            } catch (error: any) {
                console.error(`[GitHub Scraper Worker] ❌ Job ${job.id} failed:`, error);

                // Update Redis cache with failed status
                const errorResult = {
                    status: 'failed',
                    error: error instanceof Error ? error.message : 'Unknown scraping failure',
                    createdAt: new Date().toISOString()
                };
                await cache.set(cacheKey, JSON.stringify(errorResult), 'EX', 3600);

                throw error;
            }
        },
        {
            connection: getRedisConnection() as any,
            concurrency: 2
        }
    );

    scraperWorker.on('failed', (job, err) => {
        console.error(`❌ GitHub Scraper job ${job?.id} failed:`, err.message);
    });

    scraperWorker.on('completed', (job) => {
        console.log(`✅ GitHub Scraper job ${job.id} completed successfully`);
    });

    console.log(`[GitHub Scraper Worker] Initialized worker for queue: ${GITHUB_SCRAPER_QUEUE_NAME}`);
};
