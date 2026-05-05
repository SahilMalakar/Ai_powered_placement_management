"use client"

import { DocumentsTab } from "@/components/profile/tabs/documents-tab"
import { useRouter } from "next/navigation"

export default function DocumentsPage() {
  const router = useRouter()
  return (
    <DocumentsTab 
      onNext={() => router.push("/profile/experience")} 
      onPrev={() => router.push("/profile/academic")} 
    />
  )
}
