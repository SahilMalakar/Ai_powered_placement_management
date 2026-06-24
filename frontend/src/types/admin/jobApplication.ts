import { z } from "zod";

// ─── Enums ─────────────────────────────────────────────────────────
export const ApplicationStatusEnum = [
  "APPLIED",
  "SHORTLISTED",
  "SELECTED",
  "REJECTED",
] as const;

export type ApplicationStatus = (typeof ApplicationStatusEnum)[number];

export const VerificationStatusEnum = [
  "NOT_VERIFIED",
  "PROCESSING",
  "VERIFIED",
  "FAILED",
] as const;

export type VerificationStatus = (typeof VerificationStatusEnum)[number];

// ─── Valid forward transitions (mirrors backend) ───────────────────
export const VALID_TRANSITIONS: Record<string, ApplicationStatus[]> = {
  SHORTLISTED: ["APPLIED"],
  SELECTED: ["SHORTLISTED"],
  REJECTED: ["APPLIED", "SHORTLISTED"],
};

// ─── Applicant shape from GET /:id/applicants ──────────────────────
export interface ApplicantProfile {
  fullName: string;
  rollNo: string;
  cgpa: number | null;
  branch: string;
  verificationStatus: VerificationStatus;
}

export interface ApplicantUser {
  id: number;
  email: string;
  profile: ApplicantProfile | null;
}

export interface Applicant {
  id: number;
  userId: number;
  jobId: number;
  status: ApplicationStatus;
  snapshot: unknown;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  user: ApplicantUser;
}

// ─── Batch status update schema (mirrors backend Zod) ──────────────
export const updateApplicationStatusSchema = z.object({
  applicationIds: z
    .array(z.number())
    .min(1, "Select at least one application")
    .max(100, "Cannot update more than 100 at once"),
  status: z.enum(ApplicationStatusEnum),
});

export type UpdateApplicationStatusInput = z.infer<
  typeof updateApplicationStatusSchema
>;

// ─── Response types ────────────────────────────────────────────────
export interface PaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface StatusCounts {
  APPLIED: number;
  SHORTLISTED: number;
  SELECTED: number;
  REJECTED: number;
}

export interface ApplicantsResponse {
  success: boolean;
  message: string;
  data: {
    applicants: Applicant[];
    pagination: PaginationData;
    statusCounts: StatusCounts;
  };
}

export interface BatchUpdateResponse {
  success: boolean;
  message: string;
  data: {
    updated: number;
    total: number;
    skipped: number;
  };
}

export interface ApplicantFilters {
  search?: string;
  status?: string;
  branch?: string;
  verificationStatus?: string;
  page?: number;
  limit?: number;
}
