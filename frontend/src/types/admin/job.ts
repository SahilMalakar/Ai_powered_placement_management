import { z } from "zod";

export const BranchEnum = [
  "CSE",
  "ETE",
  "EE",
  "ME",
  "IE",
  "CE",
  "CHE",
  "IPE",
  "MCA",
] as const;

export const JobStatusEnum = ["DRAFT", "ACTIVE", "DEACTIVE"] as const;

export const createJobSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  company: z.string().min(2, "Company name is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  requiredCgpa: z.number().min(0).max(10),
  allowedBranches: z.array(z.enum(BranchEnum)).min(1, "Select at least one branch"),
  backlogAllowed: z.boolean(),
  status: z.enum(JobStatusEnum),
  deadline: z.string().min(1, "Deadline is required"),
});

export const updateJobSchema = createJobSchema.partial();

export type CreateJobInput = z.infer<typeof createJobSchema>;
export type UpdateJobInput = z.infer<typeof updateJobSchema>;

export interface Job {
  id: string;
  title: string;
  company: string;
  description: string;
  requiredCgpa: number;
  allowedBranches: (typeof BranchEnum)[number][];
  backlogAllowed: boolean;
  status: (typeof JobStatusEnum)[number];
  deadline: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    applications: number;
  };
}

export interface JobPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminJobResponse {
  success: boolean;
  message: string;
  data: {
    jobs: Job[];
    pagination: JobPagination;
  };
}

export interface SingleJobResponse {
  success: boolean;
  message: string;
  data: Job;
}
