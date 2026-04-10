import { z } from "zod";

/**
 * Validates the parameters for the apply route.
 * Ensures jobId is a positive integer.
 */
export const applyToJobParamsSchema = z.object({
  jobId: z.string().regex(/^\d+$/, "Job ID must be a numeric string").transform(Number),
});

/**
 * Validates the request body for the apply route.
 */
export const applyToJobBodySchema = z.object({
  resumeId: z.number().int().positive().optional().nullable(),
});

/**
 * Schema for the "frozen" snapshot of a student's profile at application time.
 */
export const applicationSnapshotSchema = z.object({
  fullName: z.string(),
  branch: z.string(), // Usually an enum, but captured as string in snapshot
  cgpa: z.number(),
  backlog: z.boolean(),
  astuRollNo: z.string(),
  rollNo: z.string(),
  verificationStatus: z.string(),
  
  // Audit Requirements
  appliedAgainstCgpa: z.number(),
  allowedBranches: z.array(z.string()),
  backlogAllowed: z.boolean(),
  
  resumeUrl: z.string().nullable(),
  appliedAt: z.string().datetime(), // ISO Date string
});

export type ApplyToJobParams = z.infer<typeof applyToJobParamsSchema>;
export type ApplyToJobBody = z.infer<typeof applyToJobBodySchema>;
export type ApplicationSnapshot = z.infer<typeof applicationSnapshotSchema>;
