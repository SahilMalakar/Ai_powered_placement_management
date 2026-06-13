import { z } from 'zod';
import { Branch, VerificationStatus } from '../../../prisma/generated/prisma/enums.js';

export const getAllStudentsQuerySchema = z.object({
    search: z.string().optional(),
    branch: z.enum(Branch).optional(),
    cgpa: z.string().optional(),
    backlogAllowed: z.preprocess((val) => {
        if (val === 'true' || val === '1' || val === true) return true;
        if (val === 'false' || val === '0' || val === false) return false;
        return undefined;
    }, z.boolean().optional()).optional(),
    verificationStatus: z.enum(VerificationStatus).optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
});

export type GetAllStudentsQueryInput = z.infer<typeof getAllStudentsQuerySchema>;
