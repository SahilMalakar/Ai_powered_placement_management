"use client"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { AuthForm } from "./auth-form"

interface AuthCardProps {
  mode: "login" | "signup"
}

export function AuthCard({ mode }: AuthCardProps) {
  return (
    <Card className="w-full max-w-[450px] shadow-lg border-border animate-in fade-in zoom-in duration-300">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-3xl font-heading font-semibold tracking-tight">
          {mode === "login" ? "Login" : "Signup"}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <AuthForm mode={mode} />
      </CardContent>
    </Card>
  )
}
