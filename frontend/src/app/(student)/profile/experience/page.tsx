"use client"

import { ExperienceTab } from "@/components/profile/tabs/experience-tab"
import { useRouter } from "next/navigation"

export default function ExperiencePage() {
  const router = useRouter()

  return (
    <ExperienceTab 
      onNext={() => router.push("/profile/projects")} 
      onPrev={() => router.push("/profile/documents")} 
    />
  )
}
