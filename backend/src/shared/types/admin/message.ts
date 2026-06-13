import { z } from 'zod';
import { Branch } from '../../../prisma/generated/prisma/enums.js';

export const createAdminMessageSchema = z.object({
    message: z.string().min(10, 'Message must be at least 10 characters long'),
    link: z.preprocess(
        (val) => {
            if (typeof val !== 'string') return val;
            const trimmed = val.trim();
            if (trimmed === '') return undefined;
            
            // If the URL doesn't have a protocol, prepend https://
            if (!/^https?:\/\//i.test(trimmed)) {
                return `https://${trimmed}`;
            }
            return trimmed;
        },
        z.url('Invalid URL format').optional()
    ),
    branches: z.array(z.enum(Branch)).min(1, 'At least one branch must be selected'),
});

export type CreateAdminMessageInput = z.infer<typeof createAdminMessageSchema>;

export const getAdminMessagesHistoryQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
});

export type GetAdminMessagesHistoryQueryInput = z.infer<typeof getAdminMessagesHistoryQuerySchema>;

