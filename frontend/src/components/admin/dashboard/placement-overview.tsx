"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { DashboardStats } from "@/types/admin/dashboard"

interface PlacementOverviewProps {
  data: DashboardStats | undefined
  isLoading: boolean
}

/** A single horizontal progress bar */
function ProgressBar({
  label,
  value,
  total,
  color,
}: {
  label: string
  value: number
  total: number
  color: string
}) {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-foreground">{label}</span>
        <span className="text-muted-foreground">
          {value} <span className="text-xs">/ {total}</span>{" "}
          <span className="text-xs font-semibold">({percentage}%)</span>
        </span>
      </div>
      <div className="h-2.5 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  )
}

export function PlacementOverview({ data, isLoading }: PlacementOverviewProps) {
  if (isLoading) {
    return (
      <Card className="border-none shadow-heavy">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-1" />
        </CardHeader>
        <CardContent className="space-y-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-2.5 w-full rounded-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  if (!data) return null

  const metrics = [
    {
      label: "Placement Rate",
      value: data.placedStudents,
      total: data.totalStudents,
      color: "hsl(var(--success))",
    },
    {
      label: "Profile Verification",
      value: data.verifiedStudents,
      total: data.totalStudents,
      color: "hsl(var(--primary))",
    },
    {
      label: "Applications Received",
      value: data.totalApplications,
      total: data.totalStudents * data.activeJobs || 1,
      color: "hsl(var(--chart-2, 78 70% 50%))",
    },
    {
      label: "Active Jobs",
      value: data.activeJobs,
      total: data.totalJobs,
      color: "hsl(var(--chart-3, 210 70% 50%))",
    },
  ]

  return (
    <Card className="border-none shadow-heavy">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-heading">Placement Overview</CardTitle>
        <CardDescription>
          Key performance indicators for the current academic year.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {metrics.map((metric) => (
          <ProgressBar key={metric.label} {...metric} />
        ))}
      </CardContent>
    </Card>
  )
}
