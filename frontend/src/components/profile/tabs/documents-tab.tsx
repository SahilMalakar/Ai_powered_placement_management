"use client"

import { useProfile } from "@/hooks/student/use-profile"
import { useDocuments, useUploadDocument, useDeleteDocument } from "@/hooks/student/use-documents"
import { useRef, useState, useEffect } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Button, buttonVariants } from "@/components/ui/button"
import { Plus, Trash2, FileText, CheckCircle2, AlertCircle, Loader2, ArrowLeft, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export function DocumentsTab({ onNext, onPrev }: { onNext: () => void, onPrev: () => void }) {
  const { data: profileData } = useProfile()
  const [pendingUploads, setPendingUploads] = useState<string[]>([])
  
  const { data: documents, isLoading: isLoadingDocs } = useDocuments({
    refetchInterval: pendingUploads.length > 0 ? 2000 : false
  })
  
  const { mutate: uploadDoc, isPending: isUploading } = useUploadDocument()
  const { mutate: deleteDoc, isPending: isDeleting } = useDeleteDocument()
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [activeUpload, setActiveUpload] = useState<{ sem?: number; type: "SGPA" | "OTHER" } | null>(null)

  // Clear pending status once the document appears in the list
  useEffect(() => {
    if (!documents) return
    
    setPendingUploads(prev => prev.filter(pendingId => {
      if (pendingId.startsWith("SGPA_")) {
        const sem = parseInt(pendingId.split("_")[1])
        return !documents.some((d: any) => d.type === "SGPA" && d.semester === sem)
      }
      if (pendingId === "OTHER") {
         // For 'OTHER', we just check if any new 'OTHER' doc arrived 
         // (Simple heuristic: if list length changed, but better to check timestamps)
         return false 
      }
      return true
    }))
  }, [documents])

  const isProcessing = profileData?.profile?.verificationStatus === "PROCESSING"

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !activeUpload) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB")
      return
    }

    const uploadId = activeUpload.type === "SGPA" ? `SGPA_${activeUpload.sem}` : "OTHER"

    const formData = new FormData()
    formData.append("type", activeUpload.type)
    if (activeUpload.sem) {
      formData.append("semester", activeUpload.sem.toString())
    }
    formData.append("file", file)

    uploadDoc(formData, {
      onSuccess: () => {
        setPendingUploads(prev => [...prev, uploadId])
        setActiveUpload(null)
        if (fileInputRef.current) fileInputRef.current.value = ""
      }
    })
  }

  if (isLoadingDocs) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-20 w-full rounded-xl" />
      </div>
    )
  }

  const semesterSlots = [1, 2, 3, 4, 5, 6, 7, 8]
  const sgpaDocs = documents?.filter((d: any) => d.type === "SGPA") || []
  const otherDocs = documents?.filter((d: any) => d.type === "OTHER") || []

  return (
    <div className="space-y-6">
      {isProcessing && (
        <div className="bg-warning/10 border border-warning/20 rounded-xl p-4 flex items-start gap-3 animate-pulse">
          <AlertCircle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-warning font-heading">Profile Under Verification</h4>
            <p className="text-xs text-muted-foreground font-body">
              Document modifications are disabled while your profile is being verified. This usually takes a few minutes.
            </p>
          </div>
        </div>
      )}

      <input 
        type="file" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={handleFileSelect}
        accept=".pdf,.jpg,.jpeg,.png"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {semesterSlots.map((sem) => {
          const doc = sgpaDocs.find((d: any) => d.semester === sem)
          const isThisUploading = (isUploading && activeUpload?.sem === sem) || 
                                 pendingUploads.includes(`SGPA_${sem}`)

          return (
            <div key={sem} className={cn(
              "group relative flex items-center justify-between p-4 rounded-xl border border-border bg-card shadow-card transition-all",
              (isProcessing || isDeleting) && "opacity-60 grayscale-[0.5]"
            )}>
              <div className="flex items-center gap-3">
                <div className={cn(
                  "h-10 w-10 rounded-lg flex items-center justify-center transition-colors",
                  doc ? "bg-success/10 text-success" : "bg-muted/50 text-muted-foreground"
                )}>
                  {doc ? <CheckCircle2 className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                </div>
                <div>
                  <h4 className="text-sm font-bold font-heading">Semester {sem}</h4>
                  <p className="text-xs text-muted-foreground font-body">
                    {doc ? "Marksheet uploaded" : "Not uploaded yet"}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2">
                {doc ? (
                  <>
                    <a 
                      href={doc.url} 
                      target="_blank" 
                      rel="noreferrer"
                      className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-8 w-8 text-primary hover:bg-primary/10")}
                    >
                      <FileText className="h-4 w-4" />
                    </a>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-destructive hover:bg-destructive/10"
                      onClick={() => deleteDoc(doc.id)}
                      disabled={isDeleting || isProcessing}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 gap-1.5 border-border hover:border-primary/30"
                    onClick={() => {
                      setActiveUpload({ sem, type: "SGPA" })
                      fileInputRef.current?.click()
                    }}
                    disabled={isUploading || isProcessing}
                  >
                    {isThisUploading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Plus className="h-3.5 w-3.5" />
                    )}
                    Upload
                  </Button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="pt-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Other Certificates</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {otherDocs.map((doc: any) => (
            <div key={doc.id} className={cn(
              "flex items-center justify-between p-4 rounded-xl border border-border bg-card shadow-card transition-all",
              (isProcessing || isDeleting) && "opacity-60"
            )}>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold font-heading truncate max-w-[120px]">Certificate</h4>
                  <p className="text-xs text-muted-foreground font-body">
                    {new Date(doc.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <a 
                  href={doc.url} 
                  target="_blank" 
                  rel="noreferrer"
                  className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-8 w-8 text-primary hover:bg-primary/10")}
                >
                  <FileText className="h-4 w-4" />
                </a>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-destructive hover:bg-destructive/10"
                  onClick={() => deleteDoc(doc.id)}
                  disabled={isDeleting || isProcessing}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          
          <Button 
            variant="ghost" 
            className="border-2 border-dashed border-border h-[72px] rounded-xl hover:bg-accent/50 text-muted-foreground font-medium transition-all group"
            onClick={() => {
              setActiveUpload({ type: "OTHER" })
              fileInputRef.current?.click()
            }}
            disabled={isUploading || isProcessing || pendingUploads.includes("OTHER")}
          >
            <div className="flex flex-col items-center gap-1">
              {((isUploading && activeUpload?.type === "OTHER") || pendingUploads.includes("OTHER")) ? (
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              ) : (
                <Plus className="h-5 w-5 group-hover:scale-110 transition-transform" />
              )}
              <span className="text-[11px] uppercase tracking-wider font-bold">Upload Certificate</span>
            </div>
          </Button>
        </div>
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
