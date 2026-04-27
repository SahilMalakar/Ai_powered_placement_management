"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, X } from "lucide-react"

const skillCategories = [
  {
    id: 1,
    name: "Languages",
    skills: ["Python", "TypeScript", "Java"]
  },
  {
    id: 2,
    name: "Frameworks",
    skills: ["Next.js", "Express", "Prisma"]
  }
]

export function SkillsTab() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Skills</h3>
        <Button variant="outline" size="sm" className="gap-2 border-border shadow-button">
          <Plus className="h-4 w-4" />
          Add category
        </Button>
      </div>

      <div className="space-y-8">
        {skillCategories.map((category) => (
          <div key={category.id} className="space-y-4">
            <h4 className="font-semibold text-foreground font-heading">{category.name}</h4>
            <div className="flex flex-wrap gap-2 items-center">
              {category.skills.map((skill) => (
                <Badge 
                  key={skill} 
                  variant="outline" 
                  className="bg-card shadow-button border-border font-medium px-4 py-1.5 hover:bg-accent group transition-colors"
                >
                  {skill}
                  <button className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                  </button>
                </Badge>
              ))}
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 border-dashed border-border text-muted-foreground hover:text-foreground hover:border-solid gap-1 text-xs"
              >
                <Plus className="h-3 w-3" />
                add
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
