"use client";

import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { SIDEBAR_WIDTH } from "./sidebar";
import { useAppStore } from "@/store/useAppStore";

/**
 * Student-area top navbar.
 * Fixed at top, full width. On desktop, it has a left offset equal to the sidebar width.
 */
export function StudentNavbar() {
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

  // Log the current user state to the browser console for debugging
  console.log("Current Zustand User State:", user);

  return (
    <header
      className="fixed inset-x-0 top-0 z-30 flex h-16 items-center border-b border-border bg-background/80 backdrop-blur-md"
      style={{ paddingLeft: 0 }}
    >
      {/* Desktop: offset the navbar content past the sidebar */}
      <div
        className="hidden md:block shrink-0"
        style={{ width: SIDEBAR_WIDTH }}
      />

      {/* Mobile wordmark — only visible on small screens */}
      <div className="flex md:hidden items-center gap-2.5 pl-5">
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

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right section: theme toggle + avatar */}
      <div className="flex items-center gap-2 pr-5">
        <ThemeToggle />

        <Separator orientation="vertical" className="!h-6 bg-border" />

        <DropdownMenu>
          <DropdownMenuTrigger className="outline-none" aria-label="Open user menu">
            <Avatar size="default" className="cursor-pointer ring-offset-background transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 hover:opacity-80 shadow-md">
              <AvatarFallback className="bg-primary/10 text-primary font-heading text-xs font-semibold">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none text-foreground truncate">
                    {user?.name || "Student User"}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground truncate">
                    {user?.email || "student@example.com"}
                  </p>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="cursor-pointer"
              onClick={() => router.push("/profile")}
            >
              <User className="mr-2 size-4" />
              <span>My Profile</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              variant="destructive"
              className="cursor-pointer"
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
