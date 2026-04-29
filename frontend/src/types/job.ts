export interface Job {
  id: number;
  title: string;
  company: string;
  description: string;
  requiredCgpa: number;
  allowedBranches: string[];
  backlogAllowed: boolean;
  status: 'ACTIVE' | 'DEACTIVE' | 'DRAFT';
  deadline: string;
  location?: string;
  ctc?: string;
  eligible?: boolean;
  ineligibilityReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface JobPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface JobsResponse {
  jobs: Job[];
  pagination: JobPagination;
}

export interface JobFilters {
  search?: string;
  branch?: string;
  cgpa?: string;
  page?: number;
  limit?: number;
}
