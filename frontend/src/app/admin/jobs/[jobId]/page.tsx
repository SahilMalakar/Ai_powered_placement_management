"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import {
  ArrowLeft,
  Briefcase,
  Calendar,
  GitBranch,
  GraduationCap,
  Users,
  Loader2,
  FileText,
  Clock,
  AlertCircle,
  Building2,
  Filter,
} from "lucide-react";
import { format, isPast } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

import { useAdminJob } from "@/hooks/admin/useAdminJobs";
import {
  useJobApplicants,
  useUpdateApplicationStatus,
} from "@/hooks/admin/useAdminJobApplications";
import { ApplicantTable } from "@/components/admin/application/applicant-table";
import {
  ApplicantFiltersBar,
  type ApplicantFilters,
} from "@/components/admin/application/applicant-filters";
import { StatusUpdateBar } from "@/components/admin/application/status-update-bar";
import { ApplicantDetailsSheet } from "@/components/admin/application/applicant-details-sheet";
import { JobPagination } from "@/components/student/jobs/JobPagination";
import type { Applicant, ApplicationStatus } from "@/types/admin/jobApplication";

// ─── Status badge styles ───────────────────────────────────────────
const JOB_STATUS_STYLES: Record<string, string> = {
  ACTIVE: "bg-success/10 text-success border-success/20",
  DRAFT: "bg-pale text-steel border-pale dark:bg-muted dark:text-muted-foreground dark:border-border",
  DEACTIVE: "bg-muted text-muted-foreground border-border",
};

