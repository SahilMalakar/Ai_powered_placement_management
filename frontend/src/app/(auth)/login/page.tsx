import { Suspense } from "react"
import { AuthCard } from "@/components/auth/auth-card"

export default function LoginPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-12">
      <Suspense fallback={<div>Loading...</div>}>
        <AuthCard mode="login" />
      </Suspense>
    </div>
  )
}
