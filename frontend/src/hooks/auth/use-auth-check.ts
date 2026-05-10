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
  const setAuth = useAppStore((state) => state.setAuth)

  const { data, isSuccess, isLoading } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const response = await api.get("/auth/me")
      return response.data
    },
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Update Zustand store based on query state.
  useEffect(() => {
    // Only update the store when the query is no longer loading.
    // The store's isLoading defaults to true, so we only need to 
    // transition to false once the auth check (success or failure) completes.
    if (!isLoading) {
      const user = isSuccess && data?.data ? data.data : null;
      setAuth(user, false);
    }
  }, [isLoading, isSuccess, data, setAuth]);

  return { isLoading };
}
