"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Edit2, Trash2, ExternalLink } from "lucide-react"

const projects = [
  {
    id: 1,
    title: "Placement Portal",
    description: "Built using Next.js, Node.js and PostgreSQL with complete student and admin management features.",
    keyTools: "React, Node.js, Prisma",
    link: "https://github.com/..."
  }
]

export function ProjectsTab() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Personal Projects</h3>
        <Button variant="outline" size="sm" className="gap-2 border-border shadow-button">
          <Plus className="h-4 w-4" />
          Add project
        </Button>
      </div>

      <div className="space-y-4">
        {projects.map((project) => (
          <Card key={project.id} className="bg-card shadow-card border-border overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1 pr-4">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-foreground font-heading">{project.title}</h4>
                    {project.link && <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2 font-body leading-relaxed">
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <Badge variant="secondary" className="bg-secondary/30 text-foreground/80 font-medium text-[11px] px-2.5 py-0.5 border-border">
                      {project.keyTools}
                    </Badge>
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
            <span>Add another project</span>
          </div>
        </Button>
      </div>
    </div>
  )
}
