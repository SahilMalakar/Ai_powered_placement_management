"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { studentNavItems } from "./sidebar-nav-items";

/* ──────────────────────────────────────────────────────────
 * SIDEBAR WIDTH — single source of truth
 * ────────────────────────────────────────────────────────── */
export const SIDEBAR_WIDTH = 260; // px

/* ──────────────────────────────────────────────────────────
 * NAV LINK — shared between desktop & mobile
 * ────────────────────────────────────────────────────────── */
interface NavLinkProps {
  href: string;
  label: string;
  icon: React.ElementType;
  isActive: boolean;
  onClick?: () => void;
}

function NavLink({ href, label, icon: Icon, isActive, onClick }: NavLinkProps) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Link
            href={href}
            onClick={onClick}
            className={cn(
              "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
              isActive
                ? "bg-sidebar-accent text-sidebar-primary"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
            )}
          />
        }
      >
        <Icon
          className={cn(
            "size-[18px] shrink-0 transition-colors duration-200",
            isActive
              ? "text-sidebar-primary"
              : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground/70"
          )}
        />
        <span>{label}</span>
      </TooltipTrigger>
      <TooltipContent side="right" className="md:hidden">
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

/* ──────────────────────────────────────────────────────────
 * NAV LIST — renders all items
 * ────────────────────────────────────────────────────────── */
function NavList({ onItemClick }: { onItemClick?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 px-3">
      {studentNavItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <NavLink
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            isActive={isActive}
            onClick={onItemClick}
          />
        );
      })}
    </nav>
  );
}

/* ──────────────────────────────────────────────────────────
 * SIDEBAR BRAND — wordmark at the top
 * ────────────────────────────────────────────────────────── */
function SidebarBrand() {
  return (
    <div className="flex h-16 items-center gap-2.5 px-5">
      {/* Cube icon */}
      <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-primary-foreground"
        >
          <path
            d="M8 1L14.5 4.75V12.25L8 16L1.5 12.25V4.75L8 1Z"
            fill="currentColor"
            fillOpacity="0.2"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path
            d="M8 1V16M8 1L14.5 4.75M8 1L1.5 4.75M8 16L14.5 12.25V4.75M8 16L1.5 12.25V4.75M14.5 4.75L1.5 4.75"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinejoin="round"
            strokeOpacity="0.5"
          />
        </svg>
      </div>
      <span className="font-heading text-lg font-bold tracking-tight text-sidebar-foreground">
        PlacementCube
      </span>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
 * DESKTOP SIDEBAR — always visible on md+
 * ────────────────────────────────────────────────────────── */
export function DesktopSidebar() {
  return (
    <aside
      className="fixed inset-y-0 left-0 z-40 hidden md:flex flex-col border-r border-sidebar-border bg-sidebar shadow-lg"
      style={{ width: SIDEBAR_WIDTH }}
    >
      <SidebarBrand />
      <Separator className="bg-sidebar-border" />
      <div className="flex-1 overflow-y-auto py-4">
        <NavList />
      </div>
      {/* Bottom section — version / help */}
      <Separator className="bg-sidebar-border" />
      <div className="px-5 py-3">
        <p className="text-xs text-sidebar-foreground/40">
          © 2026 PlacementCube
        </p>
      </div>
    </aside>
  );
}

/* ──────────────────────────────────────────────────────────
 * MOBILE SIDEBAR — overlay triggered by floating button
 * ────────────────────────────────────────────────────────── */
export function MobileSidebar() {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();

  // Auto-close on route change
  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      {/* ── Floating menu button (bottom-right, md:hidden) ── */}
      <Button
        variant="default"
        size="lg"
        className={cn(
          "fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl shadow-lg md:hidden",
          "bg-primary text-primary-foreground hover:bg-primary/90",
          "transition-transform duration-200 active:scale-95"
        )}
        onClick={() => setOpen(true)}
        aria-label="Open navigation menu"
      >
        <Menu className="size-5" />
        <span className="text-sm font-medium">Menu</span>
      </Button>

      {/* ── Overlay backdrop ── */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/60 md:hidden transition-opacity duration-200"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar panel ── */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-sidebar-border bg-sidebar md:hidden shadow-2xl",
          "transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header with close */}
        <div className="flex items-center justify-between pr-2">
          <SidebarBrand />
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <X className="size-4" />
          </Button>
        </div>

        <Separator className="bg-sidebar-border" />

        <div className="flex-1 overflow-y-auto py-4">
          <NavList onItemClick={() => setOpen(false)} />
        </div>

        <Separator className="bg-sidebar-border" />
        <div className="px-5 py-3">
          <p className="text-xs text-sidebar-foreground/40">
            © 2026 PlacementCube
          </p>
        </div>
      </aside>
    </>
  );
}
