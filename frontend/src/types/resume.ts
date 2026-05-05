import { z } from 'zod';

export const resumeJsonSchema = z.object({
  targetRole: z.string().min(1, "Target role is required"),
  name: z.string().min(1, "Name is required"),
  contact: z.object({
    email: z.email("Invalid email"),
    phone: z.string(),
    linkedin: z.string(),
    github: z.string(),
    portfolio: z.string(),
    leetcode: z.string(),
    address: z.string(),
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
        location: z.string(),
        dateRange: z.string().min(1, "Date range is required"),
        techStack: z.array(z.string()),
        bullets: z.array(z.string()).min(1, "At least one bullet point is required"),
      })
    ),
  projects: z.array(
    z.object({
      title: z.string().min(1, "Title is required"),
      techStack: z.array(z.string()),
      githubUrl: z.string(),
      liveUrl: z.string(),
      dateRange: z.string(),
      bullets: z.array(z.string()).min(1, "At least one bullet point is required"),
    })
  ),
  education: z.array(
    z.object({
      institution: z.string().min(1, "Institution is required"),
      degree: z.string().min(1, "Degree is required"),
      dateRange: z.string().min(1, "Date range is required"),
      cgpa: z.string(),
    })
  ),
  additionalDetails: z
    .array(
      z.object({
        title: z.string().min(1, "Title is required"),
        description: z.array(z.string()).min(1, "At least one bullet point is required"),
        date: z.string(),
      })
    ),
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
