"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import axios from "axios"
import api from "@/services/api"
import { useAppStore } from "@/store/useAppStore"
import {  AuthFormValues, ForgetPasswordValues, ResetPasswordValues } from "@/types/auth"

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
      
      const isAdmin = data.user.role === "ADMIN" || data.user.role === "SUPER_ADMIN";
      router.replace(isAdmin ? "/admin/dashboard" : "/dashboard");
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
      
      const isAdmin = data.user.role === "ADMIN" || data.user.role === "SUPER_ADMIN";
      router.replace(isAdmin ? "/admin/dashboard" : "/dashboard");
    },
    onError: (error) => {
      let errorMessage = "Something went wrong"
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        errorMessage = error.response.data.message
      }
      toast.error(errorMessage)
    },
  })

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post("/auth/logout")
      return response.data
    },
    onSuccess: () => {
      queryClient.clear()
      setUser(null)
      setAuthenticated(false)
      toast.success("Logged out successfully.")
      router.replace("/login")
    },
    onError: (error) => {
      // Local fallback so user doesn't get stuck
      queryClient.clear()
      setUser(null)
      setAuthenticated(false)
      router.replace("/login")
      
      let errorMessage = "Logout completed locally."
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        errorMessage = error.response.data.message
      }
      console.warn("Logout API failed:", errorMessage)
    }
  })

  const forgetPasswordMutation = useMutation({
    mutationFn: async (data: ForgetPasswordValues) => {
      const response = await api.post("/auth/forget-password", data)
      return response.data
    },
    onSuccess: (data) => {
      toast.success(data?.message || "If an account exists, an OTP has been sent.")
    },
    onError: (error) => {
      let errorMessage = "Failed to request password reset"
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        errorMessage = error.response.data.message
      }
      toast.error(errorMessage)
    }
  })

  const resetPasswordMutation = useMutation({
    mutationFn: async (data: ResetPasswordValues) => {
      const response = await api.patch("/auth/reset-password", data)
      return response.data
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Password reset successfully.")
      router.replace("/login")
    },
    onError: (error) => {
      let errorMessage = "Failed to reset password"
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        errorMessage = error.response.data.message
      }
      toast.error(errorMessage)
    }
  })

  return {
    login: loginMutation.mutate,
    signup: signupMutation.mutate,
    logout: logoutMutation.mutate,
    forgetPassword: forgetPasswordMutation.mutate,
    resetPassword: resetPasswordMutation.mutate,
    isLoginPending: loginMutation.isPending,
    isSignupPending: signupMutation.isPending,
    isLogoutPending: logoutMutation.isPending,
    isForgetPasswordPending: forgetPasswordMutation.isPending,
    isResetPasswordPending: resetPasswordMutation.isPending,
  }
}
