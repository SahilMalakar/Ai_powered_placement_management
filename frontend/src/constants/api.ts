export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api/v1';

export const EXPORT_ENDPOINTS = {
  REQUEST: "/admin/export",
  STATUS: (jobId: string) => `/admin/export/${jobId}/status`,
} as const;

