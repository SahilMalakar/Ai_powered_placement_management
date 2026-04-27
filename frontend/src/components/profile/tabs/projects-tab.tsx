"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Edit2, Trash2 } from "lucide-react"
import { useProfile } from "@/hooks/student/use-profile"
import { useUpdateProfile } from "@/hooks/student/use-update-profile"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface ProjectsTabProps {
  onNext: () => void
  onPrev: () => void
  initialData?: any
}

export function ProjectsTab({ onNext, onPrev, initialData }: ProjectsTabProps) {
  const { data: profileData, isLoading } = useProfile()
  const { mutate: updateProfile, isPending } = useUpdateProfile()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
    )
  }

  const projects = profileData?.profile?.projects || []

  const handleDelete = (id: number) => {
    const updatedProjects = projects
      .filter(p => p.id !== id)
      .map(({ id: _id, profileId: _pid, ...rest }) => rest)

    updateProfile({
      projects: updatedProjects as any
    })
  }

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="flex-1 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Personal Projects</h3>
          <Button variant="outline" size="sm" className="gap-2 border-border shadow-button" disabled={isPending}>
            <Plus className="h-4 w-4" />
            Add project
          </Button>
        </div>

        <div className="space-y-4">
          {projects.map((project: any) => (
            <Card key={project.id} className={cn("bg-card shadow-card border-border overflow-hidden", isPending && "opacity-50")}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-foreground font-heading">{project.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1 font-body">
                      {project.keyTools}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-4">
                      {Array.isArray(project.description) && project.description.map((bullet: string, i: number) => (
                        <p key={i} className="text-xs text-muted-foreground font-body">• {bullet}</p>
                      ))}
                    </div>
                    {(project.link || project.secondaryLink) && (
                      <div className="flex items-center gap-4 mt-4">
                        {project.link && (
                          <a href={project.link} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline font-medium">
                            Live Demo
                          </a>
                        )}
                        {project.secondaryLink && (
                          <a href={project.secondaryLink} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline font-medium">
                            GitHub
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" className="h-8 w-8 border-border" disabled={isPending}>
                      <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-8 w-8 border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20"
                      onClick={() => handleDelete(project.id!)}
                      disabled={isPending}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <Button 
            variant="ghost" 
            className="w-full border-2 border-dashed border-border py-8 rounded-xl hover:bg-accent/50 text-muted-foreground font-medium transition-all group"
            disabled={isPending}
          >
            <div className="flex flex-col items-center gap-2">
              <Plus className="h-5 w-5 group-hover:scale-110 transition-transform" />
              <span>Add another project</span>
            </div>
          </Button>
        </div>
      </div>

      <div className="flex justify-between items-center pt-8 border-t border-border mt-auto">
        <Button 
          variant="secondary" 
          onClick={onPrev}
          className="px-6 h-11 rounded-xl shadow-button flex items-center gap-2"
        >
          <span className="text-lg">←</span>
          Previous
        </Button>
        <Button 
          onClick={onNext}
          className="btn-primary px-10 h-11 rounded-xl shadow-button flex items-center gap-2"
        >
          Next step
          <span className="text-lg">→</span>
        </Button>
      </div>
    </div>
  )
}
