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
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);

  React.useEffect(() => {
    if (isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, router]);

  // While authenticated, render nothing to prevent flash of login UI
  if (isAuthenticated) {
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
