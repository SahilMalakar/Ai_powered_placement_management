import { z } from 'zod';

export const githubScrapeRequestSchema = z.object({
    githubUrl: z.string().url(),
});

export type GithubScrapeRequest = z.infer<typeof githubScrapeRequestSchema>;

export interface GithubScraperJobPayload {
    projectId: number;
    userId: number;
    githubUrl: string;
}
