import { z } from "zod";

const emailSchema = z.email("Invalid email format");

const passwordSchema = z
  .string()
  .min(5, "Password must be at least 8 characters")
  .max(15, "Password must not exceed 32 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")



export const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});
export type SignupInput = z.infer<typeof signupSchema>;


export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});
export type LoginInput = z.infer<typeof loginSchema>;


export const logoutSchema = z.object({});
export type LogoutInput = z.infer<typeof logoutSchema>;

export const changePasswordSchma = z.object({
  oldPassword:z.string().min(1,"Old password is required"),
  newPassword:passwordSchema
}).refine((data)=>{
  data.oldPassword !== data.newPassword,{
    message:"New password must be different from old password",
    path:["newPassword"]
  }
})
export type ChangePasswordInput = z.infer<typeof changePasswordSchma >;


export const forgetPasswordSchema = z.object({
  email:z.email("Invalid email format"),
})
export type ForgetPasswordInput = z.infer<typeof forgetPasswordSchema>;

export const resetPasswordSchema = z.object({
  email:z.email("Invalid email format"),
  otp:z.string().length(6,"Otp must be 6 digits"),
  newPassword:passwordSchema
})

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;