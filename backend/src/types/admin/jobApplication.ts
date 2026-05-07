import { z } from "zod";
import { ApplicationStatus } from "../../prisma/generated/prisma/enums.js";

export const updateApplicationStatusSchema = z.object({
    applicationIds: z
        .array(z.coerce.number())
        .min(1, "At least one application ID is required")
        .max(100, "Cannot update more than 100 applications at once"),
    status: z.enum(ApplicationStatus),
});

export type UpdateApplicationStatusInput = z.infer<typeof updateApplicationStatusSchema>;

export const getJobApplicantsQuerySchema = z.object({
    search: z.string().optional(),
    status: z.union([z.enum(ApplicationStatus), z.literal("all")]).optional(),
    branch: z.string().optional(),
    verificationStatus: z.string().optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
});

export type GetJobApplicantsQueryInput = z.infer<typeof getJobApplicantsQuerySchema>;
