import { useState } from "react"
import { useProjects, useAddProject, useUpdateProject, useDeleteProject } from "@/hooks/student/use-projects"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Edit2, Trash2, ExternalLink, GitFork } from "lucide-react"
import { cn } from "@/lib/utils"
import { ProjectDialog } from "./project-dialog"
import { Project } from "@/types/profile"

interface ProjectsTabProps {
  onNext: () => void
  onPrev: () => void
}

export function ProjectsTab({ onNext, onPrev }: ProjectsTabProps) {
  const { data: projectsData, isLoading } = useProjects()
  const { mutate: addProject, isPending: isAdding } = useAddProject()
  const { mutate: updateProject, isPending: isUpdating } = useUpdateProject()
  const { mutate: deleteProject, isPending: isDeleting } = useDeleteProject()
  
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)

  const isPending = isAdding || isUpdating || isDeleting

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
    )
  }

  const projects = projectsData || []

  const handleSave = (data: any) => {
    if (editingProject) {
      updateProject({ id: editingProject.id, data }, {
        onSuccess: () => setIsDialogOpen(false)
      })
    } else {
      addProject(data, {
        onSuccess: () => setIsDialogOpen(false)
      })
    }
  }

  const handleDelete = (id: number) => {
    deleteProject(id)
  }

  const openAddDialog = () => {
    setEditingProject(null)
    setIsDialogOpen(true)
  }

  const openEditDialog = (project: Project) => {
    setEditingProject(project)
    setIsDialogOpen(true)
  }

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="flex-1 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Personal Projects</h3>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2 border-border shadow-button" 
            disabled={isPending}
            onClick={openAddDialog}
          >
            <Plus className="h-4 w-4" />
            Add project
          </Button>
        </div>

        <div className="space-y-4">
          {projects.map((project: any) => (
            <Card key={project.id} className={cn("bg-card shadow-card border-border overflow-hidden", isPending && "opacity-50")}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-bold text-foreground font-heading">{project.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1 font-body">
                      {project.keyTools}
                    </p>
                    <div className="mt-3 space-y-1">
                      {Array.isArray(project.description) && project.description.map((bullet: string, i: number) => (
                        <p key={i} className="text-xs text-muted-foreground font-body flex gap-2">
                          <span className="text-primary">•</span>
                          {bullet}
                        </p>
                      ))}
                    </div>
                    {(project.link || project.secondaryLink) && (
                      <div className="flex items-center gap-4 mt-4">
                        {project.link && (
                          <a 
                            href={project.link} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="text-xs text-primary hover:underline font-medium flex items-center gap-1"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Live Link
                          </a>
                        )}
                        {project.secondaryLink && (
                          <a 
                            href={project.secondaryLink} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="text-xs text-primary hover:underline font-medium flex items-center gap-1"
                          >
                            <GitFork className="h-3 w-3" />
                            GitHub
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-8 w-8 border-border" 
                      disabled={isPending}
                      onClick={() => openEditDialog(project)}
                    >
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

          {projects.length === 0 && (
            <Button 
              variant="ghost" 
              className="w-full border-2 border-dashed border-border py-8 rounded-xl hover:bg-accent/50 text-muted-foreground font-medium transition-all group"
              disabled={isPending}
              onClick={openAddDialog}
            >
              <div className="flex flex-col items-center gap-2">
                <Plus className="h-5 w-5 group-hover:scale-110 transition-transform" />
                <span>Add your first personal project</span>
              </div>
            </Button>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center pt-8 border-t border-border mt-auto">
        <Button 
          variant="secondary" 
          onClick={onPrev}
          className="px-5 h-9 rounded-xl shadow-button flex items-center gap-2"
        >
          <span className="text-lg">←</span>
          Previous
        </Button>
        <Button 
          onClick={onNext}
          className="btn-primary px-7 h-9 rounded-xl shadow-button flex items-center gap-2"
        >
          Next
          <span className="text-lg">→</span>
        </Button>
      </div>

      <ProjectDialog 
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSave={handleSave}
        initialData={editingProject}
      />
    </div>
  )
}
