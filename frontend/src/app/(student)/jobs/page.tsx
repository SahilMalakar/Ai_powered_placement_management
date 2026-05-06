'use client';

import { JobCard } from "@/components/student/jobs/JobCard";
import { JobFilters } from "@/components/student/jobs/JobFilters";
import { JobPagination } from "@/components/student/jobs/JobPagination";
import { useJobs } from "@/hooks/student/useJobs";
import { JobFilters as IJobFilters } from "@/types/student/job";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

function JobSkeleton() {
  return (
    <Card className="relative overflow-hidden border-border/50">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <Skeleton className="h-12 w-12 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-[60%]" />
            <Skeleton className="h-4 w-[40%]" />
            <Skeleton className="h-3 w-[30%]" />
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-24 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <div className="mt-8 flex items-center justify-between border-t pt-4 border-border/50">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-8 w-[100px] rounded-md" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function JobsPage() {
  const [filters, setFilters] = useState<IJobFilters>({
    page: 1,
    limit: 10,
  });

  const { data, isLoading, isError, error } = useJobs(filters);

  const handleFilterChange = (newFilters: Partial<IJobFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 max-w-6xl animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-2">
        <h1 className="font-heading text-3xl font-bold tracking-tight text-navy dark:text-foreground">
          Job Board
        </h1>
        <p className="text-steel dark:text-muted-foreground max-w-2xl">
          Explore and apply for the latest placement opportunities. Stay updated with deadlines and eligibility criteria.
        </p>
      </div>

      <JobFilters filters={filters} onFilterChange={handleFilterChange} />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <JobSkeleton key={i} />
          ))}
        </div>
      ) : isError ? (
        <div className="py-12 text-center space-y-4">
          <p className="text-error font-medium">Failed to load jobs</p>
          <p className="text-sm text-muted-foreground">{(error as any)?.message || "Something went wrong"}</p>
        </div>
      ) : data?.jobs.length === 0 ? (
        <div className="py-12 text-center space-y-4 bg-card rounded-xl border border-dashed border-border/60">
          <p className="text-steel dark:text-muted-foreground font-medium text-lg">No jobs found matching your filters.</p>
          <p className="text-sm text-mist">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data?.jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>

          <JobPagination 
            page={filters.page || 1} 
            totalPages={data?.pagination.totalPages || 0} 
            onPageChange={(page) => handleFilterChange({ page })} 
          />
        </>
      )}
    </div>
  );
}
