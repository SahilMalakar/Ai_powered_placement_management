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
