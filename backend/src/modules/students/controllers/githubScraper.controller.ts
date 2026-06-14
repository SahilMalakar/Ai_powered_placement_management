import type { Request, Response } from 'express';
import { asyncHandler } from '../../../shared/utils/asyncHandler.js';
import { sendSuccess } from '../../../shared/utils/ApiResonse.js';
import { BadRequestError } from '../../../shared/utils/errors/httpErrors.js';
import { githubScrapeRequestSchema } from '../../../shared/types/students/githubScraper.js';
import { requestGithubScrapeService, getGithubScrapeStatusService } from '../services/githubScraper.service.js';

export const requestGithubScrape = asyncHandler(async (req: Request, res: Response) => {
    const body = githubScrapeRequestSchema.parse(req.body);
    const result = await requestGithubScrapeService(req.user!.userId, body.githubUrl);
    return sendSuccess(res, result, 'GitHub scrape queued', 202);
});

export const getGithubScrapeStatus = asyncHandler(async (req: Request, res: Response) => {
    const jobId = req.params.jobId;
    if (!jobId || typeof jobId !== 'string') throw new BadRequestError('Job ID is required and must be a string');

    const result = await getGithubScrapeStatusService(jobId);
    return sendSuccess(res, result, 'GitHub scrape job status fetched successfully');
});

