import { z } from 'zod';

export const resumeJobResultSchema = z.object({
    status: z.enum(['processing', 'completed', 'failed']),
    resumeId: z.number().optional(),
    pdfUrl: z.string().optional(),
    error: z.string().optional(),
    createdAt: z.string(),
});

export type ResumeJobResult = z.infer<typeof resumeJobResultSchema>;

export interface OptimizeResumeJobPayload {
    userId: number;
    rawText: string;
    resumeId: number;
}

export interface ResumeOptimizerState {
    userId: number;
    resumeId: number;
    rawText: string;
    detectedBranch: string;
    detectedRole: string;
    roleCategory: string;
    contentInventory: Record<string, unknown>;
    estimatedCeiling: number;
    candidateTier: 'newbie' | 'intermediate' | 'strong';
    analyzerOutput: Record<string, unknown>;
    currentResume: string;
    previousResume: string;
    presentationScore: number;
    contentScore: number;
    improvementDelta: number;
    iterationCount: number;
    maxIterations: number;
    fabricationLog: string[];
    fabricationsFound: boolean;
    previousCritiqueFeedback: string;
    finalResumeJson: Record<string, unknown> | null;
    gapReport: Record<string, unknown> | null;
    error: string | null;
}
