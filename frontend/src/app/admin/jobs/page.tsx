"use client";

import { Building2, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminJobs, useToggleJobStatus } from "@/hooks/admin/useAdminJobs";
import { JobFormDialog } from "@/components/admin/jobs/job-form-dialog";
import { AdminJobCard } from "@/components/admin/jobs/job-card";
import {
  AdminJobFiltersBar,
  type AdminJobFilters,
} from "@/components/admin/jobs/job-filters";
import { JobPagination } from "@/components/student/jobs/JobPagination";
import { useState, useEffect } from "react";
import type { Job } from "@/types/admin/job";

// ─── Skeleton loader matching the card layout ──────────────────────
function JobCardSkeleton() {
  return (
    <Card className="relative overflow-hidden border-border/50">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <Skeleton className="h-12 w-12 rounded-lg" />
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between">
              <Skeleton className="h-5 w-[60%]" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-4 w-[40%]" />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Skeleton className="h-5 w-24 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <div className="mt-4 flex gap-4">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-28" />
        </div>
        <div className="mt-5 flex items-center justify-between border-t pt-4 border-border/50">
          <Skeleton className="h-8 w-[130px] rounded-md" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-[70px] rounded-md" />
            <Skeleton className="h-8 w-[90px] rounded-md" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminJobsPage() {
  const [filters, setFilters] = useState<AdminJobFilters>({
    page: 1,
    limit: 10,
  });
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.search || "");
    }, 400);
    return () => clearTimeout(timer);
  }, [filters.search]);

  // Build API params
  const apiParams: Record<string, any> = {
    page: filters.page,
    limit: filters.limit,
  };
  if (debouncedSearch) apiParams.search = debouncedSearch;
  if (filters.status) apiParams.status = filters.status;
  if (filters.branches && filters.branches.length > 0) apiParams.branches = filters.branches;

  const {
    data: response,
    isLoading,
    isError,
  } = useAdminJobs(apiParams);

  const { mutate: toggleStatus, isPending: isToggling } =
    useToggleJobStatus();

  const jobs: Job[] = response?.data?.jobs || [];
  const pagination = response?.data?.pagination;

  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const handleFilterChange = (newFilters: Partial<AdminJobFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
            Job Postings
          </h1>
          <p className="text-steel dark:text-muted-foreground">
            Manage all campus recruitment opportunities
          </p>
        </div>
        <Button
          className="gap-2 shadow-button"
          onClick={() => setIsCreateOpen(true)}
        >
          <Plus className="size-4" />
          Post New Job
        </Button>
      </div>

      {/* Filters */}
      <AdminJobFiltersBar
        filters={filters}
        onFilterChange={handleFilterChange}
      />

      {/* Job Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <JobCardSkeleton key={i} />
          ))}
        </div>
      ) : isError ? (
        <div className="flex h-[40vh] items-center justify-center">
          <div className="text-center space-y-4">
            <p className="text-error font-medium">Failed to load jobs.</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </div>
      ) : jobs.length === 0 ? (
        <Card className="border-dashed border-2 bg-transparent">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Building2 className="size-12 text-muted-foreground/20 mb-4" />
            <h3 className="text-lg font-heading font-semibold">
              No jobs found
            </h3>
            <p className="text-muted-foreground max-w-xs mx-auto mt-1">
              Try adjusting your search or filters to find what you&apos;re
              looking for.
            </p>
            {(debouncedSearch || filters.status || (filters.branches && filters.branches.length > 0)) && (
              <Button
                variant="link"
                className="mt-2"
                onClick={() =>
                  setFilters({ page: 1, limit: 10 })
                }
              >
                Clear all filters
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {jobs.map((job) => (
              <AdminJobCard
                key={job.id}
                job={job}
                onEdit={setEditingJob}
                onToggleStatus={toggleStatus}
                isToggling={isToggling}
              />
            ))}
          </div>

          {/* Pagination — reuse student component */}
          {pagination && (
            <JobPagination
              page={filters.page}
              totalPages={pagination.totalPages}
              onPageChange={(page) => handleFilterChange({ page })}
            />
          )}
        </>
      )}

      {/* Create Job Dialog */}
      <JobFormDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />

      {/* Edit Job Dialog */}
      <JobFormDialog
        job={editingJob}
        open={!!editingJob}
        onOpenChange={(open) => !open && setEditingJob(null)}
      />

    </div>
  );
}