export default function AdminJobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.jobId as string;

  // ─── State ─────────────────────────────────────────────────────
  const [filters, setFilters] = useState<ApplicantFilters>({
    search: "",
    status: "all",
    branch: "all",
    verificationStatus: "all",
    page: 1,
    limit: 10,
  });
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [activeApplicant, setActiveApplicant] = useState<Applicant | null>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.search || "");
    }, 400);
    return () => clearTimeout(timer);
  }, [filters.search]);

  // ─── Data fetching ─────────────────────────────────────────────
  const apiParams = useMemo(() => {
    const p: any = { ...filters, search: debouncedSearch };
    // Clean up "all" values for backend
    if (p.status === "all") delete p.status;
    if (p.branch === "all") delete p.branch;
    if (p.verificationStatus === "all") delete p.verificationStatus;
    if (!p.search) delete p.search;
    return p;
  }, [filters, debouncedSearch]);

  const { data: jobResponse, isLoading: isJobLoading } = useAdminJob(jobId);
  const { data: applicantsResponse, isLoading: isApplicantsLoading, isError: isApplicantsError } =
    useJobApplicants(jobId, apiParams);
  const { mutate: updateStatus, isPending: isUpdating } =
    useUpdateApplicationStatus(jobId);

  const job = jobResponse?.data;
  const applicants = applicantsResponse?.data?.applicants || [];
  const pagination = applicantsResponse?.data?.pagination;

  // ─── Handlers ──────────────────────────────────────────────────
  const handleFilterChange = (newFilters: Partial<ApplicantFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: newFilters.page || 1 }));
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (applicants.every((a) => selectedIds.has(a.id))) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        applicants.forEach((a) => next.delete(a.id));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        applicants.forEach((a) => next.add(a.id));
        return next;
      });
    }
  };

  const handleUpdateStatus = (status: ApplicationStatus) => {
    updateStatus(
      {
        applicationIds: Array.from(selectedIds),
        status,
      },
      {
        onSuccess: () => {
          setSelectedIds(new Set());
        },
      }
    );
  };

  // ─── Stats (Computed from all applicants or summary if provided) ───
  // Note: For real scale, backend should return these summary counts.
  // Using a mock or partial summary for now if not in data.
  const appCount = job?._count?.applications || 0;

  // ─── Loading state ─────────────────────────────────────────────
  if (isJobLoading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-48 w-full rounded-2xl shadow-heavy" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-[400px] w-full rounded-2xl shadow-heavy" />
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <div className="rounded-full bg-error/10 p-4">
          <AlertCircle className="size-10 text-error" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-heading font-bold">Job not found</h2>
          <p className="text-muted-foreground">The job posting you are looking for does not exist or has been removed.</p>
        </div>
        <Button onClick={() => router.push("/admin/jobs")} variant="outline" className="gap-2">
          <ArrowLeft className="size-4" /> Back to Jobs
        </Button>
      </div>
    );
  }

  const isExpired = isPast(new Date(job.deadline));

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Top Navigation & Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push("/admin/jobs")}
          className="group flex items-center gap-2 text-sm font-medium text-mist hover:text-foreground transition-colors"
        >
          <div className="flex size-7 items-center justify-center rounded-lg border border-border group-hover:border-foreground/20 group-hover:bg-accent transition-all">
            <ArrowLeft className="size-4" />
          </div>
          Back to Jobs
        </button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="shadow-button">
            Edit Job
          </Button>
          <Button size="sm" className="shadow-button btn-primary">
            Export List
          </Button>
        </div>
      </div>

      {/* Modern Header Section */}
      <Card className="overflow-hidden border-none shadow-heavy bg-card relative">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-primary/40" />
        <CardContent className="p-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="flex items-start gap-6">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-pale font-heading text-3xl font-bold text-deep-blue dark:bg-muted dark:text-foreground shadow-sm">
                {job.company.charAt(0).toUpperCase()}
              </div>
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
                      {job.title}
                    </h1>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs font-bold uppercase tracking-widest px-2.5 py-0.5 h-6",
                        JOB_STATUS_STYLES[job.status] || JOB_STATUS_STYLES.DRAFT
                      )}
                    >
                      {job.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-steel dark:text-muted-foreground text-lg">
                    <Building2 className="size-5 text-mist" />
                    <span className="font-medium">{job.company}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  <Badge variant="outline" className="gap-1.5 bg-pale/20 border-pale/50 text-deep-blue dark:bg-muted/30 dark:text-foreground h-7">
                    <GitBranch className="size-3.5" />
                    {job.allowedBranches.join(", ")}
                  </Badge>
                  <Badge variant="outline" className="gap-1.5 bg-pale/20 border-pale/50 text-deep-blue dark:bg-muted/30 dark:text-foreground h-7">
                    <GraduationCap className="size-3.5" />
                    CGPA ≥ {job.requiredCgpa}
                  </Badge>
                  <Badge variant="outline" className={cn(
                    "gap-1.5 h-7",
                    job.backlogAllowed ? "bg-success/10 border-success/20 text-success" : "bg-pale/20 border-pale/50 text-deep-blue dark:bg-muted/30 dark:text-foreground"
                  )}>
                    {job.backlogAllowed ? "Backlog OK" : "No Backlog"}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 lg:border-l border-border/50 lg:pl-10">
              <StatItem 
                label="Total Applications" 
                value={appCount.toString()} 
                icon={Users} 
                color="text-primary" 
              />
              <StatItem 
                label="Deadline" 
                value={format(new Date(job.deadline), "dd MMM yyyy")} 
                icon={Calendar} 
                color={isExpired ? "text-error" : "text-foreground"} 
              />
              <StatItem 
                label="Job Status" 
                value={isExpired ? "Expired" : "Active"} 
                icon={Clock} 
                color={isExpired ? "text-error" : "text-success"} 
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Workspace */}
      <Tabs defaultValue="applicants" className="space-y-8">
        <div className="flex items-center justify-between border-b border-border/50 pb-1">
          <TabsList className="bg-transparent p-0 gap-8 h-10 border-none rounded-none">
            <TabsTrigger 
              value="applicants" 
              className="rounded-none border-b-2 border-transparent data-[active=true]:border-primary data-[active=true]:bg-transparent px-0 font-heading font-semibold text-base transition-all"
            >
              Applicants List
            </TabsTrigger>
            <TabsTrigger 
              value="details" 
              className="rounded-none border-b-2 border-transparent data-[active=true]:border-primary data-[active=true]:bg-transparent px-0 font-heading font-semibold text-base transition-all"
            >
              Job Specifications
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="applicants" className="space-y-8 outline-none">
          {/* Controls & Statistics Row */}
          <div className="flex flex-col xl:flex-row gap-6 items-end justify-between">
            <div className="w-full xl:max-w-2xl">
              <ApplicantFiltersBar
                filters={filters as any}
                onFilterChange={handleFilterChange as any}
              />
            </div>
            
            {/* Quick Status Stats (Mocked or real based on full result count if available) */}
            <div className="flex flex-wrap gap-3">
              <StatusMiniPill label="Applied" count={appCount} color="bg-pale/20 text-steel" />
              <StatusMiniPill label="Shortlisted" count={0} color="bg-warning/10 text-warning" />
              <StatusMiniPill label="Selected" count={0} color="bg-success/10 text-success" />
            </div>
          </div>

          {/* Table Section */}
          <div className="relative">
            {isApplicantsLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-xl" />
                ))}
              </div>
            ) : isApplicantsError ? (
              <Card className="border-dashed border-2 bg-transparent py-20 text-center">
                <p className="text-error font-medium">Failed to load applicants. Please try again.</p>
                <Button onClick={() => window.location.reload()} variant="link">Retry</Button>
              </Card>
            ) : applicants.length === 0 ? (
              <Card className="border-dashed border-2 bg-transparent">
                <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                  <Users className="size-16 text-muted-foreground/10 mb-4" />
                  <h3 className="text-xl font-heading font-bold">No applicants found</h3>
                  <p className="text-muted-foreground max-w-sm mt-2">
                    {appCount === 0 
                      ? "No students have applied for this job yet. Reach out to students to increase participation." 
                      : "We couldn't find any applicants matching your current filter criteria."}
                  </p>
                  {filters.search || filters.status !== 'all' || filters.branch !== 'all' ? (
                    <Button 
                      variant="link" 
                      className="mt-4"
                      onClick={() => setFilters({ ...filters, search: "", status: "all", branch: "all", verificationStatus: "all", page: 1 })}
                    >
                      Clear all filters
                    </Button>
                  ) : null}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between px-1">
                  <p className="text-sm text-mist dark:text-muted-foreground/60 font-medium">
                    Found <span className="text-foreground font-bold">{pagination?.total || 0}</span> applicants matching filters
                  </p>
                  {selectedIds.size > 0 && (
                    <p className="text-sm font-bold text-primary animate-pulse">
                      {selectedIds.size} selected
                    </p>
                  )}
                </div>

                <ApplicantTable
                  applicants={applicants}
                  selectedIds={selectedIds}
                  onToggleSelect={toggleSelect}
                  onToggleAll={toggleAll}
                  onViewDetails={setActiveApplicant}
                />

                {pagination && (
                  <JobPagination
                    page={filters.page || 1}
                    totalPages={pagination.totalPages}
                    onPageChange={(page) => handleFilterChange({ page })}
                  />
                )}
              </div>
            )}
          </div>

          {/* Batch Actions Toolbar */}
          <StatusUpdateBar
            selectedApplicants={applicants.filter(a => selectedIds.has(a.id))}
            onUpdateStatus={handleUpdateStatus}
            isPending={isUpdating}
            onClearSelection={() => setSelectedIds(new Set())}
          />
        </TabsContent>

        <TabsContent value="details" className="outline-none">
          <Card className="border-none shadow-heavy">
            <CardContent className="p-8 space-y-10">
              <section className="space-y-4">
                <h3 className="text-xl font-heading font-bold flex items-center gap-2">
                  <FileText className="size-5 text-primary" />
                  Job Description
                </h3>
                <div className="bg-muted/30 rounded-2xl p-6 border border-border/50">
                  <p className="text-foreground/80 whitespace-pre-wrap leading-relaxed text-base">
                    {job.description}
                  </p>
                </div>
              </section>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <section className="space-y-4">
                  <h3 className="text-lg font-heading font-bold flex items-center gap-2">
                    <GraduationCap className="size-5 text-primary" />
                    Eligibility Criteria
                  </h3>
                  <div className="bg-card rounded-2xl border border-border p-6 shadow-sm space-y-4">
                    <DetailRow label="Minimum CGPA" value={job.requiredCgpa.toString()} />
                    <DetailRow label="Backlogs Allowed" value={job.backlogAllowed ? "Yes" : "No"} />
                    <DetailRow label="Target Branches" value={job.allowedBranches.join(", ")} />
                  </div>
                </section>

                <section className="space-y-4">
                  <h3 className="text-lg font-heading font-bold flex items-center gap-2">
                    <Filter className="size-5 text-primary" />
                    Lifecycle Information
                  </h3>
                  <div className="bg-card rounded-2xl border border-border p-6 shadow-sm space-y-4">
                    <DetailRow label="Posted On" value={format(new Date(job.createdAt), "dd MMM yyyy")} />
                    <DetailRow label="Application Deadline" value={format(new Date(job.deadline), "dd MMM yyyy")} />
                    <DetailRow label="Last Updated" value={format(new Date(job.updatedAt), "dd MMM yyyy")} />
                  </div>
                </section>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Applicant Details Side Panel */}
      <Sheet open={!!activeApplicant} onOpenChange={(open) => !open && setActiveApplicant(null)}>
        <ApplicantDetailsSheet applicant={activeApplicant} />
      </Sheet>
    </div>
  );
}

function StatItem({ label, value, icon: Icon, color }: { label: string; value: string; icon: any; color: string }) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-heading font-bold uppercase tracking-widest text-mist dark:text-muted-foreground/60 flex items-center gap-1.5">
        <Icon className="size-3" />
        {label}
      </p>
      <p className={cn("text-lg font-bold tracking-tight", color)}>
        {value}
      </p>
    </div>
  );
}

function StatusMiniPill({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div className={cn("flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-bold shadow-sm border border-transparent", color)}>
      <span>{label}</span>
      <span className="font-heading opacity-80">{count}</span>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between group">
      <span className="text-sm font-medium text-mist dark:text-muted-foreground/60">{label}</span>
      <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{value}</span>
    </div>
  );
}
