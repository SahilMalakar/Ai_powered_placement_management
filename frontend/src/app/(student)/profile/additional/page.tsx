"use client"

import { AdditionalDetailsTab } from "@/components/student/profile/tabs/additional-details-tab"
import { useProfileStore } from "@/store/useProfileStore"
import { useUpdateProfile } from "@/hooks/student/use-update-profile"
import { useCreateProfile } from "@/hooks/student/use-create-profile"
import { useProfile } from "@/hooks/student/use-profile"
import { useRouter } from "next/navigation"

export default function AdditionalPage() {
  const router = useRouter()
  const { formData } = useProfileStore()
  const { data: profileData } = useProfile()
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile()
  const { mutate: createProfile, isPending: isCreating } = useCreateProfile()

  const handleSave = (finalData?: any) => {
    const completeData = { ...formData, ...finalData }
    if (profileData?.profile) {
      updateProfile(completeData)
    } else {
      createProfile(completeData)
    }
  }

  return (
    <AdditionalDetailsTab
      onPrev={() => router.push("/profile/skills")}
      onSave={handleSave}
      isSaving={isUpdating || isCreating}
    />
  )
}
