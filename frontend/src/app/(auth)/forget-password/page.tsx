import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ForgetPasswordForm } from "@/components/auth/forget-password-form"

export default function ForgetPasswordPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-12 px-4">
      <Card className="w-full max-w-[450px] shadow-lg border-border animate-in fade-in zoom-in duration-300">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-heading font-semibold tracking-tight">
            Forgot Password?
          </CardTitle>
          <CardDescription className="font-sans">
            Enter your email to receive a recovery link
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ForgetPasswordForm />
        </CardContent>
      </Card>
    </div>
  )
}
