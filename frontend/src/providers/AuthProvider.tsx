"use client";

import * as React from "react";
import { useAuthCheck } from "@/hooks/auth/use-auth-check";
import { useAppStore } from "@/store/useAppStore";

/**
 * Runs the auth check (GET /auth/me) on app mount.
 * Place this inside QueryProvider in the root layout.
 * It hydrates the Zustand store from the JWT cookie so auth guards work
 * across page refreshes, back button navigation, and URL changes.
 */
export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading } = useAuthCheck();
  const { isAuthenticated, user } = useAppStore();
  
  return <>{children}</>;
}
