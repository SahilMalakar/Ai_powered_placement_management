"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Edit2, Trash2 } from "lucide-react"

const experiences = [
  {
    id: 1,
    role: "Software Intern",
    company: "Acme Corp",
    startDate: "Jan 2025",
    endDate: "Apr 2025",
    location: "Bangalore",
    skills: ["React", "Node.js", "PostgreSQL"]
  }
]

export function ExperienceTab() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Work Experience</h3>
        <Button variant="outline" size="sm" className="gap-2 border-border shadow-button">
          <Plus className="h-4 w-4" />
          Add experience
        </Button>
      </div>

      <div className="space-y-4">
        {experiences.map((exp) => (
          <Card key={exp.id} className="bg-card shadow-card border-border overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-foreground font-heading">{exp.role} — {exp.company}</h4>
                  <p className="text-sm text-muted-foreground mt-1 font-body">
                    {exp.startDate} – {exp.endDate} · {exp.location}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {exp.skills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="bg-secondary/50 text-foreground font-medium text-[11px] px-2.5 py-0.5 border-border">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" className="h-8 w-8 border-border">
                    <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-8 w-8 border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        <Button variant="ghost" className="w-full border-2 border-dashed border-border py-8 rounded-xl hover:bg-accent/50 text-muted-foreground font-medium transition-all group">
          <div className="flex flex-col items-center gap-2">
            <Plus className="h-5 w-5 group-hover:scale-110 transition-transform" />
            <span>Add another experience</span>
          </div>
        </Button>
      </div>
    </div>
  )
}
