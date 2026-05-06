"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAppStore } from "@/store/useAppStore"
import { AdminSidebar } from "@/components/layout/admin/sidebar"
import { AdminNavbar } from "@/components/layout/admin/navbar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAppStore()
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    // If not loading and not authenticated, redirect to login
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
      return
    }

    // If authenticated but not admin/super_admin, redirect to unauthorized or student dashboard
    if (!isLoading && isAuthenticated) {
      if (user?.role !== "ADMIN" && user?.role !== "SUPER_ADMIN") {
        router.push("/dashboard") // Student dashboard
        return
      }
      setIsAuthorized(true)
    }
  }, [isLoading, isAuthenticated, user, router])

  if (isLoading || !isAuthorized) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground animate-pulse font-medium">Verifying admin access...</p>
        </div>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset className="bg-background">
        <AdminNavbar />

        {/* Main Content Area */}
        <main className="flex-1 p-6 lg:p-8 overflow-auto relative">
          {/* Subtle background gradient overlay as per design system */}
          <div className="fixed inset-0 bg-gradient-to-t from-[#66a6ff]/[0.1] to-[#89f7fe]/[0.05] pointer-events-none -z-10 dark:hidden" />
          
          <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
