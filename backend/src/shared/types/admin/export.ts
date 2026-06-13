import { z } from 'zod';
import { ApplicationStatus, Branch, VerificationStatus } from '../../../prisma/generated/prisma/enums.js';

export const exportRequestSchema = z.object({
    type: z.enum(['students', 'applications']),
    // Student filters (used when type === 'students')
    search: z.string().optional(),
    branch: z.union([z.enum(Branch), z.literal('all')]).optional(),
    cgpa: z.string().optional(),
    backlogAllowed: z.coerce.boolean().optional(),
    verificationStatus: z.union([z.enum(VerificationStatus), z.literal('all')]).optional(),
    // Application filters (used when type === 'applications')
    status: z.union([z.enum(ApplicationStatus), z.literal('all')]).optional(),
    jobId: z.coerce.number().optional(),
});

export type ExportRequestInput = z.infer<typeof exportRequestSchema>;

// Shape stored in Redis for job tracking
export interface ExportJobResult {
    status: 'processing' | 'completed' | 'failed';
    downloadUrl?: string;
    error?: string;
    createdAt: string;
}
