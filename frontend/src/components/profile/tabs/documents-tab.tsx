"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, FileText, CheckCircle2, Clock } from "lucide-react"

const documents = [
  {
    id: 1,
    name: "Semester 1 marksheet",
    type: "SGPA document",
    status: "Verified"
  },
  {
    id: 2,
    name: "Semester 2 marksheet",
    type: "SGPA document",
    status: "Processing"
  }
]

export function DocumentsTab() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Marksheets & Documents</h3>
        <Button className="btn-primary gap-2 px-6">
          <Plus className="h-4 w-4" />
          Upload documents
        </Button>
      </div>

      <div className="space-y-2">
        {documents.map((doc) => (
          <div key={doc.id} className="group relative flex items-center justify-between p-4 rounded-xl border border-border bg-card shadow-card transition-all hover:border-primary/20">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-secondary/50 flex items-center justify-center text-muted-foreground">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground font-heading">{doc.name}</h4>
                <p className="text-xs text-muted-foreground font-body">{doc.type}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              {doc.status === "Verified" ? (
                <Badge className="bg-success/10 text-success border-success/20 hover:bg-success/20 gap-1.5 font-medium px-2.5">
                  <CheckCircle2 className="h-3 w-3" />
                  Verified
                </Badge>
              ) : (
                <Badge className="bg-warning/10 text-warning border-warning/20 hover:bg-warning/20 gap-1.5 font-medium px-2.5">
                  <Clock className="h-3 w-3" />
                  Processing
                </Badge>
              )}
              
              <Button variant="outline" size="sm" className="h-9 border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 gap-2">
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </Button>
            </div>
          </div>
        ))}

        <div className="p-4 rounded-xl border border-dashed border-border flex items-center justify-between text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-muted/50 flex items-center justify-center">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-semibold text-muted-foreground font-heading italic">Sem 3 – 8</h4>
              <p className="text-xs font-body italic">Not uploaded</p>
            </div>
          </div>
          <p className="text-[11px] font-body">— upload via button above</p>
        </div>
      </div>
    </div>
  )
}
