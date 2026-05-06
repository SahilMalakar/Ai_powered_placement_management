import { AdminSidebar } from "@/components/layout/admin/sidebar"
import { Navbar } from "@/components/layout/shared/navbar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { RoleGuard } from "@/components/auth/role-guard"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RoleGuard allowedRoles={["ADMIN", "SUPER_ADMIN"]}>
      <SidebarProvider>
        <AdminSidebar />
        <SidebarInset className="bg-background">
          <Navbar />

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
    </RoleGuard>
  )
}
