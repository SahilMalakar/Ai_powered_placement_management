"use client"

import {
  Users,
  Briefcase,
  CheckCircle2,
  AlertCircle,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { StatCard } from "./stat-card"
import { Skeleton } from "@/components/ui/skeleton"
import type { DashboardStats } from "@/types/admin/dashboard"

interface StatsGridProps {
  data: DashboardStats | undefined
  isLoading: boolean
}

export function StatsGrid({ data, isLoading }: StatsGridProps) {
  const router = useRouter()

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[140px] rounded-xl" />
        ))}
      </div>
    )
  }

  if (!data) return null

  const placementRate = data.totalStudents > 0
    ? ((data.placedStudents / data.totalStudents) * 100).toFixed(1)
    : "0"

  const stats = [
    {
      title: "Total Students",
      value: data.totalStudents.toLocaleString(),
      description: `${data.verifiedStudents} verified profiles`,
      icon: Users,
      trend: `${data.verifiedStudents} verified`,
      trendType: "up" as const,
      accentColor: "primary",
    },
    {
      title: "Active Job Postings",
      value: data.activeJobs,
      description: `${data.totalJobs} total jobs posted`,
      icon: Briefcase,
      trend: data.draftJobs > 0 ? `${data.draftJobs} drafts` : undefined,
      trendType: "neutral" as const,
      accentColor: "primary",
      onClick: () => router.push("/admin/jobs"),
    },
    {
      title: "Placed Students",
      value: data.placedStudents,
      description: `${placementRate}% placement rate`,
      icon: CheckCircle2,
      trend: data.shortlistedStudents > 0
        ? `${data.shortlistedStudents} shortlisted`
        : undefined,
      trendType: "up" as const,
      accentColor: "success",
    },
    {
      title: "Pending Verifications",
      value: data.pendingVerifications,
      description: "Requires your review",
      icon: AlertCircle,
      trend: data.pendingVerifications > 0 ? "Action needed" : "All clear",
      trendType: data.pendingVerifications > 0 ? ("down" as const) : ("up" as const),
      accentColor: data.pendingVerifications > 0 ? "warning" : "success",
      onClick: () => router.push("/admin/students"),
    },
  ]

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </div>
  )
}
