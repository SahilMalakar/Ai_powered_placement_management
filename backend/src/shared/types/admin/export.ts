import { z } from 'zod';
import { ApplicationStatus, Branch, VerificationStatus } from '../../../prisma/generated/prisma/enums.js';

export const exportRequestSchema = z.object({
    type: z.enum(['students', 'applications']),
    selectedIds: z.array(z.number()).optional(),
    selectedFields: z.array(z.string()).optional(),
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

/**
 * Input schema for export request.
 * 
 * Selection logic rule:
 * - If selectedIds is present and non-empty → fetch only those IDs, completely ignore all filter fields (search, branch, cgpa, etc.)
 * - If selectedIds is absent or empty → apply all filter fields normally
 * - If selectedFields is absent or empty → export all available fields for that export type
 */
export type ExportRequestInput = z.infer<typeof exportRequestSchema>;

export const STUDENT_EXPORT_FIELDS = [
    'id',
    'email',
    'fullName',
    'rollNo',
    'branch',
    'degree',
    'cgpa',
    'dob',
    'backlog',
    'backlogSubjects',
    'verificationStatus',
    'phoneNumber',
    'graduationYear',
    'university',
    'sgpa',
    'documents',
] as const;

export const APPLICATION_EXPORT_FIELDS = [
    'jobTitle',
    'company',
    'studentName',
    'rollNo',
    'studentEmail',
    'branch',
    'cgpa',
    'applicationStatus',
    'appliedDate',
] as const;

// Shape stored in Redis for job tracking
export interface ExportJobResult {
    status: 'processing' | 'completed' | 'failed';
    downloadUrl?: string;
    error?: string;
    createdAt: string;
}
