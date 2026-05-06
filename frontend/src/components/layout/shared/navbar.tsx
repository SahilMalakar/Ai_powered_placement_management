"use client";

import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User, Settings } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { useAppStore } from "@/store/useAppStore";

/**
 * Shared top navbar for both Admin and Student portals.
 * Sticky at top, flex layout within SidebarInset.
 */
export function Navbar() {
  const { user, setAuthenticated, setUser } = useAppStore();
  const router = useRouter();

  // Extract initials from user name or email
  const getInitials = () => {
    if (!user) return "U";
    if (user.name) {
      return user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2);
    }
    if (user.email) {
      return user.email?.charAt(0).toUpperCase();
    }
    return "U";
  };

  const handleLogout = () => {
    setAuthenticated(false);
    setUser(null);
    router.push("/login");
  };

  const isAdmin = user?.role === "SUPER_ADMIN" || user?.role === "ADMIN";

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-2 px-6 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4 hidden md:block" />

        {/* Mobile wordmark — only visible on small screens */}
        <div className="flex md:hidden items-center gap-2.5">
          <div className="flex size-7 items-center justify-center rounded-md bg-primary">
            <svg
              width="14"
              height="14"
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
            </svg>
          </div>
          <span className="font-heading text-base font-bold tracking-tight text-foreground">
            PlacementCube
          </span>
        </div>
      </div>

      {/* Right section: theme toggle + avatar */}
      <div className="flex items-center gap-2">
        <ThemeToggle />

        <Separator orientation="vertical" className="!h-6 bg-border mx-2" />

        <DropdownMenu>
          <DropdownMenuTrigger className="outline-none" aria-label="Open user menu">
            <Avatar size="default" className="cursor-pointer ring-offset-background transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 hover:opacity-80 shadow-md">
              <AvatarFallback className="bg-primary/10 text-primary font-heading text-xs font-semibold">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 mt-2">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none text-foreground truncate">
                    {user?.name || "User"}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground truncate">
                    {user?.email || "user@example.com"}
                  </p>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            
            {isAdmin ? (
              <>
                <DropdownMenuItem className="cursor-pointer" onClick={() => router.push("/admin/settings")}>
                  <User className="mr-2 size-4" />
                  <span>Profile Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onClick={() => router.push("/admin/settings")}>
                  <Settings className="mr-2 size-4" />
                  <span>System Preferences</span>
                </DropdownMenuItem>
              </>
            ) : (
              <DropdownMenuItem 
                className="cursor-pointer"
                onClick={() => router.push("/profile")}
              >
                <User className="mr-2 size-4" />
                <span>My Profile</span>
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator />
            <DropdownMenuItem 
              variant="destructive"
              className="cursor-pointer text-error focus:text-error focus:bg-error/10"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 size-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
