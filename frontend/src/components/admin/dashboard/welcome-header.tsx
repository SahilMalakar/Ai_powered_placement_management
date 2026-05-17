"use client"

import { useAppStore } from "@/store/useAppStore"

/** Time-based greeting with admin name */
export function WelcomeHeader() {
  const user = useAppStore((state) => state.user)

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 17) return "Good afternoon"
    return "Good evening"
  }

  const name = user?.name?.split(" ")[0] || "Admin"

  return (
    <div>
      <h1 className="text-3xl font-heading font-bold text-foreground">
        {getGreeting()}, {name} 👋
      </h1>
      <p className="text-muted-foreground mt-1.5 text-[15px]">
        Here&apos;s what&apos;s happening across your placement platform today.
      </p>
    </div>
  )
}
