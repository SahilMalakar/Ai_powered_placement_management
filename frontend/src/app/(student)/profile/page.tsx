"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProfileHeader } from "@/components/profile/profile-header"
import { ProfileCompletion } from "@/components/profile/profile-completion"
import { CoreInfoTab } from "@/components/profile/tabs/core-info-tab"
import { ExperienceTab } from "@/components/profile/tabs/experience-tab"
import { ProjectsTab } from "@/components/profile/tabs/projects-tab"
import { SkillsTab } from "@/components/profile/tabs/skills-tab"
import { DocumentsTab } from "@/components/profile/tabs/documents-tab"
import { AcademicTab } from "@/components/profile/tabs/academic-tab"
import { useUpdateProfile } from "@/hooks/student/use-update-profile"
import { useCreateProfile } from "@/hooks/student/use-create-profile"
import { useProfile } from "@/hooks/student/use-profile"

const STEPS = ["core", "experience", "projects", "skills"] as const
type Step = typeof STEPS[number]

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<Step>("core")
  const [formData, setFormData] = useState<any>({})
  const { data: profileData } = useProfile()
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile()
  const { mutate: createProfile, isPending: isCreating } = useCreateProfile()

  const handleNext = (data?: any) => {
    if (data) {
      setFormData((prev: any) => ({ ...prev, ...data }))
    }
    const currentIndex = STEPS.indexOf(activeTab)
    if (currentIndex < STEPS.length - 1) {
      setActiveTab(STEPS[currentIndex + 1])
    }
  }

  const handlePrev = () => {
    const currentIndex = STEPS.indexOf(activeTab)
    if (currentIndex > 0) {
      setActiveTab(STEPS[currentIndex - 1])
    }
  }

  const handleSave = (finalData?: any) => {
    const completeData = { ...formData, ...finalData }
    
    if (profileData?.profile) {
      updateProfile(completeData)
    } else {
      createProfile(completeData)
    }
  }

  const isSaving = isUpdating || isCreating

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
      <ProfileHeader />
      <ProfileCompletion />
      
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as Step)} className="w-full">
        <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-1 mb-8 shadow-button inline-flex w-full md:w-auto overflow-x-auto no-scrollbar">
          <TabsList className="bg-transparent h-10 w-full md:w-auto justify-start">
            {STEPS.map((step) => (
              <TabsTrigger 
                key={step}
                value={step} 
                className="rounded-lg px-6 data-[state=active]:bg-card data-[state=active]:shadow-button data-[state=active]:text-foreground font-semibold font-heading transition-all capitalize"
              >
                {step === "core" ? "Core info" : step}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <div className="bg-card shadow-card border border-border rounded-2xl p-6 md:p-8 min-h-[400px]">
          <TabsContent value="core" className="mt-0 focus-visible:outline-none">
            <CoreInfoTab onNext={handleNext} initialData={formData.core || formData} />
          </TabsContent>
          <TabsContent value="experience" className="mt-0 focus-visible:outline-none">
            <ExperienceTab onNext={() => handleNext()} onPrev={handlePrev} initialData={formData.experiences} />
          </TabsContent>
          <TabsContent value="projects" className="mt-0 focus-visible:outline-none">
            <ProjectsTab onNext={() => handleNext()} onPrev={handlePrev} initialData={formData.projects} />
          </TabsContent>
          <TabsContent value="skills" className="mt-0 focus-visible:outline-none">
            <SkillsTab onPrev={handlePrev} onSave={handleSave} isSaving={isSaving} initialData={formData.skills} />
          </TabsContent>
        </div>
      </Tabs>

      {/* Bottom Panel for Documents and Academic */}
      <Tabs defaultValue="documents" className="w-full">
        <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-1 mb-6 shadow-button inline-flex w-full md:w-auto overflow-x-auto no-scrollbar">
          <TabsList className="bg-transparent h-10 w-full md:w-auto justify-start">
            <TabsTrigger 
              value="documents" 
              className="rounded-lg px-6 data-[state=active]:bg-card data-[state=active]:shadow-button data-[state=active]:text-foreground font-semibold font-heading transition-all"
            >
              Documents
            </TabsTrigger>
            <TabsTrigger 
              value="academic" 
              className="rounded-lg px-6 data-[state=active]:bg-card data-[state=active]:shadow-button data-[state=active]:text-foreground font-semibold font-heading transition-all"
            >
              Academic Record
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="bg-card shadow-card border border-border rounded-2xl p-6 md:p-8 min-h-[300px]">
          <TabsContent value="documents" className="mt-0 focus-visible:outline-none">
            <DocumentsTab />
          </TabsContent>
          <TabsContent value="academic" className="mt-0 focus-visible:outline-none">
            <AcademicTab />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
