"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Lock } from "lucide-react"
import { cn } from "@/lib/utils"

const semesterResults = [
  { sem: 1, sgpa: "8.6" },
  { sem: 2, sgpa: "8.9" },
  { sem: 3, sgpa: "9.1" },
  { sem: 4, sgpa: null },
  { sem: 5, sgpa: null },
  { sem: 6, sgpa: null },
  { sem: 7, sgpa: null },
  { sem: 8, sgpa: null },
]

export function AcademicTab() {
  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Academic Record</h3>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium bg-muted/30 px-2 py-1 rounded-md">
            <Lock className="h-3 w-3" />
            Read-only — populated via verification
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-1">CGPA</label>
            <div className="h-12 w-full rounded-xl border border-dashed border-border bg-muted/20 flex items-center px-4 font-mono font-bold text-lg text-muted-foreground/50">
              —
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-1">ASTU Roll no.</label>
            <div className="h-12 w-full rounded-xl border border-dashed border-border bg-muted/20 flex items-center px-4 font-mono font-bold text-lg text-muted-foreground/50">
              —
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Active backlogs</label>
            <div className="h-12 w-full rounded-xl border border-dashed border-border bg-muted/20 flex items-center px-4 font-mono font-bold text-lg text-muted-foreground/50">
              —
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6 pt-2">
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Semester Results</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {semesterResults.map((res) => (
            <Card 
              key={res.sem} 
              className={cn(
                "bg-card shadow-button transition-all border-border",
                !res.sgpa && "opacity-40 border-dashed"
              )}
            >
              <CardContent className="p-4 flex flex-col gap-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Sem {res.sem}</span>
                <span className="text-xl font-bold font-mono text-foreground">
                  {res.sgpa || "—"}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <p className="text-xs text-muted-foreground font-body italic mt-4">
          Dashed semesters have no marksheet uploaded yet. Upload via the Documents tab.
        </p>
      </div>
    </div>
  )
}
