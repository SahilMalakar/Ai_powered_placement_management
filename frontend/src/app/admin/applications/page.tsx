"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  Users,
  Search,
  ArrowRight,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowUpRight,
  LayoutDashboard,
  UserSearch,
} from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useApplicationDashboard } from "@/hooks/admin/useAdminJobs";
import { useAllApplicants } from "@/hooks/admin/useAdminJobApplications";
import { ApplicantFiltersBar, type ApplicantFilters } from "@/components/admin/application/applicant-filters";
import { ApplicantTable } from "@/components/admin/application/applicant-table";
import { ApplicantDetailsSheet } from "@/components/admin/application/applicant-details-sheet";
import { StatusUpdateBar } from "@/components/admin/application/status-update-bar";
import { useUpdateApplicationStatus } from "@/hooks/admin/useAdminJobApplications";
import type { Applicant } from "@/types/admin/jobApplication";

// ─── Status config ─────────────────────────────────────────────────
const STATUS_CONFIG = {
  APPLIED: { label: "Applied", color: "text-steel", bg: "bg-pale/30 dark:bg-muted/30", icon: Clock },
  SHORTLISTED: { label: "Shortlisted", color: "text-warning", bg: "bg-warning/10", icon: ArrowUpRight },
  SELECTED: { label: "Selected", color: "text-success", bg: "bg-success/10", icon: CheckCircle2 },
  REJECTED: { label: "Rejected", color: "text-error", bg: "bg-error/10", icon: XCircle },
} as const;

const JOB_STATUS_STYLES: Record<string, string> = {
  ACTIVE: "bg-success/10 text-success border-success/20",
  DRAFT: "bg-pale text-steel border-pale dark:bg-muted dark:text-muted-foreground dark:border-border",
  DEACTIVE: "bg-muted text-muted-foreground border-border",
};

interface JobWithStats {
  id: number;
  title: string;
  company: string;
  status: string;
  deadline: string;
  allowedBranches: string[];
  createdAt: string;
  _count: { applications: number };
  statusCounts: {
    APPLIED: number;
    SHORTLISTED: number;
    SELECTED: number;
    REJECTED: number;
  };
}

