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

const projectSchema = z.object({
  title: z.string().min(2, "Title is required"),
  description: z.string().min(10, "Description should be detailed"),
  keyTools: z.string().optional(),
  link: z.url("Invalid URL").or(z.literal("")).optional(),
  secondaryLink: z.url("Invalid URL").or(z.literal("")).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
})

type ProjectFormValues = z.infer<typeof projectSchema>

interface ProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (data: any) => void
  initialData?: any
}

export function ProjectDialog({
  open,
  onOpenChange,
  onSave,
  initialData,
}: ProjectDialogProps) {
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: "",
      description: "",
      keyTools: "",
      link: "",
      secondaryLink: "",
      startDate: "",
      endDate: "",
    },
  })

  useEffect(() => {
    if (initialData) {
      form.reset({
        title: initialData.title || "",
        description: Array.isArray(initialData.description) ? initialData.description.join("\n") : initialData.description || "",
        keyTools: initialData.keyTools || "",
        link: initialData.link || "",
        secondaryLink: initialData.secondaryLink || "",
        startDate: initialData.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : "",
        endDate: initialData.endDate ? new Date(initialData.endDate).toISOString().split('T')[0] : "",
      })
    } else {
      form.reset({
        title: "",
        description: "",
        keyTools: "",
        link: "",
        secondaryLink: "",
        startDate: "",
        endDate: "",
      })
    }
  }, [initialData, form, open])

  const onSubmit = (values: ProjectFormValues) => {
    const formattedData = {
      ...values,
      description: values.description.split("\n").filter((line) => line.trim() !== ""),
      link: values.link === "" ? undefined : values.link,
      secondaryLink: values.secondaryLink === "" ? undefined : values.secondaryLink,
      startDate: values.startDate === "" ? undefined : values.startDate,
      endDate: values.endDate === "" ? undefined : values.endDate,
    }
    onSave(formattedData)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl bg-card border-border shadow-modal">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">
            {initialData ? "Edit Project" : "Add Project"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. SkyRoute — Distributed Hotel Booking Backend" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="keyTools"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Key Tools & Technologies</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Node.js, Redis, BullMQ, PostgreSQL" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="link"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Live Link / Drive Link</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="secondaryLink"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>GitHub Repo Link</FormLabel>
                    <FormControl>
                      <Input placeholder="https://github.com/..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date (Optional)</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date (Optional)</FormLabel>
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
                  <FormLabel>Description / Key Features</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe your project (one feature per line)..." 
                      className="min-h-[120px]" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" className="btn-primary">
                {initialData ? "Update Project" : "Add Project"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
