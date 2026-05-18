"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import Link from "next/link"

import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

import { useAuth } from "@/hooks/auth/use-auth"
import { forgetPasswordSchema, ForgetPasswordValues } from "@/types/auth"

export function ForgetPasswordForm() {
  const router = useRouter()
  const { forgetPassword, isForgetPasswordPending } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgetPasswordValues>({
    resolver: zodResolver(forgetPasswordSchema),
    defaultValues: {
      email: "",
    },
  })

  async function onSubmit(data: ForgetPasswordValues) {
    forgetPassword(data, {
      onSuccess: () => {
        router.push(`/reset-password?email=${encodeURIComponent(data.email)}`)
      }
    })
  }

  return (
    <div className="grid gap-6">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              placeholder="you@college.edu"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={isForgetPasswordPending}
              className={cn(errors.email && "border-error focus-visible:ring-error")}
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs font-medium text-error">{errors.email.message}</p>
            )}
          </div>
          <Button 
            type="submit" 
            className="w-full bg-deep-blue hover:bg-deep-blue/90 text-white dark:bg-sky dark:hover:bg-sky/90 dark:text-navy"
            disabled={isForgetPasswordPending}
          >
            {isForgetPasswordPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send Reset Link
          </Button>
        </div>
      </form>
      <div className="text-center">
        <Link 
          href="/login" 
          className={cn(
            buttonVariants({ variant: "link" }),
            "text-sm text-steel hover:text-navy dark:text-mist dark:hover:text-pale flex items-center gap-2"
          )}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Login
        </Link>
      </div>
    </div>
  )
}
