"use client";

import { useAppStore } from "@/store/useAppStore";
import { useProfile } from "@/hooks/student/use-profile";
import { useAcademicRecord } from "@/hooks/student/use-academic-record";
import { useApplications } from "@/hooks/student/useApplications";
import { useJobs } from "@/hooks/student/useJobs";
import { useAtsHistory } from "@/hooks/student/useAtsHistory";
import { useApplyJob } from "@/hooks/student/useApplyJob";

import { WelcomeBanner } from "@/components/student/dashboard/welcome-banner";
import { MetricsGrid } from "@/components/student/dashboard/metrics-grid";
import { RecommendedJobs } from "@/components/student/dashboard/recommended-jobs";
import { RecentApplications } from "@/components/student/dashboard/recent-applications";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAppStore();

  // ── 1. Fetch real-time server states using your React Query hooks ──
  const { data: profileResponse, isLoading: isProfileLoading } = useProfile();
  const { isLoading: isAcademicLoading } = useAcademicRecord();
  const { data: applicationsResponse, isLoading: isAppsLoading } = useApplications();
  const { data: jobsResponse, isLoading: isJobsLoading } = useJobs({ 
    limit: 10,
    branches: profileResponse?.profile?.branch ? [profileResponse.profile.branch] : undefined,
  });
  const { data: atsHistoryResponse, isLoading: isAtsLoading } = useAtsHistory(1, 5);
  const { mutate: applyJob, isPending: isApplying, variables: applyingJobId } = useApplyJob();

  const isServerLoading = isProfileLoading || isAcademicLoading || isAppsLoading || isJobsLoading || isAtsLoading;

  const profile = profileResponse?.profile;
  const realJobs = jobsResponse?.jobs || [];
  const realApps = applicationsResponse || [];

  // ── 2. Establish live values from profile states ──
  const displayName = profile?.fullName || user?.name || "Student";
  const displayBranch = profile?.branch || "-";
  const displayCgpa = profile?.cgpa ? profile.cgpa.toFixed(2) : "-";
  const displayBacklog = profile?.backlog !== undefined ? (profile.backlog ? "Backlog" : "No Backlog") : "-";
  const displayVerification = profile?.verificationStatus || "NOT_VERIFIED";

  // Resolve counts (live from server queries)
  const eligibleDrivesCount = jobsResponse?.pagination?.total ?? realJobs.length;
  const appliedCount = realApps.length;
  const shortlistedCount = realApps.filter(a => a.status === "SHORTLISTED" || a.status === "SELECTED").length;
  const atsCreditsLeft = atsHistoryResponse?.todayCount !== undefined ? Math.max(0, 5 - atsHistoryResponse.todayCount) : 5;

  // Use dynamic backend jobs
  const displayJobs = realJobs.slice(0, 4).map(j => ({
    id: j.id,
    title: j.title,
    company: j.company,
    deadline: `Closes ${new Date(j.deadline).toLocaleDateString("en-GB", { day: 'numeric', month: 'short', year: 'numeric' })}`,
    minCgpa: j.requiredCgpa,
    eligible: true,
  }));

  // Use dynamic backend applications
  const displayApps = realApps.slice(0, 3).map(a => ({
    id: a.id,
    title: a.job.title,
    company: a.job.company,
    status: a.status,
    appliedDate: `Applied ${new Date(a.createdAt).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' })}`,
  }));

  if (isServerLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#818cf8]" />
        <p className="text-sm font-medium text-slate-400 font-mono">Hydrating Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in duration-500 max-w-7xl mx-auto px-4 md:px-0">

      {/* ── 1. HEADER WELCOME BANNER ── */}
      <WelcomeBanner
        displayName={displayName}
        displayBranch={displayBranch}
        displayCgpa={displayCgpa}
        displayBacklog={displayBacklog}
        displayVerification={displayVerification}
      />

      {/* ── 2. METRICS STATS GRID ── */}
      <MetricsGrid
        eligibleDrivesCount={eligibleDrivesCount}
        appliedCount={appliedCount}
        shortlistedCount={shortlistedCount}
        atsCreditsLeft={atsCreditsLeft}
      />

      {/* ── 3. BOTTOM SPLIT COLUMNS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Recommended Jobs for You Feed (Takes 2 grid blocks) */}
        <div className="lg:col-span-2">
          <RecommendedJobs
            jobs={displayJobs}
            onApply={applyJob}
            applyingJobId={isApplying ? (applyingJobId as number) : null}
          />
        </div>

        {/* Recent Applications Activity (Takes 1 grid block) */}
        <div>
          <RecentApplications applications={displayApps} />
        </div>

      </div>

    </div>
  );
}
