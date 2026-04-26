"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, Eye, EyeOff } from "lucide-react"
import Link from "next/link"

import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/auth/use-auth"

const emailSchema = z.email("Invalid email format").min(1, "Email is required")

const passwordSchema = z
  .string()
  .min(5, "Password must be at least 8 characters")
  .max(15, "Password must not exceed 32 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")

const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
})

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
})

type AuthFormValues = z.infer<typeof signupSchema>

interface AuthFormProps extends React.HTMLAttributes<HTMLDivElement> {
  mode: "login" | "signup"
}

export function AuthForm({ mode, className, ...props }: AuthFormProps) {
  const [showPassword, setShowPassword] = React.useState<boolean>(false)
  const { login, signup, isLoginPending, isSignupPending } = useAuth()
  
  const isPending = mode === "login" ? isLoginPending : isSignupPending

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AuthFormValues>({
    resolver: zodResolver(mode === "login" ? loginSchema : signupSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  function onSubmit(data: AuthFormValues) {
    if (mode === "login") {
      login(data)
    } else {
      signup(data)
    }
  }

  return (
    <div className={cn("grid gap-8", className)} {...props}>
      <form onSubmit={handleSubmit(onSubmit)} method="POST">
        <div className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              placeholder="[EMAIL_ADDRESS]"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={isPending}
              className={cn(errors.email && "border-error focus-visible:ring-error")}
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs font-medium text-error">{errors.email.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                placeholder="••••••••"
                type={showPassword ? "text" : "password"}
                autoCapitalize="none"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                disabled={isPending}
                className={cn(
                  "pr-10",
                  errors.password && "border-error focus-visible:ring-error"
                )}
                {...register("password")}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isPending}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="sr-only">
                  {showPassword ? "Hide password" : "Show password"}
                </span>
              </Button>
            </div>
            {errors.password && (
              <p className="text-xs font-medium text-error">{errors.password.message}</p>
            )}
            {mode === "login" && (
              <div className="flex justify-end">
                <Link 
                  href="/forget-password"
                  className={cn(
                    buttonVariants({ variant: "link" }),
                    "px-0 font-sans text-xs text-steel hover:text-navy dark:text-mist dark:hover:text-pale h-auto"
                  )}
                >
                  Forgot password?
                </Link>
              </div>
            )}
          </div>
          <Button 
            type="submit" 
            className="w-full bg-deep-blue hover:bg-deep-blue/90 text-white dark:bg-sky dark:hover:bg-sky/90 dark:text-navy"
            disabled={isPending}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === "login" ? "Login" : "Create Account"}
          </Button>
        </div>
      </form>
      <div className="text-center text-sm font-sans">
        {mode === "login" ? (
          <p className="text-steel dark:text-mist">
            Don&apos;t have an account?{" "}
            <Link 
              href="/signup" 
              className="font-medium text-deep-blue hover:underline dark:text-sky"
            >
              Sign up
            </Link>
          </p>
        ) : (
          <p className="text-steel dark:text-mist">
            Already have an account?{" "}
            <Link 
              href="/login" 
              className="font-medium text-deep-blue hover:underline dark:text-sky"
            >
              Login
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}
