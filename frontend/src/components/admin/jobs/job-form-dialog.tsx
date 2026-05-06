"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePicker } from "@/components/ui/date-picker";
import {
  createJobSchema,
  CreateJobInput,
  BranchEnum,
} from "@/types/admin/job";
import { useCreateJob, useUpdateJob } from "@/hooks/admin/useAdminJobs";
import { useState, useEffect } from "react";

interface JobFormDialogProps {
  job?: any; // If provided, we are in EDIT mode
  trigger?: React.ReactElement;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function JobFormDialog({ job, trigger, open: externalOpen, onOpenChange: setExternalOpen }: JobFormDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);

  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = setExternalOpen !== undefined ? setExternalOpen : setInternalOpen;

  const isEdit = !!job;
  const { mutate: createJob, isPending: isCreating } = useCreateJob();
  const { mutate: updateJob, isPending: isUpdating } = useUpdateJob(job?.id);

  const form = useForm<CreateJobInput>({
    resolver: zodResolver(createJobSchema),
    defaultValues: {
      title: "",
      company: "",
      description: "",
      requiredCgpa: 0,
      allowedBranches: [],
      backlogAllowed: false,
      status: "ACTIVE",
      deadline: "",
    },
  });

  // Sync form with job data when editing
  useEffect(() => {
    if (job) {
      form.reset({
        title: job.title || "",
        company: job.company || "",
        description: job.description || "",
        requiredCgpa: job.requiredCgpa || 0,
        allowedBranches: job.allowedBranches || [],
        backlogAllowed: job.backlogAllowed || false,
        status: job.status || "ACTIVE",
        deadline: job.deadline ? new Date(job.deadline).toISOString() : "",
      });
    } else {
      form.reset({
        title: "",
        company: "",
        description: "",
        requiredCgpa: 0,
        allowedBranches: [],
        backlogAllowed: false,
        status: "ACTIVE",
        deadline: "",
      });
    }
  }, [job, form, open]);

  function onSubmit(values: CreateJobInput) {
    if (isEdit) {
      updateJob(values, {
        onSuccess: () => {
          setOpen(false);
        },
      });
    } else {
      createJob(values, {
        onSuccess: () => {
          setOpen(false);
          form.reset();
        },
      });
    }
  }

  const isPending = isCreating || isUpdating;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger render={trigger} />}
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Update Recruitment Drive" : "Post New Recruitment Drive"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Modify the job details and requirements for this posting."
              : "Fill in the details to create a new job posting for students."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Software Engineer" {...field} />
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
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Google" {...field} />
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
                  <FormLabel>Job Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Detail the roles, responsibilities, and requirements..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="requiredCgpa"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum CGPA</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        value={Number.isNaN(field.value) ? "" : field.value}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="deadline"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Application Deadline</FormLabel>
                    <FormControl>
                      <DatePicker
                        value={field.value}
                        onChange={field.onChange}
                        toYear={new Date().getFullYear() + 2}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="allowedBranches"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel>Target Branches</FormLabel>
                    <FormDescription>
                      Select all branches eligible for this role.
                    </FormDescription>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {BranchEnum.map((branch) => (
                      <FormField
                        key={branch}
                        control={form.control}
                        name="allowedBranches"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={branch}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(branch)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, branch])
                                      : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== branch
                                        )
                                      );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {branch}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="backlogAllowed"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Allow Backlogs</FormLabel>
                    <FormDescription>
                      Check this if students with active backlogs can apply.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpen(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEdit ? "Update Job" : "Post Job"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
