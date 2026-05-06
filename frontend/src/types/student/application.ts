import { z } from "zod";

export const applicationStatusSchema = z.enum(["APPLIED", "SHORTLISTED", "SELECTED", "REJECTED"]);

export const applicationJobSchema = z.object({
  id: z.number(),
  title: z.string(),
  company: z.string(),
  status: z.string(),
  deadline: z.string(),
});

export const applicationSchema = z.object({
  id: z.number(),
  userId: z.number(),
  jobId: z.number(),
  status: applicationStatusSchema,
  createdAt: z.string(),
  job: applicationJobSchema,
});

export const applicationsResponseSchema = z.array(applicationSchema);

export type ApplicationStatus = z.infer<typeof applicationStatusSchema>;
export type Application = z.infer<typeof applicationSchema>;
export type ApplicationJob = z.infer<typeof applicationJobSchema>;
export type ApplicationsResponse = z.infer<typeof applicationsResponseSchema>;
