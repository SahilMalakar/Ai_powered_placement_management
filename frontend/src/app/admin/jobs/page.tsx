"use client";

import { Building2, Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAdminJobs, useToggleJobStatus } from "@/hooks/admin/useAdminJobs"
import { CreateJobDialog } from "@/components/admin/jobs/create-job-dialog"
import { JobFormDialog } from "@/components/admin/jobs/job-form-dialog"
import { DeleteJobDialog } from "@/components/admin/jobs/delete-job-dialog"
import { JobCard } from "@/components/admin/jobs/job-card"
import { JobFilters } from "@/components/admin/jobs/job-filters"
import { useState, useEffect } from "react"

export default function AdminJobsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: response, isLoading, isError } = useAdminJobs({
    search: debouncedSearch || undefined,
    status: statusFilter || undefined,
  });

  const { mutate: toggleStatus, isPending: isToggling } = useToggleJobStatus();

  const jobs = response?.data?.jobs || [];

  const [editingJob, setEditingJob] = useState<any>(null);
  const [deletingJob, setDeletingJob] = useState<any>(null);

  if (isLoading && !debouncedSearch && !statusFilter) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground animate-pulse">Fetching recruitment drives...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Job Postings</h1>
          <p className="text-muted-foreground mt-1">Manage and track all campus recruitment opportunities.</p>
        </div>
        <CreateJobDialog />
      </div>

      <JobFilters 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
      />

      <div className="grid gap-4">
        {isError ? (
          <div className="flex h-[40vh] items-center justify-center">
            <div className="text-center space-y-4">
              <p className="text-error font-medium">Failed to load jobs.</p>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </div>
          </div>
        ) : jobs.length === 0 ? (
          <Card className="border-dashed border-2 bg-transparent">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Building2 className="size-12 text-muted-foreground/20 mb-4" />
              <h3 className="text-lg font-semibold">No jobs found</h3>
              <p className="text-muted-foreground max-w-xs mx-auto mt-1">
                Try adjusting your search or filters to find what you&apos;re looking for.
              </p>
              {(debouncedSearch || statusFilter) && (
                <Button 
                  variant="link" 
                  className="mt-2"
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter(undefined);
                  }}
                >
                  Clear all filters
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          jobs.map((job: any) => (
            <JobCard 
              key={job.id} 
              job={job} 
              onEdit={setEditingJob}
              onDelete={setDeletingJob}
              onToggleStatus={toggleStatus}
              isToggling={isToggling}
            />
          ))
        )}
      </div>

      {/* Dialogs */}
      <JobFormDialog 
        job={editingJob} 
        open={!!editingJob} 
        onOpenChange={(open) => !open && setEditingJob(null)} 
      />

      {deletingJob && (
        <DeleteJobDialog
          jobId={deletingJob.id}
          jobTitle={deletingJob.title}
          companyName={deletingJob.company}
          open={!!deletingJob}
          onOpenChange={(open) => !open && setDeletingJob(null)}
        />
      )}
    </div>
  )
}

