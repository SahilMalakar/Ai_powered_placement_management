import { Construction, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function ComingSoon({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
      <div className="p-6 bg-primary/5 rounded-full animate-bounce">
        <Construction className="size-16 text-primary" />
      </div>
      <div className="space-y-2">
        <h1 className="text-4xl font-heading font-bold text-foreground">{title}</h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          We're currently building this feature to give you the best experience possible. Stay tuned!
        </p>
      </div>
      <Button render={<Link href="/admin/dashboard" />} variant="outline" className="gap-2">
        <ArrowLeft className="size-4" /> Back to Dashboard
      </Button>
    </div>
  )
}