export default function AdminApplicationsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  
  // Overview State
  const { data: dashboardResponse, isLoading: isDashboardLoading } = useApplicationDashboard();
  const [dashboardSearch, setDashboardSearch] = useState("");
  const [debouncedDashboardSearch, setDebouncedDashboardSearch] = useState("");

  // Global Applicants State
  const [filters, setFilters] = useState<ApplicantFilters>({
    search: "",
    status: "all",
    branch: "all",
    verificationStatus: "all",
    page: 1,
    limit: 10,
  });
  const { data: applicantsResponse, isLoading: isApplicantsLoading } = useAllApplicants(filters);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [activeApplicant, setActiveApplicant] = useState<Applicant | null>(null);

  const updateStatusMutation = useUpdateApplicationStatus("global"); // Invalidate global list

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedDashboardSearch(dashboardSearch), 400);
    return () => clearTimeout(timer);
  }, [dashboardSearch]);

  const dashboardJobs: JobWithStats[] = dashboardResponse?.data || [];

  const filteredDashboardJobs = useMemo(() => {
    if (!debouncedDashboardSearch) return dashboardJobs;
    const q = debouncedDashboardSearch.toLowerCase();
    return dashboardJobs.filter(
      (j) =>
        j.title.toLowerCase().includes(q) ||
        j.company.toLowerCase().includes(q)
    );
  }, [dashboardJobs, debouncedDashboardSearch]);

  const globalStats = useMemo(() => {
    return dashboardJobs.reduce(
      (acc, job) => ({
        totalApplications: acc.totalApplications + job._count.applications,
        applied: acc.applied + job.statusCounts.APPLIED,
        shortlisted: acc.shortlisted + job.statusCounts.SHORTLISTED,
        selected: acc.selected + job.statusCounts.SELECTED,
        rejected: acc.rejected + job.statusCounts.REJECTED,
      }),
      { totalApplications: 0, applied: 0, shortlisted: 0, selected: 0, rejected: 0 }
    );
  }, [dashboardJobs]);

  const handleFilterChange = (newFilters: Partial<ApplicantFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
    setSelectedIds(new Set());
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
    setSelectedIds(new Set());
  };

  const toggleSelection = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === (applicantsResponse?.data.applicants.length || 0)) {
      setSelectedIds(new Set());
    } else {
      const allIds = applicantsResponse?.data.applicants.map((a) => a.id) || [];
      setSelectedIds(new Set(allIds));
    }
  };

  const selectedApplicants = useMemo(() => {
    return (applicantsResponse?.data.applicants || []).filter((a) => selectedIds.has(a.id));
  }, [applicantsResponse, selectedIds]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
            Application Management
          </h1>
          <p className="text-steel dark:text-muted-foreground">
            Track and manage student applications across the entire portal
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-card border border-border p-1">
          <TabsTrigger value="overview" className="gap-2">
            <LayoutDashboard className="size-4" /> Overview
          </TabsTrigger>
          <TabsTrigger value="applicants" className="gap-2">
            <UserSearch className="size-4" /> All Applicants
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8 mt-0 border-none p-0 outline-none">
          {/* Global Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <StatCard label="Total Applications" value={globalStats.totalApplications} icon={Users} color="text-primary" bgColor="bg-primary/5 dark:bg-primary/10" />
            <StatCard label="Applied" value={globalStats.applied} icon={Clock} color="text-steel" bgColor="bg-pale/20 dark:bg-muted/30" />
            <StatCard label="Shortlisted" value={globalStats.shortlisted} icon={ArrowUpRight} color="text-warning" bgColor="bg-warning/5" />
            <StatCard label="Selected" value={globalStats.selected} icon={CheckCircle2} color="text-success" bgColor="bg-success/5" />
            <StatCard label="Rejected" value={globalStats.rejected} icon={XCircle} color="text-error" bgColor="bg-error/5" />
          </div>

          {/* Search */}
          <div className="relative max-w-lg">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-mist" />
            <Input
              placeholder="Search jobs by title or company..."
              className="pl-10 h-11 bg-card border-border shadow-sm focus-visible:ring-primary"
              value={dashboardSearch}
              onChange={(e) => setDashboardSearch(e.target.value)}
            />
          </div>

          {/* Job Funnels */}
          {isDashboardLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
            </div>
          ) : filteredDashboardJobs.length === 0 ? (
            <Card className="border-dashed border-2 bg-transparent py-20 text-center">
              <Briefcase className="size-16 text-muted-foreground/10 mb-4 mx-auto" />
              <h3 className="text-xl font-heading font-bold">No jobs found</h3>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredDashboardJobs.map((job) => (
                <JobFunnelCard key={job.id} job={job} onClick={() => router.push(`/admin/jobs/${job.id}`)} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="applicants" className="space-y-6 mt-0 border-none p-0 outline-none">
           <Card className="border-none shadow-heavy overflow-hidden">
            <CardContent className="p-0">
              <div className="p-4 border-b border-border bg-card/50">
                <ApplicantFiltersBar filters={filters} onFilterChange={handleFilterChange} />
              </div>

              <ApplicantTable
                applicants={applicantsResponse?.data.applicants || []}
                pagination={applicantsResponse?.data.pagination}
                isLoading={isApplicantsLoading}
                selectedIds={selectedIds}
                onToggleSelect={toggleSelection}
                onToggleAll={toggleSelectAll}
                onViewDetails={setActiveApplicant}
                onPageChange={handlePageChange}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ApplicantDetailsSheet
        applicant={activeApplicant}
        open={!!activeApplicant}
        onOpenChange={(open) => !open && setActiveApplicant(null)}
      />

      <StatusUpdateBar
        selectedApplicants={selectedApplicants}
        isPending={updateStatusMutation.isPending}
        onUpdateStatus={(status) =>
          updateStatusMutation.mutate({
            applicationIds: Array.from(selectedIds),
            status,
          })
        }
        onClearSelection={() => setSelectedIds(new Set())}
      />
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────

function StatCard({ label, value, icon: Icon, color, bgColor }: any) {
  return (
    <Card className="border-none shadow-heavy">
      <CardContent className="p-5">
        <div className="flex items-center gap-3">
          <div className={cn("flex size-10 items-center justify-center rounded-xl", bgColor)}>
            <Icon className={cn("size-5", color)} />
          </div>
          <div>
            <p className="text-[10px] font-heading font-bold uppercase tracking-widest text-mist dark:text-muted-foreground/60">{label}</p>
            <p className={cn("text-2xl font-bold font-heading tracking-tight", color)}>{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function JobFunnelCard({ job, onClick }: { job: JobWithStats; onClick: () => void }) {
  const total = job._count.applications;
  const { APPLIED, SHORTLISTED, SELECTED, REJECTED } = job.statusCounts;

  return (
    <Card className="group cursor-pointer border-none shadow-heavy hover:shadow-modal transition-all duration-300 overflow-hidden" onClick={onClick}>
      <div className="absolute top-0 left-0 w-1 h-full bg-primary/30 group-hover:bg-primary/60 transition-colors" />
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4 min-w-0 flex-1">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-pale font-heading text-2xl font-bold text-deep-blue dark:bg-muted dark:text-foreground shadow-sm">
              {job.company.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 space-y-1.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="font-heading text-lg font-bold tracking-tight text-foreground group-hover:text-primary transition-colors truncate">{job.title}</h3>
                <Badge variant="outline" className={cn("text-[10px] font-bold uppercase tracking-widest h-5 px-2 shrink-0", JOB_STATUS_STYLES[job.status] || JOB_STATUS_STYLES.DRAFT)}>
                  {job.status}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-mist dark:text-muted-foreground/60">
                <span className="flex items-center gap-1.5 font-medium"><Building2 className="size-3.5" />{job.company}</span>
                <span className="flex items-center gap-1.5"><Calendar className="size-3.5" />{format(new Date(job.deadline), "dd MMM yyyy")}</span>
                <span className="flex items-center gap-1.5 font-bold text-foreground"><Users className="size-3.5" />{total} applicants</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 lg:gap-4 shrink-0">
            {(Object.entries(STATUS_CONFIG) as any[]).map(([key, config]) => (
              <div key={key} className={cn("flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition-colors", config.bg)}>
                <config.icon className={cn("size-3.5", config.color)} />
                <span className={config.color}>{job.statusCounts[key as keyof typeof job.statusCounts]}</span>
              </div>
            ))}
            <div className="hidden lg:flex items-center justify-center size-8 rounded-lg border border-border group-hover:border-primary/30 group-hover:bg-primary/5 transition-all">
              <ArrowRight className="size-4 text-mist group-hover:text-primary transition-colors" />
            </div>
          </div>
        </div>
        {total > 0 && (
          <div className="mt-4 flex h-1.5 rounded-full overflow-hidden bg-border/30">
            <div className="bg-steel/40 transition-all" style={{ width: `${(APPLIED / total) * 100}%` }} />
            <div className="bg-warning/60 transition-all" style={{ width: `${(SHORTLISTED / total) * 100}%` }} />
            <div className="bg-success/60 transition-all" style={{ width: `${(SELECTED / total) * 100}%` }} />
            <div className="bg-error/40 transition-all" style={{ width: `${(REJECTED / total) * 100}%` }} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
