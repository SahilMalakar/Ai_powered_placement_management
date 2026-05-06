"use client";

import { Plus } from "lucide-react";
import { JobFormDialog } from "./job-form-dialog";

export function CreateJobDialog() {
  return (
    <JobFormDialog 
      trigger={
        <button className="inline-flex h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary hover:bg-primary/90 text-white shadow-button">
          <Plus className="size-4 mr-2" /> Post New Job
        </button>
      }
    />
  );
}
