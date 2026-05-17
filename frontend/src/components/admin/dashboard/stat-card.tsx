import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface StatCardProps {
  title: string
  value: string | number
  description: string
  icon: LucideIcon
  trend?: string
  trendType?: "up" | "down" | "neutral"
  accentColor?: string
  onClick?: () => void
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  trendType = "neutral",
  accentColor = "primary",
  onClick,
}: StatCardProps) {
  return (
    <Card
      className={cn(
        "border-none shadow-heavy hover:shadow-xl transition-all duration-300 group",
        onClick && "cursor-pointer hover:-translate-y-0.5"
      )}
      onClick={onClick}
    >
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold font-heading tracking-tight">{value}</p>
          </div>
          <div
            className={cn(
              "p-2.5 rounded-xl transition-colors duration-300",
              accentColor === "primary" && "bg-primary/10 text-primary group-hover:bg-primary/15",
              accentColor === "success" && "bg-success/10 text-success group-hover:bg-success/15",
              accentColor === "warning" && "bg-warning/10 text-warning group-hover:bg-warning/15",
              accentColor === "error" && "bg-error/10 text-error group-hover:bg-error/15"
            )}
          >
            <Icon className="size-5" />
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">{description}</p>
          {trend && (
            <span
              className={cn(
                "text-xs font-semibold px-2 py-0.5 rounded-full",
                trendType === "up" && "text-success bg-success/10",
                trendType === "down" && "text-error bg-error/10",
                trendType === "neutral" && "text-muted-foreground bg-muted"
              )}
            >
              {trend}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
