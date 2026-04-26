import { Suspense } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ResetPasswordForm } from "@/components/auth/reset-password-form"

export default function ResetPasswordPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-12 px-4">
      <Card className="w-full max-w-[450px] shadow-lg border-border animate-in fade-in zoom-in duration-300">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-heading font-semibold tracking-tight">
            Reset Password
          </CardTitle>
          <CardDescription className="font-sans">
            Enter the code sent to your email and choose a new password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div>Loading...</div>}>
            <ResetPasswordForm />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}
