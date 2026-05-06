"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { studentNavItems } from "./sidebar-nav-items";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

export const SIDEBAR_WIDTH = 260; // px

export function StudentSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border shadow-sidebar rounded-r-2xl overflow-hidden" {...props}>
      <SidebarHeader className="h-16 flex flex-row items-center gap-2.5 px-5 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center border-b border-sidebar-border bg-sidebar/50">
        <div className="flex size-8 group-data-[collapsible=icon]:size-7 items-center justify-center rounded-lg bg-primary shrink-0">
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
        <div className="flex flex-col gap-0.5 overflow-hidden group-data-[collapsible=icon]:hidden">
          <span className="font-heading text-lg font-bold tracking-tight text-sidebar-foreground leading-none">
            PlacementCube
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent className="py-4 px-3 space-y-1">
        <SidebarMenu>
          {studentNavItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton 
                  render={<Link href={item.href} />}
                  isActive={isActive}
                  tooltip={item.label}
                  className={cn(
                    "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 h-auto",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-primary"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  )}
                >
                  <div className="flex items-center w-full">
                    <item.icon className={cn("size-[18px] shrink-0 mr-3 transition-colors duration-200", isActive ? "text-sidebar-primary" : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground/70")} />
                    <span className="flex-1">{item.label}</span>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-0 border-t border-sidebar-border">
        <div className="px-5 py-3 border-t border-sidebar-border bg-sidebar/30">
          <p className="text-[10px] text-sidebar-foreground/40 font-medium group-data-[collapsible=icon]:hidden">
            © 2026 PlacementCube
          </p>
          <div className="hidden group-data-[collapsible=icon]:flex items-center justify-center">
             <span className="text-[10px] text-sidebar-foreground/40 font-bold">PC</span>
          </div>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
