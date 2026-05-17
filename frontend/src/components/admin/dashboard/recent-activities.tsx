"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { Briefcase, UserCheck, UserPlus, Award } from "lucide-react"
import type { ActivityItem } from "@/types/admin/dashboard"

interface RecentActivitiesProps {
  activities: ActivityItem[] | undefined
  isLoading: boolean
}

const activityConfig: Record<
  ActivityItem["type"],
  { icon: React.ElementType; color: string; bgColor: string }
> = {
  JOB_POSTED: {
    icon: Briefcase,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  APPLICATION_RECEIVED: {
    icon: UserPlus,
    color: "text-teal-blue",
    bgColor: "bg-teal-blue/10",
  },
  STUDENT_SELECTED: {
    icon: Award,
    color: "text-success",
    bgColor: "bg-success/10",
  },
  STUDENT_SHORTLISTED: {
    icon: UserCheck,
    color: "text-warning",
    bgColor: "bg-warning/10",
  },
}

function getRelativeTime(timestamp: string): string {
  const now = new Date()
  const date = new Date(timestamp)
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays === 1) return "Yesterday"
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" })
}

export function RecentActivities({ activities, isLoading }: RecentActivitiesProps) {
  if (isLoading) {
    return (
      <Card className="border-none shadow-heavy">
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="size-9 rounded-lg shrink-0" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  const items = activities ?? []

  return (
    <Card className="border-none shadow-heavy">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-heading">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No recent activity to display.
          </p>
        ) : (
          <div className="space-y-1">
            {items.map((activity, index) => {
              const config = activityConfig[activity.type]
              const Icon = config.icon

              return (
                <div
                  key={`${activity.type}-${index}`}
                  className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-accent/50 transition-colors duration-200"
                >
                  <div
                    className={cn(
                      "p-2 rounded-lg shrink-0 mt-0.5",
                      config.bgColor
                    )}
                  >
                    <Icon className={cn("size-4", config.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {activity.title}
                    </p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {activity.description}
                    </p>
                  </div>
                  <span className="text-[11px] text-muted-foreground whitespace-nowrap shrink-0 mt-1">
                    {getRelativeTime(activity.timestamp)}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
