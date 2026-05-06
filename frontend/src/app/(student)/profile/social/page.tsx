"use client"

import { SocialLinksTab } from "@/components/student/profile/tabs/social-links-tab"
import { useRouter } from "next/navigation"

export default function SocialPage() {
  const router = useRouter()

  return (
    <SocialLinksTab
      onNext={() => router.push("/profile/academic")}
      onPrev={() => router.push("/profile")}
    />
  )
}
