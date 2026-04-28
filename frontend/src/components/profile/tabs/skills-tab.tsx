import { useState } from "react"
import { useAddSkill, useUpdateSkill, useDeleteSkill, useSkills } from "@/hooks/student/use-skills"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, X, Edit2, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { SkillDialog } from "./skill-dialog"
import { Skill } from "@/types/profile"

interface SkillsTabProps {
  onNext: () => void
  onPrev: () => void
  isSaving: boolean
  initialData?: any
}

export function SkillsTab({ onNext, onPrev, isSaving, initialData }: SkillsTabProps) {
  const { data: skillCategoriesData, isLoading } = useSkills()
  const { mutate: addSkill, isPending: isAdding } = useAddSkill()
  const { mutate: updateSkill, isPending: isUpdatingSkill } = useUpdateSkill()
  const { mutate: deleteSkill, isPending: isDeleting } = useDeleteSkill()
  
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Skill | null>(null)

  const isMutationPending = isAdding || isUpdatingSkill || isDeleting

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-10 w-full" />
        <div className="space-y-6">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      </div>
    )
  }

  const skillCategories = skillCategoriesData || []

  const handleSaveCategory = (data: any) => {
    if (editingCategory) {
      updateSkill({ 
        id: editingCategory.id, 
        data: {
          category: data.category,
          skills: data.skills
        } 
      })
    } else {
      addSkill(data)
    }
    setIsDialogOpen(false)
  }

  const handleDeleteCategory = (id: number) => {
    deleteSkill(id)
  }

  const removeSkill = (category: Skill, skillToRemove: string) => {
    const updatedSkills = category.skills.filter((s: string) => s !== skillToRemove)
    
    updateSkill({
      id: category.id,
      data: {
        skills: updatedSkills
      }
    })
  }

  const openAddDialog = () => {
    setEditingCategory(null)
    setIsDialogOpen(true)
  }

  const openEditDialog = (category: Skill) => {
    setEditingCategory(category)
    setIsDialogOpen(true)
  }

  return (
    <div className="space-y-8 flex flex-col h-full">
      <div className="flex-1 space-y-8">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Skills</h3>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2 border-border shadow-button" 
            disabled={isSaving || isMutationPending}
            onClick={openAddDialog}
          >
            <Plus className="h-4 w-4" />
            Add category
          </Button>
        </div>

        <div className="space-y-8">
          {skillCategories.map((category: Skill) => (
            <div key={category.id} className={cn("space-y-4 group", (isSaving || isMutationPending) && "opacity-50")}>
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-foreground font-heading">{category.category}</h4>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    onClick={() => openEditDialog(category)}
                    disabled={isSaving || isMutationPending}
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDeleteCategory(category.id!)}
                    disabled={isSaving || isMutationPending}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 items-center">
                {category.skills.map((skill: string) => (
                  <Badge 
                    key={skill} 
                    variant="outline" 
                    className="bg-card shadow-button border-border font-medium px-4 py-1.5 hover:bg-accent group/skill transition-colors"
                  >
                    {skill}
                    <button 
                      className="ml-2 opacity-0 group-hover/skill:opacity-100 transition-opacity"
                      onClick={() => removeSkill(category, skill)}
                      disabled={isSaving || isMutationPending}
                    >
                      <X className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                    </button>
                  </Badge>
                ))}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 border-dashed border-border text-muted-foreground hover:text-foreground hover:border-solid gap-1 text-xs"
                  disabled={isSaving || isMutationPending}
                  onClick={() => openEditDialog(category)}
                >
                  <Plus className="h-3 w-3" />
                  add
                </Button>
              </div>
            </div>
          ))}

          {skillCategories.length === 0 && (
            <Button 
              variant="ghost" 
              className="w-full border-2 border-dashed border-border py-12 rounded-2xl hover:bg-accent/50 text-muted-foreground font-medium transition-all group"
              disabled={isSaving || isMutationPending}
              onClick={openAddDialog}
            >
              <div className="flex flex-col items-center gap-2">
                <Plus className="h-6 w-6 group-hover:scale-110 transition-transform" />
                <span>No skills added yet. Start by adding a category!</span>
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
          disabled={isSaving || isMutationPending}
        >
          <span className="text-lg">←</span>
          Previous
        </Button>
        <Button 
          onClick={onNext}
          className="btn-primary px-7 h-9 rounded-xl shadow-button flex items-center gap-2"
          disabled={isSaving || isMutationPending}
        >
          Next
          <span className="text-lg">→</span>
        </Button>
      </div>

      <SkillDialog 
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSave={handleSaveCategory}
        initialData={editingCategory}
      />
    </div>
  )
}
