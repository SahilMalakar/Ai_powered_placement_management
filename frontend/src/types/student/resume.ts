import { z } from 'zod';

export const resumeJsonSchema = z.object({
  targetRole: z.string().min(1, "Target role is required"),
  name: z.string().min(1, "Name is required"),
  contact: z.object({
    email: z.email("Invalid email"),
    phone: z.string().nullable(),
    linkedin: z.string().nullable(),
    github: z.string().nullable(),
    portfolio: z.string().nullable(),
    leetcode: z.string().nullable(),
    address: z.string().nullable(),
  }),
  summary: z.string().min(1, "Summary is required"),
  skills: z.array(z.object({
    category: z.string().min(1, "Category is required"),
    items: z.array(z.string()).min(1, "At least one skill is required")
  })).min(1, "At least one skill category is required"),
  workExperience: z
    .array(
      z.object({
        title: z.string().min(1, "Title is required"),
        company: z.string().min(1, "Company is required"),
        location: z.string().nullable(),
        dateRange: z.string().min(1, "Date range is required"),
        techStack: z.array(z.string()),
        bullets: z.array(z.string()).min(1, "At least one bullet point is required"),
      })
    ).nullable(),
  projects: z.array(
    z.object({
      title: z.string().min(1, "Title is required"),
      techStack: z.array(z.string()),
      githubUrl: z.string().nullable(),
      liveUrl: z.string().nullable(),
      dateRange: z.string().nullable(),
      bullets: z.array(z.string()).min(1, "At least one bullet point is required"),
    })
  ),
  education: z.array(
    z.object({
      institution: z.string().min(1, "Institution is required"),
      degree: z.string().min(1, "Degree is required"),
      dateRange: z.string().min(1, "Date range is required"),
      cgpa: z.string().nullable(),
    })
  ),
  additionalDetails: z
    .array(
      z.object({
        title: z.string().min(1, "Title is required"),
        description: z.array(z.string()).min(1, "At least one bullet point is required"),
        date: z.string().nullable(),
      })
    ).nullable(),
});

export type ResumeJson = z.infer<typeof resumeJsonSchema>;

export interface Resume {
  id: number;
  userId: number;
  version: number;
  status: 'GENERATING' | 'COMPLETED' | 'FAILED';
  jsonData: ResumeJson;
  pdfUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export type ResumeStatus = 'GENERATING' | 'COMPLETED' | 'FAILED';

export interface ResumeEntry {
  id: number;
  version: number;
  status: ResumeStatus;
  pdfUrl: string | null;
  createdAt: string;
}

export interface OptimizeResumeResponse {
  jobId: string;
  resumeId: number;
}

export interface GithubScrapeResponse {
  jobId: string;
}

