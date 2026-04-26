"use client"

import { useMutation } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import axios from "axios"
import api from "@/services/api"
import { useAppStore } from "@/store/useAppStore"
import { z } from "zod"

const emailSchema = z.email("Invalid email format").min(1, "Email is required")

const passwordSchema = z
  .string()
  .min(5, "Password must be at least 8 characters")
  .max(15, "Password must not exceed 32 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")

const authSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
})

type AuthFormValues = z.infer<typeof authSchema>

export function useAuth() {
  const router = useRouter()
  const setAuthenticated = useAppStore((state) => state.setAuthenticated)

  const loginMutation = useMutation({
    mutationFn: async (data: AuthFormValues) => {
      const response = await api.post("/auth/login", data)
      return response.data
    },
    onSuccess: () => {
      setAuthenticated(true)
      toast.success("Login successful!")
      router.replace("/dashboard")
    },
    onError: (error) => {
      let errorMessage = "Something went wrong"
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        errorMessage = error.response.data.message
      }
      toast.error(errorMessage)
    },
  })

  const signupMutation = useMutation({
    mutationFn: async (data: AuthFormValues) => {
      const response = await api.post("/auth/signup", data)
      return response.data
    },
    onSuccess: () => {
      setAuthenticated(true)
      toast.success("Signup successful!")
      router.replace("/dashboard")
    },
    onError: (error) => {
      let errorMessage = "Something went wrong"
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        errorMessage = error.response.data.message
      }
      toast.error(errorMessage)
    },
  })

  return {
    login: loginMutation.mutate,
    signup: signupMutation.mutate,
    isLoginPending: loginMutation.isPending,
    isSignupPending: signupMutation.isPending,
  }
}
