"use client"

import { ProjectsTab } from "@/components/profile/tabs/projects-tab"
import { useRouter } from "next/navigation"

export default function ProjectsPage() {
  const router = useRouter()

  return (
    <ProjectsTab 
      onNext={() => router.push("/profile/skills")} 
      onPrev={() => router.push("/profile/experience")} 
    />
  )
}
