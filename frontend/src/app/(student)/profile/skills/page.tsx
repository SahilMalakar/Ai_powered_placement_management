"use client"

import { SkillsTab } from "@/components/profile/tabs/skills-tab"
import { useUpdateProfile } from "@/hooks/student/use-update-profile"
import { useCreateProfile } from "@/hooks/student/use-create-profile"
import { useRouter } from "next/navigation"

export default function SkillsPage() {
  const router = useRouter()
  const { isPending: isUpdating } = useUpdateProfile()
  const { isPending: isCreating } = useCreateProfile()

  return (
    <SkillsTab 
      onNext={() => router.push("/profile/additional")} 
      onPrev={() => router.push("/profile/projects")} 
      isSaving={isUpdating || isCreating}
    />
  )
}
