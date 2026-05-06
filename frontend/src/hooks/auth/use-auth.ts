"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import axios from "axios"
import api from "@/services/api"
import { useAppStore } from "@/store/useAppStore"
import {  AuthFormValues } from "@/types/auth"

export function useAuth() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const setAuthenticated = useAppStore((state) => state.setAuthenticated)
  const setUser = useAppStore((state) => state.setUser)

  const loginMutation = useMutation({
    mutationFn: async (data: AuthFormValues) => {
      const response = await api.post("/auth/login", data)
      return response.data.data
    },
    onSuccess: (data) => {
      queryClient.clear()
      setUser(data.user)
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
      return response.data.data
    },
    onSuccess: (data) => {
      queryClient.clear()
      setUser(data.user)
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
