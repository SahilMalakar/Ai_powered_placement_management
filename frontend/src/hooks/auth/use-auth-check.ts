"use client"

import { useQuery } from "@tanstack/react-query"
import api from "@/services/api"
import { useAppStore } from "@/store/useAppStore"
import { useEffect } from "react"

/**
 * Verifies authentication on app load by calling GET /auth/me.
 * If the JWT cookie is valid, populates the Zustand store with user data.
 * If the cookie is missing or expired, the store stays unauthenticated.
 */
export function useAuthCheck() {
  const setUser = useAppStore((state) => state.setUser)
  const setAuthenticated = useAppStore((state) => state.setAuthenticated)

  const { data, isSuccess, isError, isLoading } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const response = await api.get("/auth/me")
      return response.data
    },
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  useEffect(() => {
    if (isSuccess && data?.data) {
      setUser(data.data)
      setAuthenticated(true)
    }
  }, [isSuccess, data, setUser, setAuthenticated])

  useEffect(() => {
    if (isError) {
      setUser(null)
      setAuthenticated(false)
    }
  }, [isError, setUser, setAuthenticated])

  return { isLoading }
}
