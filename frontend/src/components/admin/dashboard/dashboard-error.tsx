"use client"

import { AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface DashboardErrorProps {
  onRetry: () => void
}

export function DashboardError({ onRetry }: DashboardErrorProps) {
  return (
    <Card className="border-none shadow-heavy">
      <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
        <div className="p-3 rounded-full bg-error/10">
          <AlertCircle className="size-6 text-error" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-sm font-medium text-foreground">
            Failed to load dashboard data
          </p>
          <p className="text-xs text-muted-foreground">
            Something went wrong. Please try again.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 mt-2"
          onClick={onRetry}
        >
          <RefreshCw className="size-3.5" />
          Retry
        </Button>
      </CardContent>
    </Card>
  )
}
