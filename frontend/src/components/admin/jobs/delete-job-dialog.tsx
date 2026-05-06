"use client";

import { useState } from "react";
import { Loader2, Trash2, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useDeleteJob } from "@/hooks/admin/useAdminJobs";

interface DeleteJobDialogProps {
  jobId: string;
  jobTitle: string;
  companyName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteJobDialog({
  jobId,
  jobTitle,
  companyName,
  open,
  onOpenChange,
}: DeleteJobDialogProps) {
  const { mutate: deleteJob, isPending } = useDeleteJob();

  const handleDelete = () => {
    deleteJob(jobId, {
      onSuccess: () => {
        onOpenChange(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-error/10 mb-4">
            <AlertTriangle className="h-6 w-6 text-error" />
          </div>
          <DialogTitle className="text-center">Delete Job Posting?</DialogTitle>
          <DialogDescription className="text-center">
            Are you sure you want to delete <span className="font-semibold text-foreground">{jobTitle}</span> at <span className="font-semibold text-foreground">{companyName}</span>? 
            This action cannot be undone and will hide the posting from all students.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center gap-2 mt-4">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending}
            className="flex-1 bg-error hover:bg-error/90"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Trash2 className="h-4 w-4 mr-2" />
            )}
            Delete Posting
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
