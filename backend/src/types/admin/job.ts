import { z } from 'zod';
import { Branch, JobStatus } from '../../prisma/generated/prisma/enums.js';

/**
 * Zod schema matching Prisma's JobCreateInput.
 * Used to ensure type compatibility for service and repository operations.
 */
export const createJobSchema = z.object({
    title: z.string().min(3),
    company: z.string().min(2),
    description: z.string().min(10),
    requiredCgpa: z.number().min(0).max(10),
    allowedBranches: z.array(z.enum(Branch)),
    backlogAllowed: z.boolean(),
    status: z.enum(JobStatus).optional(),
    deadline: z.preprocess(
        (arg) =>
            typeof arg === 'string' || arg instanceof Date
                ? new Date(arg)
                : arg,
        z.date()
    ),

    // Optional audit fields
    createdAt: z.date().or(z.string()).optional(),
    updatedAt: z.date().or(z.string()).optional(),
    deletedAt: z.date().or(z.string()).nullable().optional(),
    applications: z.any().optional(),
});

/**
 * Zod schema for partial job updates.
 * Excludes 'status' to prevent unauthorized manual status changes via the update route.
 */
export const updateJobSchema = createJobSchema.omit({ status: true }).partial();

export type CreateJobInput = z.infer<typeof createJobSchema>;
export type UpdateJobInput = z.infer<typeof updateJobSchema>;

export const getAllJobsQuerySchema = z.object({
    search: z.string().optional(),
    branch: z.enum(Branch).optional(),
    branches: z.preprocess(
        (val) => (typeof val === 'string' ? [val] : val),
        z.array(z.enum(Branch))
    ).optional(),
    cgpa: z.string().optional(),
    backlogAllowed: z.preprocess(
        (val) => (val === 'true' || val === true),
        z.boolean()
    ).optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
    status: z.enum(JobStatus).optional(),
});

export type GetAllJobsQueryInput = z.infer<typeof getAllJobsQuerySchema>;
