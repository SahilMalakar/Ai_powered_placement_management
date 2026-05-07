import { z } from "zod";
import { BranchEnum } from "./job";

export const VerificationStatusEnum = [
  "NOT_VERIFIED",
  "PROCESSING",
  "VERIFIED",
  "FAILED",
] as const;

export const getAllStudentsQuerySchema = z.object({
  search: z.string().optional(),
  branch: z.enum(BranchEnum).optional(),
  cgpa: z.string().optional(),
  backlogAllowed: z.boolean().optional(),
  verificationStatus: z.enum(VerificationStatusEnum).optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10),
});

export type GetAllStudentsQueryInput = z.infer<typeof getAllStudentsQuerySchema>;

export interface StudentProfile {
  fullName: string;
  branch: (typeof BranchEnum)[number];
  cgpa: number;
  backlog: boolean;
  verificationStatus: (typeof VerificationStatusEnum)[number];
  rollNo?: string;
}

export interface Student {
  id: number;
  email: string;
  deletedAt: string | null;
  profile: StudentProfile;
}

export interface StudentPagination {
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminStudentsResponse {
  success: boolean;
  message: string;
  data: {
    students: Student[];
    pagination: StudentPagination;
  };
}

export interface SingleStudentResponse {
  success: boolean;
  message: string;
  data: Student;
}
