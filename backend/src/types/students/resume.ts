import { z } from 'zod';

export const resumeJsonSchema = z.object({
    personalInfo: z.object({
        fullName: z.string(),
        email: z.string(),
        phoneNumber: z.string().nullable().optional(),
        location: z.string().nullable().optional(),
        summary: z.string(),
        links: z
            .array(
                z.object({
                    platform: z.string(),
                    url: z.string(),
                })
            )
            .nullable()
            .optional(),
    }),
    experience: z
        .array(
            z.object({
                role: z.string(),
                company: z.string(),
                location: z.string().nullable().optional(),
                startDate: z.string(),
                endDate: z.string().nullable().optional(),
                description: z.array(z.string()),
                toolsUsed: z.string().nullable().optional(),
            })
        )
        .nullable()
        .optional(),
    projects: z.array(
        z.object({
            title: z.string(),
            description: z.array(z.string()),
            keyTools: z.string().nullable().optional(),
            links: z
                .array(
                    z.object({
                        label: z.string(),
                        url: z.string(),
                    })
                )
                .nullable()
                .optional(),
            startDate: z.string().nullable().optional(),
            endDate: z.string().nullable().optional(),
        })
    ),
    skills: z.array(
        z.object({
            category: z.string(),
            skills: z.array(z.string()),
        })
    ),
    education: z.array(
        z.object({
            university: z.string(),
            degree: z.string(),
            location: z.string().nullable().optional(),
            graduationDate: z.string().nullable().optional(),
            cgpa: z.string().nullable().optional(),
        })
    ),
    additionalDetails: z
        .array(
            z.object({
                title: z.string(),
                description: z.array(z.string()),
                date: z.string().nullable().optional(),
            })
        )
        .nullable()
        .optional(),
});

export type ResumeJson = z.infer<typeof resumeJsonSchema>;

export interface ResumeGenerationInput {
    profileData: Record<string, unknown>;
    branch: string;
}
