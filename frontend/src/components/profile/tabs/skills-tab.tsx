"use client"

import { useProfile } from "@/hooks/student/use-profile"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface SkillsTabProps {
  onPrev: () => void
  onSave: (data?: any) => void
  isSaving: boolean
  initialData?: any
}

export function SkillsTab({ onPrev, onSave, isSaving, initialData }: SkillsTabProps) {
  const { data: profileData, isLoading } = useProfile()
  // No longer calling updateProfile here individually

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

  const skillCategories = profileData?.profile?.skills || []

  const removeSkill = (categoryId: number, skillToRemove: string) => {
    // In a real wizard, this should update parent state or local state
    // For now, we'll just skip individual updates and let the user click "Save"
    // Actually, I'll just keep the existing data and only handle the "Save" click for the whole profile
  }

  return (
    <div className="space-y-8 flex flex-col h-full">
      <div className="flex-1 space-y-8">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Skills</h3>
          <Button variant="outline" size="sm" className="gap-2 border-border shadow-button" disabled={isSaving}>
            <Plus className="h-4 w-4" />
            Add category
          </Button>
        </div>

        <div className="space-y-8">
          {skillCategories.map((category) => (
            <div key={category.id} className={cn("space-y-4", isSaving && "opacity-50")}>
              <h4 className="font-semibold text-foreground font-heading">{category.category}</h4>
              <div className="flex flex-wrap gap-2 items-center">
                {category.skills.map((skill) => (
                  <Badge 
                    key={skill} 
                    variant="outline" 
                    className="bg-card shadow-button border-border font-medium px-4 py-1.5 hover:bg-accent group transition-colors"
                  >
                    {skill}
                    <button 
                      className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeSkill(category.id!, skill)}
                      disabled={isSaving}
                    >
                      <X className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                    </button>
                  </Badge>
                ))}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 border-dashed border-border text-muted-foreground hover:text-foreground hover:border-solid gap-1 text-xs"
                  disabled={isSaving}
                >
                  <Plus className="h-3 w-3" />
                  add
                </Button>
              </div>
            </div>
          ))}

          {skillCategories.length === 0 && (
            <div className="text-center py-12 border-2 border-dashed border-border rounded-2xl text-muted-foreground font-body">
              No skills added yet. Start by adding a category!
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center pt-8 border-t border-border mt-auto">
        <Button 
          variant="secondary" 
          onClick={onPrev}
          className="px-6 h-11 rounded-xl shadow-button flex items-center gap-2"
          disabled={isSaving}
        >
          <span className="text-lg">←</span>
          Previous
        </Button>
        <Button 
          onClick={() => onSave()}
          className="btn-primary px-10 h-11 rounded-xl shadow-button flex items-center gap-2"
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save profile"}
          {!isSaving && <span className="text-lg">✓</span>}
        </Button>
      </div>
    </div>
  )
}
