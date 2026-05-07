"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import {
  ArrowLeft,
  Briefcase,
  Calendar,
  GitBranch,
  GraduationCap,
  Users,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { JobPagination } from "@/components/student/jobs/JobPagination";
import type { Applicant, ApplicationStatus } from "@/types/admin/jobApplication";

// ─── Status badge styles ───────────────────────────────────────────
const JOB_STATUS_STYLES: Record<string, string> = {
  ACTIVE: "bg-success/10 text-success border-success/20",
  DRAFT: "bg-pale text-steel border-pale dark:bg-muted dark:text-muted-foreground dark:border-border",
  DEACTIVE: "bg-muted text-muted-foreground border-border",
};

const ITEMS_PER_PAGE = 10;

export default function AdminJobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.jobId as string;

  // ─── Data fetching ─────────────────────────────────────────────
  const { data: jobResponse, isLoading: isJobLoading } = useAdminJob(jobId);
  const { data: applicantsResponse, isLoading: isApplicantsLoading } =
    useJobApplicants(jobId);
  const { mutate: updateStatus, isPending: isUpdating } =
    useUpdateApplicationStatus(jobId);

  const job = jobResponse?.data;
  const allApplicants: Applicant[] = applicantsResponse?.data || [];

  // ─── Filters ───────────────────────────────────────────────────
  const [filters, setFilters] = useState<ApplicantFilters>({
    search: "",
    status: "all",
    branch: "all",
    verification: "all",
  });
  const [page, setPage] = useState(1);

  const handleFilterChange = (newFilters: Partial<ApplicantFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPage(1);
  };

  // ─── Client-side filtering ────────────────────────────────────
  const filteredApplicants = useMemo(() => {
    return allApplicants.filter((a) => {
      // Search filter
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const name = a.user.profile?.fullName?.toLowerCase() || "";
        const email = a.user.email.toLowerCase();
        const roll = a.user.profile?.rollNo?.toLowerCase() || "";
        if (!name.includes(q) && !email.includes(q) && !roll.includes(q)) {
          return false;
        }
      }
      // Status filter
      if (filters.status !== "all" && a.status !== filters.status) return false;
      // Branch filter
      if (
        filters.branch !== "all" &&
        a.user.profile?.branch !== filters.branch
      )
        return false;
      // Verification filter
      if (
        filters.verification !== "all" &&
        a.user.profile?.verificationStatus !== filters.verification
      )
        return false;
      return true;
    });
  }, [allApplicants, filters]);

  // ─── Pagination ────────────────────────────────────────────────
  const totalPages = Math.ceil(filteredApplicants.length / ITEMS_PER_PAGE);
  const paginatedApplicants = filteredApplicants.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  // ─── Selection ─────────────────────────────────────────────────
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (paginatedApplicants.every((a) => selectedIds.has(a.id))) {
      // Deselect all on current page
      setSelectedIds((prev) => {
        const next = new Set(prev);
        paginatedApplicants.forEach((a) => next.delete(a.id));
        return next;
      });
    } else {
      // Select all on current page
      setSelectedIds((prev) => {
        const next = new Set(prev);
        paginatedApplicants.forEach((a) => next.add(a.id));
        return next;
      });
    }
  };

  const selectedApplicants = allApplicants.filter((a) =>
    selectedIds.has(a.id)
  );

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

  // ─── Stats ─────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const counts: Record<string, number> = {
      APPLIED: 0,
      SHORTLISTED: 0,
      SELECTED: 0,
      REJECTED: 0,
    };
    allApplicants.forEach((a) => {
      counts[a.status] = (counts[a.status] || 0) + 1;
    });
    return counts;
  }, [allApplicants]);

  // ─── Loading state ─────────────────────────────────────────────
  if (isJobLoading) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-error font-medium">Job not found.</p>
          <Button onClick={() => router.push("/admin/jobs")}>
            Back to Jobs
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Back link */}
      <button
        onClick={() => router.push("/admin/jobs")}
        className="inline-flex items-center gap-1.5 text-sm text-mist hover:text-foreground transition-colors font-medium"
      >
        <ArrowLeft className="size-4" />
        Back to Jobs
      </button>

      {/* Job header card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-pale font-heading text-2xl font-bold text-deep-blue dark:bg-muted dark:text-foreground">
                {job.company.charAt(0).toUpperCase()}
              </div>
              <div className="space-y-1">
                <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
                  {job.title}
                </h1>
                <div className="flex items-center gap-1.5 text-steel dark:text-muted-foreground">
                  <Briefcase className="size-4 shrink-0" />
                  <span className="font-medium">{job.company}</span>
                </div>
              </div>
            </div>
            <Badge
              variant="outline"
              className={cn(
                "text-sm font-medium px-3 py-1",
                JOB_STATUS_STYLES[job.status] || JOB_STATUS_STYLES.DRAFT
              )}
            >
              {job.status}
            </Badge>
          </div>

          {/* Job badges */}
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge
              variant="outline"
              className="gap-1 bg-pale/30 border-pale text-deep-blue dark:bg-muted/50 dark:border-border dark:text-foreground"
            >
              <GitBranch className="size-3" />
              {job.allowedBranches.join(", ")}
            </Badge>
            <Badge
              variant="outline"
              className="gap-1 bg-pale/30 border-pale text-deep-blue dark:bg-muted/50 dark:border-border dark:text-foreground"
            >
              <GraduationCap className="size-3" />
              CGPA ≥ {job.requiredCgpa}
            </Badge>
            <Badge
              variant="outline"
              className={cn(
                "bg-pale/30 border-pale text-deep-blue dark:bg-muted/50 dark:border-border dark:text-foreground",
                job.backlogAllowed &&
                  "bg-success/10 border-success/20 text-success dark:bg-success/10 dark:border-success/20 dark:text-success"
              )}
            >
              {job.backlogAllowed ? "Backlog OK" : "No Backlog"}
            </Badge>
            <Badge
              variant="outline"
              className="gap-1 bg-pale/30 border-pale text-deep-blue dark:bg-muted/50 dark:border-border dark:text-foreground"
            >
              <Calendar className="size-3" />
              Deadline: {format(new Date(job.deadline), "d MMM yyyy")}
            </Badge>
            <Badge
              variant="outline"
              className="gap-1 bg-pale/30 border-pale text-deep-blue dark:bg-muted/50 dark:border-border dark:text-foreground"
            >
              <Users className="size-3" />
              {allApplicants.length} Applications
            </Badge>
          </div>

          {/* Quick stat pills */}
          <div className="mt-4 flex flex-wrap gap-3">
            <div className="flex items-center gap-2 rounded-lg bg-pale/20 dark:bg-muted/30 px-3 py-1.5 text-xs font-medium">
              <span className="text-steel dark:text-muted-foreground">Applied</span>
              <span className="font-heading font-bold text-foreground">{stats.APPLIED}</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-warning/10 px-3 py-1.5 text-xs font-medium">
              <span className="text-warning">Shortlisted</span>
              <span className="font-heading font-bold text-warning">{stats.SHORTLISTED}</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-success/10 px-3 py-1.5 text-xs font-medium">
              <span className="text-success">Selected</span>
              <span className="font-heading font-bold text-success">{stats.SELECTED}</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-error/10 px-3 py-1.5 text-xs font-medium">
              <span className="text-error">Rejected</span>
              <span className="font-heading font-bold text-error">{stats.REJECTED}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue={0} className="space-y-6">
        <TabsList>
          <TabsTrigger value={0}>
            Applicants
          </TabsTrigger>
          <TabsTrigger value={1}>
            Job Details
          </TabsTrigger>
        </TabsList>

        {/* ── Applicants Tab ─────────────────────────────────────── */}
        <TabsContent value={0} className="space-y-6">
          <ApplicantFiltersBar
            filters={filters}
            onFilterChange={handleFilterChange}
          />

          {isApplicantsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-lg" />
              ))}
            </div>
          ) : paginatedApplicants.length === 0 ? (
            <Card className="border-dashed border-2 bg-transparent">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <Users className="size-12 text-muted-foreground/20 mb-4" />
                <h3 className="text-lg font-heading font-semibold">
                  No applicants found
                </h3>
                <p className="text-muted-foreground max-w-xs mx-auto mt-1">
                  {allApplicants.length === 0
                    ? "No students have applied for this job yet."
                    : "Try adjusting your filters."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Results count */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing{" "}
                  <span className="font-medium text-foreground">
                    {(page - 1) * ITEMS_PER_PAGE + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium text-foreground">
                    {Math.min(page * ITEMS_PER_PAGE, filteredApplicants.length)}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium text-foreground">
                    {filteredApplicants.length}
                  </span>{" "}
                  applicants
                </p>
                {selectedIds.size > 0 && (
                  <p className="text-sm text-primary font-medium">
                    {selectedIds.size} selected
                  </p>
                )}
              </div>

              <ApplicantTable
                applicants={paginatedApplicants}
                selectedIds={selectedIds}
                onToggleSelect={toggleSelect}
                onToggleAll={toggleAll}
              />

              <JobPagination
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </>
          )}

          {/* Floating status update bar */}
          <StatusUpdateBar
            selectedApplicants={selectedApplicants}
            onUpdateStatus={handleUpdateStatus}
            isPending={isUpdating}
            onClearSelection={() => setSelectedIds(new Set())}
          />
        </TabsContent>

        {/* ── Job Details Tab ────────────────────────────────────── */}
        <TabsContent value={1}>
          <Card>
            <CardContent className="pt-6 space-y-6">
              <div>
                <h3 className="font-heading font-semibold text-lg mb-2">
                  Description
                </h3>
                <p className="text-steel dark:text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {job.description}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-heading font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                    Eligibility
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-mist">Minimum CGPA</span>
                      <span className="font-medium font-mono">
                        {job.requiredCgpa}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-mist">Backlog Allowed</span>
                      <span className="font-medium">
                        {job.backlogAllowed ? "Yes" : "No"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-mist">Branches</span>
                      <span className="font-medium">
                        {job.allowedBranches.join(", ")}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-heading font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                    Timeline
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-mist">Posted On</span>
                      <span className="font-medium">
                        {format(new Date(job.createdAt), "d MMM yyyy")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-mist">Deadline</span>
                      <span className="font-medium">
                        {format(new Date(job.deadline), "d MMM yyyy")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-mist">Last Updated</span>
                      <span className="font-medium">
                        {format(new Date(job.updatedAt), "d MMM yyyy")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
