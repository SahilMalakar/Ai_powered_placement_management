"use client"

import { CoreInfoTab } from "@/components/student/profile/tabs/core-info-tab"
import { useProfileStore } from "@/store/useProfileStore"
import { useUpdateProfile } from "@/hooks/student/use-update-profile"
import { useCreateProfile } from "@/hooks/student/use-create-profile"
import { useProfile } from "@/hooks/student/use-profile"
import { useRouter } from "next/navigation"

export default function CoreInfoPage() {
  const router = useRouter()
  const { formData, setFormData } = useProfileStore()
  const { data: profileData } = useProfile()
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile()
  const { mutate: createProfile, isPending: isCreating } = useCreateProfile()

  const isSaving = isUpdating || isCreating

  const handleNext = (data: any) => {
    setFormData(data)
    router.push("/profile/social")
  }

  const handleSave = (finalData?: any) => {
    const completeData = { ...formData, ...finalData }
    if (profileData?.profile) {
      updateProfile(completeData)
    } else {
      createProfile(completeData)
    }
  }

  return (
    <CoreInfoTab
      onNext={handleNext}
      onSave={handleSave}
      initialData={formData}
      isSaving={isSaving}
    />
  )
}
