"use client";

import { useAuthCheck } from "@/hooks/auth/use-auth-check";

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
  useAuthCheck();
  return <>{children}</>;
}
