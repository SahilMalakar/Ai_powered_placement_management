"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import type { BranchStat } from "@/types/admin/dashboard"

interface BranchDistributionProps {
  data: BranchStat[] | undefined
  isLoading: boolean
}

// Design system chart colors mapped to branches
const BRANCH_COLORS = [
  "hsl(var(--primary))",       // deep-blue / lavender
  "hsl(var(--chart-2, 172 60% 45%))",  // teal-blue
  "hsl(var(--chart-3, 210 50% 55%))",  // steel
  "hsl(var(--chart-4, 192 40% 55%))",  // mist
  "hsl(var(--chart-5, 207 70% 70%))",  // sky
  "hsl(340 65% 55%)",
  "hsl(32 80% 55%)",
  "hsl(270 55% 60%)",
  "hsl(150 50% 45%)",
]

export function BranchDistribution({ data, isLoading }: BranchDistributionProps) {
  if (isLoading) {
    return (
      <Card className="border-none shadow-heavy">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-1" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data || data.length === 0) {
    return (
      <Card className="border-none shadow-heavy">
        <CardHeader>
          <CardTitle className="text-lg font-heading">Branch Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No branch data available yet.
          </p>
        </CardContent>
      </Card>
    )
  }

  const maxTotal = Math.max(...data.map((b) => b.total), 1)

  return (
    <Card className="border-none shadow-heavy">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-heading">Branch Distribution</CardTitle>
        <CardDescription>Students per branch with placement status.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.map((branch, index) => {
            const barWidth = (branch.total / maxTotal) * 100
            const placedWidth = branch.total > 0
              ? (branch.placed / branch.total) * 100
              : 0
            const color = BRANCH_COLORS[index % BRANCH_COLORS.length]

            return (
              <div key={branch.branch} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="size-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-sm font-medium font-mono text-foreground">
                      {branch.branch}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{branch.total} students</span>
                    <span
                      className={cn(
                        "font-semibold px-1.5 py-0.5 rounded",
                        branch.placed > 0
                          ? "text-success bg-success/10"
                          : "text-muted-foreground"
                      )}
                    >
                      {branch.placed} placed
                    </span>
                  </div>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full flex rounded-full overflow-hidden">
                    {/* Placed portion */}
                    <div
                      className="h-full transition-all duration-700 ease-out"
                      style={{
                        width: `${(branch.placed / maxTotal) * 100}%`,
                        backgroundColor: color,
                        opacity: 1,
                      }}
                    />
                    {/* Remaining (not placed) portion */}
                    <div
                      className="h-full transition-all duration-700 ease-out"
                      style={{
                        width: `${((branch.total - branch.placed) / maxTotal) * 100}%`,
                        backgroundColor: color,
                        opacity: 0.25,
                      }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-5 pt-4 border-t border-border">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <div className="size-2.5 rounded-full bg-primary" />
            <span>Placed</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <div className="size-2.5 rounded-full bg-primary/25" />
            <span>Registered</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
