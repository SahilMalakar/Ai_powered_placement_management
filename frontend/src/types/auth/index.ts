import { z } from "zod";

export const emailSchema = z.email("Invalid email format").min(1, "Email is required");

export const passwordSchema = z
  .string()
  .min(5, "Password must be at least 5 characters")
  .max(15, "Password must not exceed 15 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");

export const authSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export type AuthFormValues = z.infer<typeof authSchema>;

export interface User {
  id: number;
  name?: string;
  email: string;
  role: 'STUDENT' | 'ADMIN' | 'SUPER_ADMIN';
  isProfileCompleted?: boolean;
}

export const forgetPasswordSchema = z.object({
  email: emailSchema,
});
export type ForgetPasswordValues = z.infer<typeof forgetPasswordSchema>;

export const resetPasswordSchema = z.object({
  email: emailSchema,
  otp: z.string().length(6, "OTP must be exactly 6 digits"),
  newPassword: passwordSchema,
});
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

