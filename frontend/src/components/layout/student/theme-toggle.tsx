"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <Button variant="outline" size="icon" aria-label="Toggle theme" className="shadow-md" disabled>
        <Sun className="size-4" />
      </Button>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="outline"
            size="icon"
            aria-label="Toggle theme"
            className="shadow-md"
            onClick={() => setTheme(isDark ? "light" : "dark")}
          />
        }
      >
        {isDark ? (
          <Sun className="size-4 text-foreground transition-transform duration-300" />
        ) : (
          <Moon className="size-4 text-foreground transition-transform duration-300" />
        )}
      </TooltipTrigger>
      <TooltipContent side="bottom">
        Switch to {isDark ? "light" : "dark"} mode
      </TooltipContent>
    </Tooltip>
  );
}
