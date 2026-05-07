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
  id: number;
  fullName: string;
  branch: (typeof BranchEnum)[number];
  cgpa: number | null;
  backlog: boolean | null;
  backlogSubjects: string[];
  verificationStatus: (typeof VerificationStatusEnum)[number];
  rollNo: string;
  degree: string | null;
  dob: string;
  phoneNumber: string | null;
  graduationYear: number | null;
  university: string | null;
}

export interface StudentSemester {
  id: number;
  semester: number;
  sgpa: number;
}

export interface StudentDocument {
  id: number;
  semester: number | null;
  url: string;
  publicId: string | null;
}

export interface StudentApplication {
  id: number;
  userId: number;
  jobId: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  job: {
    id: number;
    title: string;
    company: string;
  };
}

export interface Student {
  id: number;
  email: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  profile: StudentProfile;
  semesters: StudentSemester[];
  documents: StudentDocument[];
  applications: StudentApplication[];
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
