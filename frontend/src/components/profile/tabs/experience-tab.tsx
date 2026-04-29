import { useState } from "react"
import { useExperiences, useAddExperience, useUpdateExperience, useDeleteExperience } from "@/hooks/student/use-experiences"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Edit2, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { ExperienceDialog } from "./experience-dialog"
import { Experience } from "@/types/profile"

interface ExperienceTabProps {
  onNext: () => void
  onPrev: () => void
}

export function ExperienceTab({ onNext, onPrev }: ExperienceTabProps) {
  const { data: experiencesData, isLoading } = useExperiences()
  const { mutate: addExperience, isPending: isAdding } = useAddExperience()
  const { mutate: updateExperience, isPending: isUpdating } = useUpdateExperience()
  const { mutate: deleteExperience, isPending: isDeleting } = useDeleteExperience()
  
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null)

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

  const experiences = experiencesData || []

  const handleSave = (data: any) => {
    if (editingExperience) {
      updateExperience({ id: editingExperience.id, data }, {
        onSuccess: () => setIsDialogOpen(false)
      })
    } else {
      addExperience(data, {
        onSuccess: () => setIsDialogOpen(false)
      })
    }
  }

  const handleDelete = (id: number) => {
    deleteExperience(id)
  }

  const openAddDialog = () => {
    setEditingExperience(null)
    setIsDialogOpen(true)
  }

  const openEditDialog = (exp: Experience) => {
    setEditingExperience(exp)
    setIsDialogOpen(true)
  }

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="flex-1 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Work Experience</h3>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2 border-border shadow-button" 
            disabled={isPending}
            onClick={openAddDialog}
          >
            <Plus className="h-4 w-4" />
            Add experience
          </Button>
        </div>

        <div className="space-y-4">
          {experiences.map((exp) => (
            <Card key={exp.id} className={cn("bg-card shadow-card border-border overflow-hidden", isPending && "opacity-50")}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-bold text-foreground font-heading">{exp.role} — {exp.company}</h4>
                    <p className="text-sm text-muted-foreground mt-1 font-body">
                      {new Date(exp.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} – 
                      {exp.endDate ? new Date(exp.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : "Present"} 
                      {exp.location && ` · ${exp.location}`}
                    </p>
                    <div className="mt-3 space-y-1">
                      {exp.description.map((bullet, i) => (
                        <p key={i} className="text-xs text-muted-foreground font-body flex gap-2">
                          <span className="text-primary">•</span>
                          {bullet}
                        </p>
                      ))}
                    </div>
                    {exp.toolsUsed && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {exp.toolsUsed.split(',').map((tool) => (
                          <Badge key={tool.trim()} variant="secondary" className="bg-secondary/50 text-foreground font-medium text-[11px] px-2.5 py-0.5 border-border">
                            {tool.trim()}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-8 w-8 border-border" 
                      disabled={isPending}
                      onClick={() => openEditDialog(exp)}
                    >
                      <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-8 w-8 border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20"
                      onClick={() => handleDelete(exp.id!)}
                      disabled={isPending}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {experiences.length === 0 && (
            <Button 
              variant="ghost" 
              className="w-full border-2 border-dashed border-border py-8 rounded-xl hover:bg-accent/50 text-muted-foreground font-medium transition-all group"
              disabled={isPending}
              onClick={openAddDialog}
            >
              <div className="flex flex-col items-center gap-2">
                <Plus className="h-5 w-5 group-hover:scale-110 transition-transform" />
                <span>Add your first work experience</span>
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

      <ExperienceDialog 
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSave={handleSave}
        initialData={editingExperience}
      />
    </div>
  )
}
