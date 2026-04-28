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
import { DatePicker } from "@/components/ui/date-picker"

const experienceSchema = z.object({
  role: z.string().min(2, "Role is required"),
  company: z.string().min(2, "Company is required"),
  location: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  description: z.string().min(10, "Description should be detailed"),
  toolsUsed: z.string().optional(),
})

type ExperienceFormValues = z.infer<typeof experienceSchema>

interface ExperienceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (data: any) => void
  initialData?: any
}

export function ExperienceDialog({
  open,
  onOpenChange,
  onSave,
  initialData,
}: ExperienceDialogProps) {
  const form = useForm<ExperienceFormValues>({
    resolver: zodResolver(experienceSchema),
    defaultValues: {
      role: "",
      company: "",
      location: "",
      startDate: "",
      endDate: "",
      description: "",
      toolsUsed: "",
    },
  })

  useEffect(() => {
    if (initialData) {
      form.reset({
        role: initialData.role || "",
        company: initialData.company || "",
        location: initialData.location || "",
        startDate: initialData.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : "",
        endDate: initialData.endDate ? new Date(initialData.endDate).toISOString().split('T')[0] : "",
        description: Array.isArray(initialData.description) ? initialData.description.join("\n") : initialData.description || "",
        toolsUsed: initialData.toolsUsed || "",
      })
    } else {
      form.reset({
        role: "",
        company: "",
        location: "",
        startDate: "",
        endDate: "",
        description: "",
        toolsUsed: "",
      })
    }
  }, [initialData, form, open])

  const onSubmit = (values: ExperienceFormValues) => {
    const formattedData = {
      ...values,
      description: values.description.split("\n").filter((line) => line.trim() !== ""),
      endDate: values.endDate === "" ? undefined : values.endDate,
      location: values.location === "" ? undefined : values.location,
      toolsUsed: values.toolsUsed === "" ? undefined : values.toolsUsed,
    }
    onSave(formattedData)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl bg-card border-border shadow-modal">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">
            {initialData ? "Edit Work Experience" : "Add Work Experience"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Title / Role</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Backend Engineering Intern" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company / Organization</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Fintech Startup" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Remote, Bangalore, India" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="mb-2">Start Date</FormLabel>
                    <FormControl>
                      <DatePicker 
                        value={field.value} 
                        onChange={field.onChange} 
                        placeholder="Select start date"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="mb-2">End Date (Optional)</FormLabel>
                    <FormControl>
                      <DatePicker 
                        value={field.value} 
                        onChange={field.onChange} 
                        placeholder="Select end date"
                      />
                    </FormControl>
                    {!field.value && <p className="text-[10px] text-muted-foreground mt-1">Leave blank if currently working</p>}
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
                  <FormLabel>Description / Key Responsibilities</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="List your key contributions (one per line)..." 
                      className="min-h-[120px]" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="toolsUsed"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tools & Technologies (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Node.js, Redis, PostgreSQL (comma separated)" {...field} />
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
                {initialData ? "Update Experience" : "Add Experience"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
