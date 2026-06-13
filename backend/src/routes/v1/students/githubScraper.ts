import { Router } from 'express';
import { authMiddleware } from '../../../shared/middlewares/auth.middleware.js';
import { requireStudent } from '../../../shared/middlewares/rbac.middleware.js';
import { requestGithubScrape, getGithubScrapeStatus } from '../../../modules/students/controllers/githubScraper.controller.js';

const githubScraperRouter: Router = Router();

githubScraperRouter.use(authMiddleware, requireStudent);

githubScraperRouter.post('/projects/:projectId/scrape-github', requestGithubScrape);
githubScraperRouter.get('/projects/jobs/:jobId/status', getGithubScrapeStatus);

export { githubScraperRouter };
