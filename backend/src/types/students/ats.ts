import { z } from "zod";

// Zod schema for ATS Analysis Request.
export const ATSAnalysisInputSchema = z.object({
  jobDescription: z.string().min(20, "Job description must be at least 20 characters long."),
});

// Zod schema for LLM Output / ATS Result.
export const ATSResultSchema = z.object({
  score: z.coerce.number().min(0).max(100),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  suggestions: z.array(z.string()),
});

export type ATSAnalysisInput = z.infer<typeof ATSAnalysisInputSchema>;
export type ATSResultType = z.infer<typeof ATSResultSchema>;
