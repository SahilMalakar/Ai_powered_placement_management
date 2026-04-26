"use client";

import { TooltipProvider } from "@/components/ui/tooltip";
import {
  DesktopSidebar,
  MobileSidebar,
  StudentNavbar,
  SIDEBAR_WIDTH,
} from "@/components/layout/student";

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
    <TooltipProvider>
      {/* ── Sidebar ── */}
      <DesktopSidebar />
      <MobileSidebar />

      {/* ── Navbar ── */}
      <StudentNavbar />

      {/* ── Page content area ──
           pt-16  → clears the fixed navbar (h-16 = 64px)
           md:pl-[260px] → clears the fixed sidebar on desktop
           The value 260 matches SIDEBAR_WIDTH constant             */}
      <main className="student-main min-h-screen pt-16">
        {children}
      </main>
    </TooltipProvider>
  );
}
