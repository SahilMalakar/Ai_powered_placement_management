"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

const forgetPasswordSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
})

type ForgetPasswordValues = z.infer<typeof forgetPasswordSchema>

export function ForgetPasswordForm() {
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const router = useRouter()

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
    setIsLoading(true)
    
    // Mock API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    
    setIsLoading(false)
    toast.success("OTP sent!", {
      description: `If an account exists for ${data.email}, you will receive a 6-digit code.`,
    })
    
    // Redirect to reset password with email pre-filled
    router.push(`/reset-password?email=${encodeURIComponent(data.email)}`)
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
              disabled={isLoading}
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
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send Reset Link
          </Button>
        </div>
      </form>
      <div className="text-center">
        <Button variant="link" asChild className="text-sm text-steel hover:text-navy dark:text-mist dark:hover:text-pale">
          <Link href="/login" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Login
          </Link>
        </Button>
      </div>
    </div>
  )
}
