// ─── Dashboard Stats Response Types ───────────────────────────────

export interface ActivityItem {
  type: 'JOB_POSTED' | 'APPLICATION_RECEIVED' | 'STUDENT_SELECTED' | 'STUDENT_SHORTLISTED';
  title: string;
  description: string;
  timestamp: string;
}

export interface BranchStat {
  branch: string;
  total: number;
  placed: number;
}

export interface DashboardStats {
  totalStudents: number;
  verifiedStudents: number;
  pendingVerifications: number;
  activeJobs: number;
  draftJobs: number;
  totalJobs: number;
  totalApplications: number;
  placedStudents: number;
  shortlistedStudents: number;
  recentActivities: ActivityItem[];
  branchDistribution: BranchStat[];
}

export interface DashboardStatsResponse {
  success: boolean;
  message: string;
  data: DashboardStats;
}
