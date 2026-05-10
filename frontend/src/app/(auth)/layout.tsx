"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, user, isLoading } = useAppStore();

  React.useEffect(() => {
    // Only redirect if auth check is complete and we are authenticated
    if (!isLoading && isAuthenticated && user) {
      const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";
      const destination = isAdmin ? "/admin/dashboard" : "/dashboard";
      router.replace(destination);
    }
  }, [isAuthenticated, user, isLoading, router]);

  // While loading or authenticated, render nothing to prevent flash of login UI
  if (isLoading || isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen w-full flex flex-col bg-background">
      <main className="flex-1 flex flex-col">
        {children}
      </main>
    </div>
  );
}
