"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

const authSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(1, "Password is required").min(6, "Password must be at least 6 characters"),
})

type AuthFormValues = z.infer<typeof authSchema>

interface AuthFormProps extends React.HTMLAttributes<HTMLDivElement> {
  mode: "login" | "signup"
}

export function AuthForm({ mode, className, ...props }: AuthFormProps) {
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [showPassword, setShowPassword] = React.useState<boolean>(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(data: AuthFormValues) {
    setIsLoading(true)
    
    // Mock API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    
    setIsLoading(false)
    toast.success(`${mode === "login" ? "Login" : "Signup"} successful!`, {
      description: `Welcome back, ${data.email.split("@")[0]}`,
    })
    
    if (mode === "signup") {
      reset()
    }
  }

  return (
    <div className={cn("grid gap-8", className)} {...props}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-6">
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
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                placeholder="••••••••"
                type={showPassword ? "text" : "password"}
                autoCapitalize="none"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                disabled={isLoading}
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
                disabled={isLoading}
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
                <Button variant="link" asChild className="px-0 font-sans text-xs text-steel hover:text-navy dark:text-mist dark:hover:text-pale h-auto">
                  <Link href="/forget-password">Forgot password?</Link>
                </Button>
              </div>
            )}
          </div>
          <Button 
            type="submit" 
            className="w-full bg-deep-blue hover:bg-deep-blue/90 text-white dark:bg-sky dark:hover:bg-sky/90 dark:text-navy"
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
