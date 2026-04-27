"use client"

import { useProfile } from "@/hooks/student/use-profile"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export function ProfileCompletion() {
  const { data: profileData } = useProfile()
  const isCompleted = profileData?.isProfileCompleted || false
  const completion = isCompleted ? 100 : 60 // Simple fallback for now

  return (
    <Card className="mb-8 bg-card shadow-card border-border overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-semibold font-heading text-foreground/80">
            {isCompleted ? "Profile complete" : "Profile completion"}
          </span>
          <span className="text-sm font-bold font-mono text-primary">{completion}%</span>
        </div>
        
        <Progress value={completion} className="h-2 bg-muted mb-4" />
        
        <p className="text-xs text-muted-foreground font-body leading-relaxed">
          {isCompleted 
            ? "Your profile is fully verified and ready for job applications." 
            : "Complete your profile to apply for jobs. Academic fields are filled automatically after verification."}
        </p>
      </CardContent>
    </Card>
  )
}
