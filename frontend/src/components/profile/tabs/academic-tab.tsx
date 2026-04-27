"use client"

import { useProfile } from "@/hooks/student/use-profile"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { Lock } from "lucide-react"
import { cn } from "@/lib/utils"

export function AcademicTab() {
  const { data: profileData, isLoading } = useProfile()

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  const p = profileData?.profile
  const semesterResults = [1, 2, 3, 4, 5, 6, 7, 8].map(sem => {
    const result = profileData?.semesters?.find(s => s.semester === sem)
    return { sem, sgpa: result?.sgpa || null }
  })

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <div className="flex items-center justify-end">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium bg-muted/30 px-2 py-1 rounded-md">
            <Lock className="h-3 w-3" />
            Read-only — populated via verification
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-1">CGPA</label>
            <div className="h-12 w-full rounded-xl border border-border bg-card shadow-button flex items-center px-4 font-mono font-bold text-lg text-foreground">
              {p?.cgpa?.toFixed(2) || "—"}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-1">ASTU Roll no.</label>
            <div className="h-12 w-full rounded-xl border border-border bg-card shadow-button flex items-center px-4 font-mono font-bold text-lg text-foreground">
              {p?.astuRollNo || "—"}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Active backlogs</label>
            <div className="h-12 w-full rounded-xl border border-border bg-card shadow-button flex items-center px-4 font-mono font-bold text-lg text-foreground">
              {p?.backlog ? p.backlogSubjects?.length || "Yes" : "0"}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6 pt-4 border-t border-border/50">
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Semester Results</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {semesterResults.map((res) => (
            <Card 
              key={res.sem} 
              className={cn(
                "bg-card shadow-button transition-all border-border hover:border-primary/20",
                !res.sgpa && "opacity-40 border-dashed"
              )}
            >
              <CardContent className="p-4 flex flex-col gap-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Sem {res.sem}</span>
                <span className="text-xl font-bold font-mono text-foreground">
                  {res.sgpa ? res.sgpa.toFixed(2) : "—"}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="text-xs text-muted-foreground font-body italic mt-4 bg-muted/20 p-3 rounded-lg border border-border/50">
          Note: <span className="not-italic">Dashed semesters</span> indicate that no marksheet has been uploaded yet. Please upload them via the <span className="text-primary font-semibold not-italic">Documents tab</span> to verify these results.
        </p>
      </div>
    </div>
  )
}
