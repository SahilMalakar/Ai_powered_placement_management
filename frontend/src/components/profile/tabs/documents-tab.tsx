"use client"

import { useProfile } from "@/hooks/student/use-profile"
import { useUploadDocuments, useDeleteDocument } from "@/hooks/student/use-documents"
import { useRef } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Button, buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, FileText, CheckCircle2, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

export function DocumentsTab() {
  const { data: profileData, isLoading } = useProfile()
  const { mutate: uploadDocs, isPending: isUploading } = useUploadDocuments()
  const { mutate: deleteDoc, isPending: isDeleting } = useDeleteDocument()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const activeSemRef = useRef<number | null>(null)

  const handleUpload = (files: FileList | null, semester?: number) => {
    if (!files || files.length === 0) return
    
    const formData = new FormData()
    if (semester) {
      formData.append(`sem${semester}`, files[0])
    } else {
      formData.append("other", files[0])
    }
    
    uploadDocs(formData, {
      onSuccess: () => {
        if (fileInputRef.current) fileInputRef.current.value = ""
        activeSemRef.current = null
      }
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-20 w-full rounded-xl" />
      </div>
    )
  }

  const documents = profileData?.documents
  const semesterSlots = [1, 2, 3, 4, 5, 6, 7, 8]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <input 
          type="file" 
          className="hidden" 
          ref={fileInputRef} 
          onChange={(e) => handleUpload(e.target.files, activeSemRef.current || undefined)}
          accept=".pdf,.jpg,.jpeg,.png"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {semesterSlots.map((sem) => {
          const doc = (documents as any)?.[`sem${sem}`]
          return (
            <div key={sem} className={cn("group relative flex items-center justify-between p-4 rounded-xl border border-border bg-card shadow-card transition-all", (isUploading || isDeleting) && "opacity-50")}>
              <div className="flex items-center gap-3">
                <div className={cn(
                  "h-10 w-10 rounded-lg flex items-center justify-center",
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
                      className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-8 w-8 text-primary")}
                    >
                      <FileText className="h-4 w-4" />
                    </a>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-destructive hover:bg-destructive/10"
                      onClick={() => deleteDoc(doc.id)}
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 gap-1.5 border-border"
                    onClick={() => {
                      activeSemRef.current = sem
                      fileInputRef.current?.click()
                    }}
                    disabled={isUploading}
                  >
                    <Plus className="h-3.5 w-3.5" />
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
          {(documents?.other || []).map((doc: any) => (
            <div key={doc.id} className="flex items-center justify-between p-4 rounded-xl border border-border bg-card shadow-card transition-all">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold font-heading">Document</h4>
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
                  className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-8 w-8 text-primary")}
                >
                  <FileText className="h-4 w-4" />
                </a>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-destructive hover:bg-destructive/10"
                  onClick={() => deleteDoc(doc.id)}
                  disabled={isDeleting}
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
              activeSemRef.current = null
              fileInputRef.current?.click()
            }}
            disabled={isUploading}
          >
            <div className="flex flex-col items-center gap-1">
              <Plus className="h-5 w-5 group-hover:scale-110 transition-transform" />
              <span className="text-[11px] uppercase tracking-wider font-bold">Upload Certificate</span>
            </div>
          </Button>
        </div>
      </div>
    </div>
  )
}
