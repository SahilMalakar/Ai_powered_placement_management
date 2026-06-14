export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api/v1';

export const EXPORT_ENDPOINTS = {
  REQUEST: "/admin/export",
  STATUS: (jobId: string) => `/admin/export/${jobId}/status`,
  EXPORT_LOGS: '/admin/export/logs',
  EXPORT_LOG_DELETE: (id: number) => `/admin/export/logs/${id}`,
} as const;

export const API_ROUTES = {
  OPTIMIZE_RESUME: '/students/resume/optimize',
  OPTIMIZE_RESUME_BY_ID: (id: number) => `/students/resume/optimize/${id}`,
  OPTIMIZE_RESUME_DELETE: (id: number) => `/students/resume/optimize/${id}`,
  ALL_RESUMES: '/students/resume/optimize',
  GITHUB_SCRAPE: '/students/projects/scrape-github',
} as const;


