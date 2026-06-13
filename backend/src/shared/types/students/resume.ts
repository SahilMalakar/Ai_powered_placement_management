import { z } from 'zod';

export const resumeJsonSchema = z.object({
    targetRole: z.string().describe("The identified industry role for this resume (e.g., 'Full-Stack Developer')"),
    name: z.string().describe("Full name of the student"),
    contact: z.object({
        email: z.string(),
        phone: z.string().nullable().default(""),
        linkedin: z.string().nullable().default(""),
        github: z.string().nullable().default(""),
        portfolio: z.string().nullable().default(""),
        leetcode: z.string().nullable().default(""),
        address: z.string().nullable().default(""),
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
                location: z.string().nullable().default(""),
                dateRange: z.string(),
                techStack: z.array(z.string()),
                bullets: z.array(z.string()),
            })
        )
        .nullable()
        .default([]),
    projects: z.array(
        z.object({
            title: z.string(),
            techStack: z.array(z.string()),
            githubUrl: z.string().nullable().default(""),
            liveUrl: z.string().nullable().default(""),
            dateRange: z.string().nullable().default(""),
            bullets: z.array(z.string()),
        })
    ).default([]),
    education: z.array(
        z.object({
            institution: z.string(),
            degree: z.string(),
            dateRange: z.string(),
            cgpa: z.string().nullable().default(""),
        })
    ).default([]),
    additionalDetails: z
        .array(
            z.object({
                title: z.string(),
                description: z.array(z.string()),
                date: z.string().nullable().default(""),
            })
        )
        .nullable()
        .default([]),
});

export type ResumeJson = z.infer<typeof resumeJsonSchema>;

export interface ResumeGenerationInput {
    profileData: Record<string, unknown>;
    branch: string;
}
