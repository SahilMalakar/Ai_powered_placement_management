import { z } from 'zod';

// Zod schema for ATS Analysis Request.
export const ATSAnalysisInputSchema = z.object({
    jobDescription: z
        .string()
        .min(20, 'Job description must be at least 20 characters long.')
        .optional(),
});

export const ATSAnalysisTypeSchema = z.enum(['GENERIC', 'JD_MATCHED']);

// Zod schema for LLM Output / ATS Result.
export const ATSResultSchema = z.object({
    detectedRole: z.string(),
    analysisMode: ATSAnalysisTypeSchema,
    score: z.coerce.number().min(0).max(100),
    keywordScore: z.coerce.number().min(0).max(100),
    formatScore: z.coerce.number().min(0).max(100),
    experienceScore: z.coerce.number().min(0).max(100),
    projectScore: z.coerce.number().min(0).max(100),
    skillsScore: z.coerce.number().min(0).max(100),
    additionalDetailsScore: z.coerce.number().min(0).max(100),
    matchedKeywords: z.array(z.string()),
    missingKeywords: z.array(z.string()),
    strengths: z.array(z.string()),
    weaknesses: z.array(z.string()),
    suggestions: z.array(z.string()),
});

export type ATSAnalysisInput = z.infer<typeof ATSAnalysisInputSchema>;
export type ATSResultType = z.infer<typeof ATSResultSchema>;

