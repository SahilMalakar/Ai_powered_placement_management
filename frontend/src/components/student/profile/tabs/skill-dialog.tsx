"use client"

import { useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

const skillSchema = z.object({
  category: z.string().min(2, "Category name is required (e.g. Languages, Frontend)"),
  skills: z.string().min(1, "Please enter at least one skill"),
})

type SkillFormValues = z.infer<typeof skillSchema>

interface SkillDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (data: any) => void
  initialData?: any
}

export function SkillDialog({
  open,
  onOpenChange,
  onSave,
  initialData,
}: SkillDialogProps) {
  const form = useForm<SkillFormValues>({
    resolver: zodResolver(skillSchema),
    defaultValues: {
      category: "",
      skills: "",
    },
  })

  useEffect(() => {
    if (initialData) {
      form.reset({
        category: initialData.category || "",
        skills: Array.isArray(initialData.skills) ? initialData.skills.join(", ") : initialData.skills || "",
      })
    } else {
      form.reset({
        category: "",
        skills: "",
      })
    }
  }, [initialData, form, open])

  const onSubmit = (values: SkillFormValues) => {
    const formattedData = {
      category: values.category,
      skills: values.skills.split(",").map(s => s.trim()).filter(s => s !== ""),
    }
    onSave(formattedData)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card border-border shadow-modal flex flex-col max-h-[90vh] p-0">
        <div className="px-6 pt-6 pb-2">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl">
              {initialData ? "Edit Skill Category" : "Add Skill Category"}
            </DialogTitle>
          </DialogHeader>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Frontend, Backend, Languages" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="skills"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Skills (Comma separated)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="e.g. React, Next.js, TypeScript, Tailwind" 
                        className="min-h-[100px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="px-6 py-4 border-t">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" className="btn-primary">
                {initialData ? "Update Category" : "Add Category"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
