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

const detailSchema = z.object({
  title: z.string().min(2, "Title is required"),
  description: z.string().min(5, "Description should be provided"),
  date: z.string().optional(),
})

type DetailFormValues = z.infer<typeof detailSchema>

interface AdditionalDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (data: any) => void
  initialData?: any
}

export function AdditionalDetailDialog({
  open,
  onOpenChange,
  onSave,
  initialData,
}: AdditionalDetailDialogProps) {
  const form = useForm<DetailFormValues>({
    resolver: zodResolver(detailSchema),
    defaultValues: {
      title: "",
      description: "",
      date: "",
    },
  })

  useEffect(() => {
    if (initialData) {
      form.reset({
        title: initialData.title || "",
        description: Array.isArray(initialData.description) ? initialData.description.join("\n") : initialData.description || "",
        date: initialData.date ? new Date(initialData.date).toISOString().split('T')[0] : "",
      })
    } else {
      form.reset({
        title: "",
        description: "",
        date: "",
      })
    }
  }, [initialData, form, open])

  const onSubmit = (values: DetailFormValues) => {
    const formattedData = {
      ...values,
      description: values.description.split("\n").filter((line) => line.trim() !== ""),
      date: values.date === "" ? undefined : values.date,
    }
    onSave(formattedData)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-card border-border shadow-modal flex flex-col max-h-[90vh] p-0">
        <div className="px-6 pt-6 pb-2">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl">
              {initialData ? "Edit Detail" : "Add Additional Detail"}
            </DialogTitle>
          </DialogHeader>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title / Achievement</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. OpenSource Contribution, Certification" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date (Optional)</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description / Bullets</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="List details (one per line)..." 
                        className="min-h-[120px]" 
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
                {initialData ? "Update Detail" : "Add Detail"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
