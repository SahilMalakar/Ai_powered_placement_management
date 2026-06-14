import api from '../api';
import { API_ROUTES } from '@/constants/api';
import { GithubScrapeResponse } from '@/types/student/resume';

export const scrapeGithubService = async (
  githubUrl: string
): Promise<GithubScrapeResponse> => {
  const response = await api.post(API_ROUTES.GITHUB_SCRAPE, { githubUrl });
  return response.data.data;
};
