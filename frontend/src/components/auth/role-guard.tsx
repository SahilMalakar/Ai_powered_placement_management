"use client";

import { useAppStore } from "@/store/useAppStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: ("STUDENT" | "ADMIN" | "SUPER_ADMIN")[];
  redirectTo?: string;
}

/**
 * A client-side guard component that restricts access to its children based on the user's role.
 * It uses the global app store to verify authentication and role status.
 */
export function RoleGuard({
  children,
  allowedRoles,
  redirectTo = "/login",
}: RoleGuardProps) {
  const { user, isAuthenticated, isLoading } = useAppStore();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        console.log("[RoleGuard] Not authenticated, redirecting to:", redirectTo);
        router.replace(redirectTo);
      } else if (user && !allowedRoles.includes(user.role)) {
        console.log(`[RoleGuard] Role ${user.role} not authorized for this area. Allowed:`, allowedRoles);
        
        // If an admin tries to access student routes, or vice-versa
        const fallback = user.role === "STUDENT" ? "/dashboard" : "/admin/dashboard";
        router.replace(fallback);
      } else {
        setIsAuthorized(true);
      }
    }
  }, [isAuthenticated, user, allowedRoles, router, redirectTo, isLoading]);

  if (isLoading || !isAuthorized) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm font-medium text-muted-foreground animate-pulse">
            Verifying permissions...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
