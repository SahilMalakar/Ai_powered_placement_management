import { useState } from "react"
import { useAdditionalDetails, useAddAdditionalDetail, useUpdateAdditionalDetail, useDeleteAdditionalDetail } from "@/hooks/student/use-additional-details"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Edit2, Trash2, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { AdditionalDetailDialog } from "./additional-detail-dialog"
import { AdditionalDetail } from "@/types/student/profile"

interface AdditionalDetailsTabProps {
  onPrev: () => void
  onSave: (data?: any) => void
  isSaving: boolean
}

export function AdditionalDetailsTab({ onPrev, onSave, isSaving: isSavingProp }: AdditionalDetailsTabProps) {
  const { data: additionalDetailsData, isLoading } = useAdditionalDetails()
  const { mutate: addDetail, isPending: isAdding } = useAddAdditionalDetail()
  const { mutate: updateDetail, isPending: isUpdating } = useUpdateAdditionalDetail()
  const { mutate: deleteDetail, isPending: isDeleting } = useDeleteAdditionalDetail()
  
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingDetail, setEditingDetail] = useState<AdditionalDetail | null>(null)

  const isSaving = isAdding || isUpdating || isDeleting || isSavingProp

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
    )
  }

  const additionalDetails = additionalDetailsData || []

  const handleSaveDetail = (data: any) => {
    if (editingDetail) {
      updateDetail({ id: editingDetail.id, data }, {
        onSuccess: () => setIsDialogOpen(false)
      })
    } else {
      addDetail(data, {
        onSuccess: () => setIsDialogOpen(false)
      })
    }
  }

  const handleDeleteDetail = (id: number) => {
    deleteDetail(id)
  }

  const openAddDialog = () => {
    setEditingDetail(null)
    setIsDialogOpen(true)
  }

  const openEditDialog = (detail: AdditionalDetail) => {
    setEditingDetail(detail)
    setIsDialogOpen(true)
  }

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="flex-1 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Additional Details</h3>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2 border-border shadow-button" 
            disabled={isSaving || isUpdating}
            onClick={openAddDialog}
          >
            <Plus className="h-4 w-4" />
            Add detail
          </Button>
        </div>

        <div className="space-y-4">
          {additionalDetails.map((detail: any) => (
            <Card key={detail.id} className={cn("bg-card shadow-card border-border overflow-hidden", (isSaving || isUpdating) && "opacity-50")}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-foreground font-heading">{detail.title}</h4>
                      {detail.date && (
                        <span className="text-[10px] text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full font-mono">
                          {new Date(detail.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </span>
                      )}
                    </div>
                    <div className="mt-3 space-y-1">
                      {Array.isArray(detail.description) && detail.description.map((bullet: string, i: number) => (
                        <p key={i} className="text-xs text-muted-foreground font-body flex gap-2">
                          <span className="text-primary">•</span>
                          {bullet}
                        </p>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-8 w-8 border-border" 
                      disabled={isSaving || isUpdating}
                      onClick={() => openEditDialog(detail)}
                    >
                      <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-8 w-8 border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20"
                      onClick={() => handleDeleteDetail(detail.id!)}
                      disabled={isSaving || isUpdating}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {additionalDetails.length === 0 && (
            <Button 
              variant="ghost" 
              className="w-full border-2 border-dashed border-border py-8 rounded-xl hover:bg-accent/50 text-muted-foreground font-medium transition-all group"
              disabled={isSaving || isUpdating}
              onClick={openAddDialog}
            >
              <div className="flex flex-col items-center gap-2">
                <Plus className="h-5 w-5 group-hover:scale-110 transition-transform" />
                <span>Add achievements, certifications, or other details</span>
              </div>
            </Button>
          )}
        </div>
      </div>

      <div className="flex justify-start items-center pt-8 border-t border-border mt-auto">
        <Button 
          variant="secondary" 
          onClick={onPrev}
          className="px-5 h-9 rounded-xl shadow-button flex items-center gap-2"
          disabled={isSaving || isUpdating}
        >
          <span className="text-lg">←</span>
          Previous
        </Button>
      </div>

      <AdditionalDetailDialog 
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSave={handleSaveDetail}
        initialData={editingDetail}
      />
    </div>
  )
}
