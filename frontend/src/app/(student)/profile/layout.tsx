"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { ProfileHeader } from "@/components/student/profile/profile-header"
import { cn } from "@/lib/utils"
import { CoreInfoTab } from "@/components/student/profile/tabs/core-info-tab"
import { useProfileStore } from "@/store/useProfileStore"
import { useUpdateProfile } from "@/hooks/student/use-update-profile"
import { useCreateProfile } from "@/hooks/student/use-create-profile"
import { useProfile } from "@/hooks/student/use-profile"
import { useRouter } from "next/navigation"

const WIZARD_STEPS = [
  { id: "core", label: "Core info", path: "/profile" },
  { id: "social", label: "Social", path: "/profile/social" },
  { id: "academic", label: "Academic Record", path: "/profile/academic" },
  { id: "documents", label: "Documents", path: "/profile/documents" },
  { id: "experience", label: "Experience", path: "/profile/experience" },
  { id: "projects", label: "Projects", path: "/profile/projects" },
  { id: "skills", label: "Skills", path: "/profile/skills" },
  { id: "additional", label: "Additional", path: "/profile/additional" },
] as const

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { formData, setFormData } = useProfileStore()
  const { data: profileData } = useProfile()
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile()
  const { mutate: createProfile, isPending: isCreating } = useCreateProfile()

  const isWizardPath = WIZARD_STEPS.some(s => s.path === pathname)
  const isSaving = isUpdating || isCreating

  const handleSave = (finalData?: any) => {
    const completeData = { ...formData, ...finalData }
    if (profileData?.profile) {
      updateProfile(completeData)
    } else {
      createProfile(completeData)
    }
  }

  const handleNext = (data: any, nextPath: string) => {
    setFormData(data)
    router.push(nextPath)
  }

  const isActive = (path: string) => {
    if (path === "/profile") return pathname === "/profile"
    return pathname === path
  }

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <ProfileHeader />

      {/* ── Profile Wizard Card ── */}
      <div className="space-y-4">
        <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-1 shadow-button inline-flex w-full overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1 w-full">
            {WIZARD_STEPS.map((step) => (
              <Link
                key={step.id}
                href={step.path}
                className={cn(
                  "rounded-lg px-6 py-2 text-sm font-semibold font-heading transition-all whitespace-nowrap capitalize",
                  isActive(step.path)
                    ? "bg-card shadow-button text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/40"
                )}
              >
                {step.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-card shadow-card border border-border rounded-2xl p-6 md:p-8 min-h-[400px]">
          {isWizardPath ? (
            children
          ) : (
            /* Default Wizard View */
            <CoreInfoTab
              onNext={(data) => handleNext(data, "/profile/social")}
              onSave={handleSave}
              initialData={formData}
              isSaving={isSaving}
            />
          )}
        </div>
      </div>
    </div>
  )
}
