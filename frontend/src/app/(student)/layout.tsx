import { TooltipProvider } from "@/components/ui/tooltip";
import {
  StudentSidebar,
} from "@/components/layout/student";
import { Navbar } from "@/components/layout/shared/navbar";

import { RoleGuard } from "@/components/auth/role-guard";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

/**
 * Student area layout shell.
 * Provides the sidebar (desktop + mobile) and top navbar.
 * Page content is rendered inside {children} with proper offsets.
 */
export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={["STUDENT"]}>
      <TooltipProvider>
        <SidebarProvider>
          {/* ── Sidebar ── */}
          <StudentSidebar />

          <SidebarInset className="bg-background">
            {/* ── Navbar ── */}
            <Navbar />

            {/* ── Page content area ── */}
            <main className="flex-1 p-6 lg:p-8 overflow-auto relative min-h-screen">
              <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
                {children}
              </div>
            </main>
          </SidebarInset>
        </SidebarProvider>
      </TooltipProvider>
    </RoleGuard>
  );
}
