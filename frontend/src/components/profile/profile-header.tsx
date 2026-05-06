"use client"

import { useProfile } from "@/hooks/student/use-profile"
import { CheckCircle2, Clock, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export function ProfileHeader() {
  const { data: profileData } = useProfile()

  const status = profileData?.profile?.verificationStatus || "NOT_VERIFIED"

  const statusConfig = {
    NOT_VERIFIED: {
      label: "Not verified",
      className: "bg-warning/10 text-warning border-warning/20",
      icon: AlertCircle
    },
    PROCESSING: {
      label: "Processing",
      className: "bg-teal-blue/10 text-teal-blue border-teal-blue/20",
      icon: Clock
    },
    VERIFIED: {
      label: "Verified",
      className: "bg-success/10 text-success border-success/20",
      icon: CheckCircle2
    },
    FAILED: {
      label: "Failed",
      className: "bg-destructive/10 text-destructive border-destructive/20",
      icon: AlertCircle
    }
  }

  const currentStatus = statusConfig[status as keyof typeof statusConfig]
  const Icon = currentStatus.icon

  return (
    <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold font-heading tracking-tight text-foreground">My Profile</h1>
        <p className="text-muted-foreground font-body">Manage your student profile and details</p>
      </div>

      <div className="flex items-center gap-3 mt-4 md:mt-0">
        <Badge variant="outline" className={cn(currentStatus.className, "px-3 py-1 font-medium gap-1.5")}>
          <Icon className="h-3.5 w-3.5" />
          {currentStatus.label}
        </Badge>
      </div>
    </div>
  )
}
