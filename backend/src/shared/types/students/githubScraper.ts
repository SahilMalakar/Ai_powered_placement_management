import { z } from 'zod';

export const githubScrapeRequestSchema = z.object({
    githubUrl: z.string().url(),
});

export type GithubScrapeRequest = z.infer<typeof githubScrapeRequestSchema>;

export interface GithubScraperJobPayload {
    userId: number;
    githubUrl: string;
}

export const GithubReadmeSummarySchema = z.object({
    title: z.string(),
    description: z.array(z.string()),
    keyTools: z.string(),
    liveUrl: z.string().nullable(),
    startDate: z.string().nullable(),
    endDate: z.string().nullable(),
});

export type GithubReadmeSummary = z.infer<typeof GithubReadmeSummarySchema>;

