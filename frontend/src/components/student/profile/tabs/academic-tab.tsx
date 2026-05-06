"use client"

import { useEffect } from "react"
import { useAcademicRecord } from "@/hooks/student/use-academic-record"
import { useInitiateVerification } from "@/hooks/student/use-verification"
import { useQueryClient } from "@tanstack/react-query"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Lock, 
  ShieldCheck, 
  ShieldAlert, 
  ShieldQuestion, 
  Loader2, 
  RefreshCcw,
  AlertCircle,
  ArrowLeft,
  ArrowRight
} from "lucide-react"
import { cn } from "@/lib/utils"

export function AcademicTab({ onNext, onPrev }: { onNext: () => void, onPrev: () => void }) {
  const { data: academic, isLoading } = useAcademicRecord({
    // Enable smart polling ONLY when verification is processing
    refetchInterval: (query) => {
      return query.state.data?.verificationStatus === "PROCESSING" ? 3000 : false
    }
  })

  const queryClient = useQueryClient()
  const status = academic?.verificationStatus || "NOT_VERIFIED"

  // When polling finishes and status is no longer PROCESSING, invalidate the main profile 
  // to ensure the header and other tabs also update their state.
  useEffect(() => {
    if (status !== "PROCESSING" && status !== "NOT_VERIFIED") {
      queryClient.invalidateQueries({ queryKey: ["student-profile"] })
    }
  }, [status, queryClient])

  const { mutate: verify, isPending: isInitiating } = useInitiateVerification()
  
  const isProcessing = status === "PROCESSING"
  const isVerified = status === "VERIFIED"
  const isFailed = status === "FAILED"

  const semesterResults = [1, 2, 3, 4, 5, 6, 7, 8].map(sem => {
    const result = academic?.semesters?.find((s: any) => s.semester === sem)
    return { sem, sgpa: result?.sgpa || null }
  })

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

  return (
    <div className="space-y-8">
      {/* Verification Status Header */}
      <div className="bg-muted/30 border border-border rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className={cn(
            "h-14 w-14 rounded-2xl flex items-center justify-center shadow-sm",
            isVerified ? "bg-success/10 text-success" : 
            isFailed ? "bg-destructive/10 text-destructive" :
            isProcessing ? "bg-warning/10 text-warning" : "bg-muted text-muted-foreground"
          )}>
            {isVerified && <ShieldCheck className="h-8 w-8" />}
            {isFailed && <ShieldAlert className="h-8 w-8" />}
            {isProcessing && <Loader2 className="h-8 w-8 animate-spin" />}
            {status === "NOT_VERIFIED" && <ShieldQuestion className="h-8 w-8" />}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold font-heading">Verification Status</h3>
              <Badge variant={isVerified ? "success" : isFailed ? "destructive" : "secondary"}>
                {status.replace("_", " ")}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground font-body">
              {isVerified ? "Your academic records have been verified by the system." : 
               isProcessing ? "We are currently analyzing your marksheets. Please wait..." :
               isFailed ? academic?.verificationReason || "Verification failed. Check your documents." :
               "Upload your SGPA marksheets to initiate automated verification."}
            </p>
          </div>
        </div>

        <Button 
          onClick={() => verify()}
          disabled={isInitiating || isProcessing || isVerified}
          className={cn(
            "w-full md:w-auto h-12 px-8 rounded-xl font-bold transition-all",
            isVerified ? "bg-success/20 text-success hover:bg-success/20" : "shadow-button"
          )}
        >
          {isInitiating || isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isProcessing ? "Processing..." : "Initiating..."}
            </>
          ) : isVerified ? (
            <>
              <ShieldCheck className="mr-2 h-4 w-4" />
              Verified
            </>
          ) : (
            <>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Verify Profile
            </>
          )}
        </Button>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
           <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Extracted Records</h3>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium bg-muted/30 px-2 py-1 rounded-md">
            <Lock className="h-3 w-3" />
            Read-only — populated via verification
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-1">CGPA</label>
            <div className="h-12 w-full rounded-xl border border-border bg-card shadow-button flex items-center px-4 font-mono font-bold text-lg text-foreground">
              {academic?.cgpa?.toFixed(2) || "—"}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-1">ASTU Roll no.</label>
            <div className="h-12 w-full rounded-xl border border-border bg-card shadow-button flex items-center px-4 font-mono font-bold text-lg text-foreground">
              {academic?.astuRollNo || "—"}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Active backlogs</label>
            <div className="h-12 w-full rounded-xl border border-border bg-card shadow-button flex items-center px-4 font-mono font-bold text-lg text-foreground">
              {academic?.backlog ? academic.backlogSubjects?.length || "Yes" : "0"}
            </div>
          </div>
        </div>

        {academic?.backlog && academic.backlogSubjects && academic.backlogSubjects.length > 0 && (
          <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
            <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Backlog Subjects</label>
            <div className="min-h-12 w-full rounded-xl border border-border bg-card shadow-button flex flex-wrap gap-2 items-center p-3">
              {academic.backlogSubjects.map((subject: string) => (
                <div key={subject} className="bg-destructive/10 text-destructive text-[11px] font-bold px-3 py-1 rounded-full border border-destructive/20">
                  {subject}
                </div>
              ))}
            </div>
          </div>
        )}
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

        {status === "NOT_VERIFIED" && (
           <div className="flex items-start gap-3 bg-primary/5 p-4 rounded-xl border border-primary/10">
            <AlertCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Dashed semesters indicate that no marksheet has been uploaded yet. Please upload them via the <b>Documents tab</b>. 
              Once all relevant marksheets are uploaded, click <b>Verify Profile</b> to calculate your official CGPA and update your records.
            </p>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between pt-6 border-t border-border/50 mt-8">
        <Button variant="ghost" onClick={onPrev}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
        <Button className="shadow-button" onClick={onNext}>
          Next Step
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
