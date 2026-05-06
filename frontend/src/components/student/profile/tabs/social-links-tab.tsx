"use client"

import { useState } from "react"
import { useSocialLinks, useAddSocialLink, useUpdateSocialLink, useDeleteSocialLink } from "@/hooks/student/use-social-links"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Edit2, Trash2, Globe } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { SocialLink } from "@/types/student/profile"

interface SocialLinksTabProps {
  onNext: () => void
  onPrev: () => void
}

export function SocialLinksTab({ onNext, onPrev }: SocialLinksTabProps) {
  const { data: socialLinksData, isLoading } = useSocialLinks()
  const { mutate: addLink, isPending: isAdding } = useAddSocialLink()
  const { mutate: updateLink, isPending: isUpdating } = useUpdateSocialLink()
  const { mutate: deleteLink, isPending: isDeleting } = useDeleteSocialLink()

  const [isAddingNew, setIsAddingNew] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState({ platform: "", url: "" })

  const isMutationPending = isAdding || isUpdating || isDeleting

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
    )
  }

  const socialLinks = socialLinksData || []

  const handleSave = () => {
    if (!formData.platform || !formData.url) {
      toast.error("Please fill in both platform and URL")
      return
    }

    if (editingId) {
      updateLink({ id: editingId, data: formData }, {
        onSuccess: () => {
          setEditingId(null)
          setFormData({ platform: "", url: "" })
        }
      })
    } else {
      addLink(formData, {
        onSuccess: () => {
          setIsAddingNew(false)
          setFormData({ platform: "", url: "" })
        }
      })
    }
  }

  const handleEdit = (link: SocialLink) => {
    setEditingId(link.id)
    setFormData({ platform: link.platform, url: link.url })
    setIsAddingNew(false)
  }

  const getIcon = (platform: string) => {
    return <Globe className="h-4 w-4" />
  }

  return (
    <div className="space-y-8 flex flex-col h-full">
      <div className="flex-1 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Social Links</h3>
          {!isAddingNew && !editingId && (
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2 border-border shadow-button" 
              onClick={() => setIsAddingNew(true)}
              disabled={isMutationPending}
            >
              <Plus className="h-4 w-4" />
              Add link
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {socialLinks.map((link) => (
            <Card key={link.id} className={cn("bg-card shadow-card border-border overflow-hidden group", isMutationPending && "opacity-50")}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    {getIcon(link.platform)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground font-heading">{link.platform}</h4>
                    <a 
                      href={link.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-xs text-muted-foreground hover:text-primary transition-colors line-clamp-1"
                    >
                      {link.url}
                    </a>
                  </div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-muted-foreground"
                    onClick={() => handleEdit(link)}
                    disabled={isMutationPending}
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => deleteLink(link.id!)}
                    disabled={isMutationPending}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {(isAddingNew || editingId) && (
          <Card className="bg-muted/30 border-dashed border-border shadow-none">
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Platform</label>
                  <Input 
                    placeholder="e.g. LinkedIn, GitHub, Portfolio" 
                    value={formData.platform}
                    onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                    className="bg-background/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">URL</label>
                  <Input 
                    placeholder="https://..." 
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    className="bg-background/50"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    setIsAddingNew(false)
                    setEditingId(null)
                    setFormData({ platform: "", url: "" })
                  }}
                  disabled={isMutationPending}
                >
                  Cancel
                </Button>
                <Button 
                  size="sm" 
                  className="btn-primary" 
                  onClick={handleSave}
                  disabled={isMutationPending}
                >
                  {editingId ? "Update" : "Add Link"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {socialLinks.length === 0 && !isAddingNew && (
          <Button 
            variant="ghost" 
            className="w-full border-2 border-dashed border-border py-12 rounded-2xl hover:bg-accent/50 text-muted-foreground font-medium transition-all group"
            onClick={() => setIsAddingNew(true)}
            disabled={isMutationPending}
          >
            <div className="flex flex-col items-center gap-2">
              <Plus className="h-6 w-6 group-hover:scale-110 transition-transform" />
              <span>Add your social links (LinkedIn, GitHub, etc.)</span>
            </div>
          </Button>
        )}
      </div>

      <div className="flex justify-between items-center pt-8 border-t border-border mt-auto">
        <Button 
          variant="secondary" 
          onClick={onPrev}
          className="px-5 h-9 rounded-xl shadow-button flex items-center gap-2"
          disabled={isMutationPending}
        >
          <span className="text-lg">←</span>
          Previous
        </Button>
        <Button 
          onClick={onNext}
          className="btn-primary px-7 h-9 rounded-xl shadow-button flex items-center gap-2"
          disabled={isMutationPending}
        >
          Next
          <span className="text-lg">→</span>
        </Button>
      </div>
    </div>
  )
}
