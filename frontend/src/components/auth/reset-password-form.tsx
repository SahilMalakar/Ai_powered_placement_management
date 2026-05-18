"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"
import { useRouter, useSearchParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

import { useAuth } from "@/hooks/auth/use-auth"

import { emailSchema, passwordSchema } from "@/types/auth"

const resetPasswordFormSchema = z.object({
  email: emailSchema,
  otp: z.string().length(6, "OTP must be exactly 6 digits"),
  newPassword: passwordSchema,
  confirmPassword: z.string().min(1, "Confirm password is required"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type ResetPasswordFormValues = z.infer<typeof resetPasswordFormSchema>

export function ResetPasswordForm() {
  const router = useRouter()
  const { resetPassword, isResetPasswordPending } = useAuth()
  const [showPassword, setShowPassword] = React.useState<boolean>(false)

  const searchParams = useSearchParams()
  const emailParam = searchParams.get("email") || ""

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordFormSchema),
    defaultValues: {
      email: emailParam,
      otp: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  async function onSubmit(data: ResetPasswordFormValues) {
    resetPassword({
      email: data.email,
      otp: data.otp,
      newPassword: data.newPassword,
    })
  }

  return (
    <div className="grid gap-6">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              disabled={isResetPasswordPending || !!emailParam}
              className={cn(errors.email && "border-error focus-visible:ring-error")}
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs font-medium text-error">{errors.email.message}</p>
            )}
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="otp">Verification Code (OTP)</Label>
            <Input
              id="otp"
              placeholder="123456"
              type="text"
              maxLength={6}
              disabled={isResetPasswordPending}
              className={cn(
                "font-mono tracking-widest text-center text-lg",
                errors.otp && "border-error focus-visible:ring-error"
              )}
              {...register("otp")}
            />
            {errors.otp && (
              <p className="text-xs font-medium text-error">{errors.otp.message}</p>
            )}
            <p className="text-[10px] text-muted-foreground">
              Enter the 6-digit code sent to your email.
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="newPassword">New Password</Label>
            <div className="relative">
              <Input
                id="newPassword"
                placeholder="••••••••"
                type={showPassword ? "text" : "password"}
                disabled={isResetPasswordPending}
                className={cn(
                  "pr-10",
                  errors.newPassword && "border-error focus-visible:ring-error"
                )}
                {...register("newPassword")}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isResetPasswordPending}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            {errors.newPassword && (
              <p className="text-xs font-medium text-error">{errors.newPassword.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              placeholder="••••••••"
              type="password"
              disabled={isResetPasswordPending}
              className={cn(errors.confirmPassword && "border-error focus-visible:ring-error")}
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p className="text-xs font-medium text-error">{errors.confirmPassword.message}</p>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full bg-deep-blue hover:bg-deep-blue/90 text-white dark:bg-sky dark:hover:bg-sky/90 dark:text-navy"
            disabled={isResetPasswordPending}
          >
            {isResetPasswordPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Reset Password
          </Button>
        </div>
      </form>
    </div>
  )
}
