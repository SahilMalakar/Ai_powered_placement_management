import { z } from 'zod';

export const resumeJsonSchema = z.object({
    targetRole: z.string().describe("The identified industry role for this resume (e.g., 'Full-Stack Developer')"),
    name: z.string().describe("Full name of the student"),
    contact: z.object({
        email: z.string(),
        phone: z.string().default(""),
        linkedin: z.string().default(""),
        github: z.string().default(""),
        portfolio: z.string().default(""),
        leetcode: z.string().default(""),
        address: z.string().default(""),
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
                location: z.string().default(""),
                dateRange: z.string(),
                techStack: z.array(z.string()),
                bullets: z.array(z.string()),
            })
        )
        .default([]),
    projects: z.array(
        z.object({
            title: z.string(),
            techStack: z.array(z.string()),
            githubUrl: z.string().default(""),
            liveUrl: z.string().default(""),
            dateRange: z.string().default(""),
            bullets: z.array(z.string()),
        })
    ).default([]),
    education: z.array(
        z.object({
            institution: z.string(),
            degree: z.string(),
            dateRange: z.string(),
            cgpa: z.string().default(""),
        })
    ).default([]),
    additionalDetails: z
        .array(
            z.object({
                title: z.string(),
                description: z.array(z.string()),
                date: z.string().default(""),
            })
        )
        .default([]),
});

export type ResumeJson = z.infer<typeof resumeJsonSchema>;

export interface ResumeGenerationInput {
    profileData: Record<string, unknown>;
    branch: string;
}
