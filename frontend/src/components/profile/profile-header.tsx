"use client"

import { useProfile } from "@/hooks/student/use-profile"
import { useInitiateVerification } from "@/hooks/student/use-verification"
import { CheckCircle2, Clock, AlertCircle, Loader2, MoreHorizontal } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ProfileHeader() {
  const { data: profileData } = useProfile()
  const { mutate: initiateVerify, isPending } = useInitiateVerification()

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

        {status !== "VERIFIED" && (
          <div className="flex items-center bg-card rounded-md shadow-button border border-border overflow-hidden">
            <Button
              className="btn-primary rounded-r-none h-9 px-4 border-none shadow-none"
              onClick={() => initiateVerify()}
              disabled={status === "PROCESSING" || isPending}
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {status === "PROCESSING" ? "Processing..." : "Verify now"}
            </Button>
            <Separator orientation="vertical" className="h-4 bg-white/20" />
            <DropdownMenu>
              <DropdownMenuTrigger
                className={cn(
                  buttonVariants({ variant: "ghost", size: "icon" }),
                  "h-9 w-9 rounded-l-none hover:bg-accent/50 border-none focus-visible:ring-0"
                )}
              >
                <MoreHorizontal className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 shadow-modal">
                <DropdownMenuItem className="cursor-pointer">Download PDF</DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">Privacy Settings</DropdownMenuItem>
                <Separator className="my-1" />
                <DropdownMenuItem className="text-destructive cursor-pointer">Reset Profile</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        {status === "VERIFIED" && (
          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                buttonVariants({ variant: "outline", size: "icon" }),
                "h-9 w-9 rounded-md shadow-button border-border hover:bg-accent/50 focus-visible:ring-0"
              )}
            >
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 shadow-modal">
              <DropdownMenuItem className="cursor-pointer">Download PDF</DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">Privacy Settings</DropdownMenuItem>
              <Separator className="my-1" />
              <DropdownMenuItem className="text-destructive cursor-pointer">Reset Profile</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  )
}