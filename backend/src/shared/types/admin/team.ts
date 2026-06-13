import { z } from 'zod';

export const createAdminSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(['ADMIN', 'SUPER_ADMIN']).default('ADMIN'),
});

export const updateAdminRoleSchema = z.object({
    role: z.enum(['ADMIN', 'SUPER_ADMIN']),
});

export const reactivateAdminSchema = z.object({
    password: z.string().min(6, 'Password must be at least 6 characters').optional(),
    role: z.enum(['ADMIN', 'SUPER_ADMIN']).optional(),
});

export type CreateAdminInput = z.infer<typeof createAdminSchema>;
export type UpdateAdminRoleInput = z.infer<typeof updateAdminRoleSchema>;
export type ReactivateAdminInput = z.infer<typeof reactivateAdminSchema>;
