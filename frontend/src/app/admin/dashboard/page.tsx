"use client"

import { useAdminDashboardStats } from "@/hooks/admin/useAdminDashboard"
import { WelcomeHeader } from "@/components/admin/dashboard/welcome-header"
import { StatsGrid } from "@/components/admin/dashboard/stats-grid"
import { QuickActions } from "@/components/admin/dashboard/quick-actions"
import { PlacementOverview } from "@/components/admin/dashboard/placement-overview"
import { RecentActivities } from "@/components/admin/dashboard/recent-activities"
import { BranchDistribution } from "@/components/admin/dashboard/branch-distribution"
import { DashboardError } from "@/components/admin/dashboard/dashboard-error"

export default function AdminDashboardPage() {
  const { data, isLoading, isError, refetch } = useAdminDashboardStats()
  const stats = data?.data

  if (isError) {
    return (
      <div className="space-y-8">
        <WelcomeHeader />
        <DashboardError onRetry={() => refetch()} />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header + Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <WelcomeHeader />
        <QuickActions />
      </div>

      {/* Stat Cards */}
      <StatsGrid data={stats} isLoading={isLoading} />

      {/* Charts + Activity Feed */}
      <div className="grid gap-6 lg:grid-cols-7">
        <div className="lg:col-span-4 space-y-6">
          <PlacementOverview data={stats} isLoading={isLoading} />
          <BranchDistribution
            data={stats?.branchDistribution}
            isLoading={isLoading}
          />
        </div>
        <div className="lg:col-span-3">
          <RecentActivities
            activities={stats?.recentActivities}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  )
}
