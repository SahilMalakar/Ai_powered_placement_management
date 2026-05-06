"use client"

import { AcademicTab } from "@/components/student/profile/tabs/academic-tab"
import { useRouter } from "next/navigation"

export default function AcademicPage() {
  const router = useRouter()
  return (
    <AcademicTab
      onNext={() => router.push("/profile/documents")}
      onPrev={() => router.push("/profile/social")}
    />
  )
}
