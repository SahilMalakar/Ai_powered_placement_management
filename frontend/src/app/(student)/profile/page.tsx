"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProfileHeader } from "@/components/profile/profile-header"
import { ProfileCompletion } from "@/components/profile/profile-completion"
import { CoreInfoTab } from "@/components/profile/tabs/core-info-tab"
import { ExperienceTab } from "@/components/profile/tabs/experience-tab"
import { ProjectsTab } from "@/components/profile/tabs/projects-tab"
import { SkillsTab } from "@/components/profile/tabs/skills-tab"
import { DocumentsTab } from "@/components/profile/tabs/documents-tab"
import { AcademicTab } from "@/components/profile/tabs/academic-tab"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function ProfilePage() {
  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
      <ProfileHeader />
      <ProfileCompletion />
      
      <Tabs defaultValue="core" className="w-full">
        <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-1 mb-8 shadow-button inline-flex w-full md:w-auto overflow-x-auto no-scrollbar">
          <TabsList className="bg-transparent h-10 w-full md:w-auto justify-start">
            <TabsTrigger 
              value="core" 
              className="rounded-lg px-6 data-[state=active]:bg-card data-[state=active]:shadow-button data-[state=active]:text-foreground font-semibold font-heading transition-all"
            >
              Core info
            </TabsTrigger>
            <TabsTrigger 
              value="experience" 
              className="rounded-lg px-6 data-[state=active]:bg-card data-[state=active]:shadow-button data-[state=active]:text-foreground font-semibold font-heading transition-all"
            >
              Experience
            </TabsTrigger>
            <TabsTrigger 
              value="projects" 
              className="rounded-lg px-6 data-[state=active]:bg-card data-[state=active]:shadow-button data-[state=active]:text-foreground font-semibold font-heading transition-all"
            >
              Projects
            </TabsTrigger>
            <TabsTrigger 
              value="skills" 
              className="rounded-lg px-6 data-[state=active]:bg-card data-[state=active]:shadow-button data-[state=active]:text-foreground font-semibold font-heading transition-all"
            >
              Skills
            </TabsTrigger>
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
              Academic
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="bg-card shadow-card border border-border rounded-2xl p-6 md:p-8 min-h-[400px]">
          <TabsContent value="core" className="mt-0 focus-visible:outline-none">
            <CoreInfoTab />
          </TabsContent>
          <TabsContent value="experience" className="mt-0 focus-visible:outline-none">
            <ExperienceTab />
          </TabsContent>
          <TabsContent value="projects" className="mt-0 focus-visible:outline-none">
            <ProjectsTab />
          </TabsContent>
          <TabsContent value="skills" className="mt-0 focus-visible:outline-none">
            <SkillsTab />
          </TabsContent>
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
