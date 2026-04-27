"use client"

import { useProfile } from "@/hooks/student/use-profile"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

/**
 * Dynamically calculates and displays the student's profile completion percentage.
 * Logic:
 * - Core Fields (50%): 10% each for Name, Branch, Roll No, DOB, Phone.
 * - Professional Content (30%): 10% Exp, 10% Projects, 5% Skills, 5% Social.
 * - Verification (20%): 10% for Processing, 20% for Verified.
 */
export function ProfileCompletion() {
  const { data: profileData } = useProfile()
  
  const calculateCompletion = () => {
    if (!profileData?.profile) return 0
    const profile = profileData.profile
    let score = 0

    // 1. Core Fields (50%) - 10% each
    const coreFields: (keyof typeof profile)[] = ['fullName', 'branch', 'rollNo', 'dob', 'phoneNumber']
    coreFields.forEach(field => {
      if (profile[field]) score += 10
    })

    // 2. Relational Content (30%)
    if (profile.experiences && profile.experiences.length > 0) score += 10
    if (profile.projects && profile.projects.length > 0) score += 10
    if (profile.skills && profile.skills.length > 0) score += 5
    if (profile.socialLinks && profile.socialLinks.length > 0) score += 5

    // 3. Verification (20%)
    if (profile.verificationStatus === 'VERIFIED') score += 20
    else if (profile.verificationStatus === 'PROCESSING') score += 10
    else if (profile.verificationStatus === 'FAILED') score += 5 // Partial credit for attempt

    return Math.min(score, 100)
  }

  const completion = calculateCompletion()
  const isFullyVerified = profileData?.profile?.verificationStatus === 'VERIFIED'
  const isBasicComplete = profileData?.isProfileCompleted || false

  return (
    <Card className="mb-8 bg-card shadow-card border-border overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-semibold font-heading text-foreground/80">
            {isFullyVerified ? "Profile complete" : "Profile completion"}
          </span>
          <span className="text-sm font-bold font-mono text-primary">{completion}%</span>
        </div>
        
        <Progress value={completion} className="h-2 bg-muted mb-4" />
        
        <p className="text-xs text-muted-foreground font-body leading-relaxed">
          {isFullyVerified 
            ? "Your profile is fully verified and ready for job applications." 
            : !isBasicComplete 
              ? "Complete your basic information to get started."
              : "Basic info done! Now upload marksheets and initiate verification to apply for jobs."}
        </p>
      </CardContent>
    </Card>
  )
}
