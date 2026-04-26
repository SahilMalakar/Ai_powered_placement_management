"use client"

import { useAppStore } from "@/store/useAppStore"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function DashboardPage() {
  const { user, setAuthenticated } = useAppStore()
  const router = useRouter()

  const handleLogout = () => {
    setAuthenticated(false)
    router.push("/login")
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Welcome to Dashboard</h1>
      <p className="mb-4">You are now logged in.</p>
      <Button onClick={handleLogout}>Logout</Button>
    </div>
  )
}
