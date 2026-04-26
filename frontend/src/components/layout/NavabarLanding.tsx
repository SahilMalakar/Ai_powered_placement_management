"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/ThemeToggle";

export function NavabarLanding() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur shadow-sm supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
        {/* Left Side - Website Name */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold font-heading tracking-tight text-navy dark:text-pale">
            PlacementCube
          </span>
        </Link>

        {/* Right Side - Actions */}
        <div className="flex items-center gap-4 font-heading">
          <Button variant="ghost" asChild>
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Signup</Link>
          </Button>
          <div className="ml-2">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}
