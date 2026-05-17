"use client"

import { useRouter } from "next/navigation"
import { Plus, Send, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"

export function QuickActions() {
  const router = useRouter()

  const actions = [
    {
      label: "Post New Job",
      icon: Plus,
      onClick: () => router.push("/admin/jobs"),
    },
    {
      label: "Send Announcement",
      icon: Send,
      onClick: () => router.push("/admin/messages"),
    },
    {
      label: "Review Verifications",
      icon: ShieldCheck,
      onClick: () => router.push("/admin/students"),
    },
  ]

  return (
    <div className="flex flex-wrap gap-3">
      {actions.map((action) => (
        <Button
          key={action.label}
          variant="outline"
          size="sm"
          className="gap-2 h-9 px-4 font-medium shadow-subtle hover:shadow-md transition-all duration-200"
          onClick={action.onClick}
        >
          <action.icon className="size-3.5" />
          {action.label}
        </Button>
      ))}
    </div>
  )
}
