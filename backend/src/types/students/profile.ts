import { z } from "zod";
import { Branch } from "../../prisma/generated/prisma/enums.js";

const dateString = z
  .string()
  .refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  })
  .transform((val) => new Date(val));

const coreSchema = z.object({
  fullName: z.string().min(3, "Full name must be at least 3 characters"),
  branch: z.nativeEnum(Branch, {
    message: "Invalid branch",
  }),
  rollNo: z.string().min(1, "Roll number is required"),
  astuRollNo: z.string().min(1, "ASTU roll number is required"),
  dob: dateString,
  phoneNumber: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number"),
  backlog: z.boolean(),
  backlogSubjects: z.array(z.string()).default([]),
  summary: z.string().optional(),
});

const semesterResultSchema = z.object({
  semester: z.number().min(1).max(8),
  sgpa: z.number().min(0).max(10),
});

const socialLinkSchema = z.object({
  platform: z.string(),
  url: z.string().url("Invalid URL"),
});

const experienceSchema = z.object({
  role: z.string(),
  company: z.string(),
  startDate: dateString,
  endDate: dateString.optional(),
  description: z.string().optional(),
});

const projectSchema = z.object({
  title: z.string(),
  description: z.string(),
  link: z.string().url().optional(),
  techStack: z.string().optional(),
});

const skillSchema = z.object({
  name: z.string(),
  category: z.string().optional(),
});

export const createProfileSchema = z.object({
  core: coreSchema,
  semesterResults: z.array(semesterResultSchema).default([]),
  socialLinks: z.array(socialLinkSchema).optional(),
  experiences: z.array(experienceSchema).optional(),
  projects: z.array(projectSchema).optional(),
  skills: z.array(skillSchema).optional(),
});

export const updateProfileSchema = createProfileSchema.partial();



export type CreateProfileInput = z.infer<typeof createProfileSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export type CoreProfile = z.infer<typeof coreSchema>;
export type SemesterResultInput = z.infer<typeof semesterResultSchema>;
export type SocialLinkInput = z.infer<typeof socialLinkSchema>;
export type ExperienceInput = z.infer<typeof experienceSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
export type SkillInput = z.infer<typeof skillSchema>;