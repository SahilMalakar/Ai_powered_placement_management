import { z } from 'zod';

export const resumeJsonSchema = z.object({
    targetRole: z.string().describe("The identified industry role for this resume (e.g., 'Full-Stack Developer')"),
    name: z.string().describe("Full name of the student"),
    contact: z.object({
        email: z.string(),
        phone: z.string().nullable().optional(),
        linkedin: z.string().nullable().optional(),
        github: z.string().nullable().optional(),
        portfolio: z.string().nullable().optional(),
        leetcode: z.string().nullable().optional(),
        address: z.string().nullable().optional(),
    }),
    summary: z.string(),
    skills: z.array(z.object({
        category: z.string(),
        items: z.array(z.string())
    })).describe("Grouped technical skills"),
    workExperience: z
        .array(
            z.object({
                title: z.string(),
                company: z.string(),
                location: z.string().nullable().optional(),
                dateRange: z.string(),
                techStack: z.array(z.string()),
                bullets: z.array(z.string()),
            })
        )
        .nullable().default(null),
    projects: z.array(
        z.object({
            title: z.string(),
            techStack: z.array(z.string()),
            githubUrl: z.string().nullable().optional(),
            liveUrl: z.string().nullable().optional(),
            dateRange: z.string().nullable().optional(),
            bullets: z.array(z.string()),
        })
    ).default([]),
    education: z.array(
        z.object({
            institution: z.string(),
            degree: z.string(),
            dateRange: z.string(),
            cgpa: z.string().nullable().optional(),
        })
    ).default([]),
    additionalDetails: z
        .array(
            z.object({
                title: z.string(),
                description: z.array(z.string()),
                date: z.string().nullable().optional(),
            })
        )
        .nullable().default(null),
});

export type ResumeJson = z.infer<typeof resumeJsonSchema>;

export interface ResumeGenerationInput {
    profileData: Record<string, unknown>;
    branch: string;
}
