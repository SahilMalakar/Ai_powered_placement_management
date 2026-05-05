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
  createdById: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
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
  branches?: string[];
  backlog?: 'all' | 'yes' | 'no';
  page?: number;
  limit?: number;
}
