"use client"

import * as React from "react"
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  Users,
  ShieldCheck,
  BarChart3,
  Download,
  UserPlus,
  Settings,
  LogOut,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useAppStore } from "@/store/useAppStore"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface NavItem {
  title: string
  url: string
  icon: React.ElementType
  badge?: string
  roles?: string[]
  items?: { title: string; url: string }[]
}

interface NavGroup {
  title: string
  items: NavItem[]
}

const data: { navMain: NavGroup[] } = {
  navMain: [
    {
      title: "Overview",
      items: [
        {
          title: "Dashboard",
          url: "/admin/dashboard",
          icon: LayoutDashboard,
        },
      ],
    },
    {
      title: "Placement Operations",
      items: [
        {
          title: "Jobs",
          url: "/admin/jobs",
          icon: Briefcase,
          items: [
            {
              title: "All Jobs",
              url: "/admin/jobs",
            },
            {
              title: "Post New Job",
              url: "/admin/jobs/create",
            },
          ],
        },
        {
          title: "Applications",
          url: "/admin/applications",
          icon: FileText,
        },
      ],
    },
    {
      title: "Student Management",
      items: [
        {
          title: "Student Directory",
          url: "/admin/students",
          icon: Users,
        },
        {
          title: "Verifications",
          url: "/admin/verification",
          icon: ShieldCheck,
          badge: "12", // Placeholder for actual count
        },
      ],
    },
    {
      title: "Intelligence",
      items: [
        {
          title: "ATS Analytics",
          url: "/admin/analytics",
          icon: BarChart3,
        },
        {
          title: "Export Center",
          url: "/admin/export",
          icon: Download,
          roles: ["SUPER_ADMIN"],
        },
      ],
    },
    {
      title: "Configuration",
      items: [
        {
          title: "Admin Team",
          url: "/admin/team",
          icon: UserPlus,
          roles: ["SUPER_ADMIN"],
        },
        {
          title: "System Settings",
          url: "/admin/settings",
          icon: Settings,
        },
      ],
    },
  ],
}

export function AdminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = useAppStore((state) => state.user)
  const pathname = usePathname()

  // Flatten the navigation items for a single-level experience
  const allItems: NavItem[] = data.navMain.flatMap(group => group.items)
  
  // Filter items based on roles
  const filteredItems = allItems.filter(
    (item) => !item.roles || (user?.role && item.roles.includes(user.role))
  )

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
        <div className="flex flex-col gap-1.5 overflow-hidden group-data-[collapsible=icon]:hidden">
          <span className="font-heading text-lg font-bold tracking-tight text-sidebar-foreground leading-none">
            PlacementCube
          </span>
          <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] leading-none opacity-80">
            Admin Portal
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent className="py-4 px-3 space-y-1">
        <SidebarMenu>
          {filteredItems.map((item) => {
            const isActive = pathname === item.url || pathname.startsWith(item.url + "/")
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton 
                  render={<Link href={item.url} />}
                  isActive={isActive}
                  tooltip={item.title}
                  className={cn(
                    "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 h-auto",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-primary"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  )}
                >
                  <div className="flex items-center w-full">
                    <item.icon className={cn("size-[18px] shrink-0 mr-3 transition-colors duration-200", isActive ? "text-sidebar-primary" : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground/70")} />
                    <span className="flex-1">{item.title}</span>
                    {item.badge && (
                      <span className="px-1.5 py-0.5 rounded-full bg-primary/10 text-[10px] text-primary font-bold">
                        {item.badge}
                      </span>
                    )}
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-0 border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              className="w-full h-12 px-5 text-error hover:bg-error/5 hover:text-error transition-colors rounded-none"
            >
              <LogOut className="size-4 mr-3" />
              <span className="font-medium">Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <div className="px-5 py-3 border-t border-sidebar-border bg-sidebar/30">
          <p className="text-[10px] text-sidebar-foreground/40 font-medium">
            © 2026 PlacementCube · Admin v1.0
          </p>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
