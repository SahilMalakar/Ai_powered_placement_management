import { z } from 'zod';

export const resumeJsonSchema = z.object({
    personalInfo: z.object({
        fullName: z.string(),
        email: z.string(),
        phoneNumber: z.string().optional(),
        location: z.string().optional(),
        summary: z.string(),
        links: z
            .array(
                z.object({
                    platform: z.string(),
                    url: z.string(),
                })
            )
            .optional(),
    }),
    experience: z.array(
        z.object({
            role: z.string(),
            company: z.string(),
            location: z.string().optional(),
            startDate: z.string(),
            endDate: z.string().optional(), // 'Present' or date
            description: z.array(z.string()), // Professional bullets
            toolsUsed: z.string().optional(),
        })
    ),
    projects: z.array(
        z.object({
            title: z.string(),
            description: z.array(z.string()),
            keyTools: z.string().optional(),
            links: z
                .array(
                    z.object({
                        label: z.string(),
                        url: z.string(),
                    })
                )
                .optional(),
            startDate: z.string().optional(),
            endDate: z.string().optional(),
        })
    ),
    skills: z.array(
        z.object({
            category: z.string(),
            items: z.array(z.string()),
        })
    ),
    education: z.array(
        z.object({
            university: z.string(),
            degree: z.string(),
            location: z.string().optional(),
            graduationDate: z.string().optional(),
            cgpa: z.string().optional(),
        })
    ),
    achievements: z
        .array(
            z.object({
                title: z.string(),
                description: z.string().optional(),
                date: z.string().optional(),
            })
        )
        .optional(),
});

/**
 * No user input required for generation.
 * AI derives everything from profile data.
 */

export type ResumeJson = z.infer<typeof resumeJsonSchema>;

export interface ResumeGenerationInput {
    profileData: Record<string, unknown>;
    branch: string;
}
