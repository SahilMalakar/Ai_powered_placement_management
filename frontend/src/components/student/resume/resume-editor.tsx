'use client';

import { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { resumeJsonSchema, ResumeJson, Resume } from '@/types/student/resume';
import { useUpdateResume, useExportResume } from '@/hooks/student/use-resume';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, Download, Loader2, User, Briefcase, Code, GraduationCap, Globe, List } from 'lucide-react';

import { ProfileSection } from './sections/profile-section';
import { SkillsSection } from './sections/skills-section';
import { ExperienceSection } from './sections/experience-section';
import { ProjectsSection } from './sections/projects-section';
import { EducationSection } from './sections/education-section';
import { AdditionalDetailsSection } from './sections/additional-details-section';

interface ResumeEditorProps {
  resume: Resume;
}

export function ResumeEditor({ resume }: ResumeEditorProps) {
  const [activeTab, setActiveTab] = useState('basic');
  const { mutate: updateResume, isPending: isSaving } = useUpdateResume();
  const { mutate: exportPdf, isPending: isExporting } = useExportResume();

  const form = useForm<ResumeJson>({
    resolver: zodResolver(resumeJsonSchema) as any,
    defaultValues: resume.jsonData || {
      targetRole: '',
      name: '',
      contact: {
        email: '',
        phone: '',
        linkedin: '',
        github: '',
        portfolio: '',
        leetcode: '',
        address: '',
      },
      summary: '',
      skills: [{ category: '', items: [''] }],
      workExperience: [],
      projects: [],
      education: [],
      additionalDetails: [],
    },
  });

  const { reset } = form;

  useEffect(() => {
    if (resume.jsonData) {
      reset(resume.jsonData);
    }
  }, [resume.jsonData, reset]);

  const onSubmit: SubmitHandler<ResumeJson> = (data) => {
    updateResume({ id: resume.id, jsonData: data });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-navy dark:text-foreground">Resume Editor</h1>
          <p className="text-muted-foreground">Customize your AI-generated resume content.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button 
            variant="outline" 
            onClick={() => exportPdf(resume.id)} 
            disabled={isExporting}
            className="flex-1 sm:flex-none"
          >
            {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            Export PDF
          </Button>
          <Button 
            onClick={form.handleSubmit(onSubmit)} 
            disabled={isSaving}
            className="flex-1 sm:flex-none bg-gradient-to-r from-[#818cf8] to-[#c084fc] hover:opacity-90 text-white shadow-button"
          >
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Changes
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="bg-white dark:bg-card border rounded-xl shadow-sm overflow-hidden">
              <TabsList className="w-full flex flex-wrap h-auto bg-slate-50/50 dark:bg-white/5 border-b rounded-none p-1.5 gap-1.5">
                <TabsTrigger value="basic" className="flex-1 py-3 gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-muted data-[state=active]:shadow-sm">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">Profile</span>
                </TabsTrigger>
                <TabsTrigger value="skills" className="flex-1 py-3 gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-muted data-[state=active]:shadow-sm">
                  <Globe className="h-4 w-4" />
                  <span className="hidden sm:inline">Skills</span>
                </TabsTrigger>
                <TabsTrigger value="experience" className="flex-1 py-3 gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-muted data-[state=active]:shadow-sm">
                  <Briefcase className="h-4 w-4" />
                  <span className="hidden sm:inline">Experience</span>
                </TabsTrigger>
                <TabsTrigger value="projects" className="flex-1 py-3 gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-muted data-[state=active]:shadow-sm">
                  <Code className="h-4 w-4" />
                  <span className="hidden sm:inline">Projects</span>
                </TabsTrigger>
                <TabsTrigger value="education" className="flex-1 py-3 gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-muted data-[state=active]:shadow-sm">
                  <GraduationCap className="h-4 w-4" />
                  <span className="hidden sm:inline">Education</span>
                </TabsTrigger>
                <TabsTrigger value="additional" className="flex-1 py-3 gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-muted data-[state=active]:shadow-sm">
                  <List className="h-4 w-4" />
                  <span className="hidden sm:inline">Additional</span>
                </TabsTrigger>
              </TabsList>

              <div className="p-6">
                <TabsContent value="basic" className="mt-0 space-y-6 animate-in fade-in-50 duration-300">
                  <ProfileSection form={form} />
                </TabsContent>

                <TabsContent value="skills" className="mt-0 space-y-6 animate-in fade-in-50 duration-300">
                  <SkillsSection form={form} />
                </TabsContent>

                <TabsContent value="experience" className="mt-0 space-y-6 animate-in fade-in-50 duration-300">
                  <ExperienceSection form={form} />
                </TabsContent>

                <TabsContent value="projects" className="mt-0 space-y-6 animate-in fade-in-50 duration-300">
                  <ProjectsSection form={form} />
                </TabsContent>

                <TabsContent value="education" className="mt-0 space-y-6 animate-in fade-in-50 duration-300">
                  <EducationSection form={form} />
                </TabsContent>
                
                <TabsContent value="additional" className="mt-0 space-y-6 animate-in fade-in-50 duration-300">
                  <AdditionalDetailsSection form={form} />
                </TabsContent>
              </div>
            </div>
          </Tabs>
        </form>
      </Form>
    </div>
  );
}

