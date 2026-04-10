import { z } from "zod";
import { Branch } from "../../prisma/generated/prisma/enums.js";

const dateString = z
  .string()
  .refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  })
  .transform((val) => new Date(val));

// Helper for optional URLs that might be empty strings
const optionalUrlSchema = z
  .string()
  .url("Invalid URL")
  .or(z.literal(""))
  .optional()
  .transform((val) => (val === "" ? undefined : val));

const coreSchema = z.object({
  fullName: z.string().min(3, "Full name must be at least 3 characters"),
  branch: z.enum(Branch, {
    message: "Invalid branch",
  }),
  rollNo: z.string().min(1, "Roll number is required"),
  astuRollNo: z.string().optional(), // Now populated via verification worker
  dob: dateString,
  phoneNumber: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number"),
  backlog: z.boolean(),
  backlogSubjects: z.array(z.string()).default([]),
  summary: z.string().optional(),
  university: z.string().optional(),
  degree: z.string().optional(),
  graduationYear: z.number().int().optional(),
});

const semesterResultSchema = z.object({
  semester: z.number().min(1).max(8),
  sgpa: z.number().min(0).max(10),
});

const socialLinkSchema = z.object({
  platform: z.string(),
  url: z.string().url("Invalid URL").or(z.literal("")),
});

const experienceSchema = z.object({
  role: z.string(),
  company: z.string(),
  location: z.string().optional(),
  startDate: dateString,
  endDate: dateString.optional(),
  description: z.array(z.string()), // Updated to array of bullets
});

const projectSchema = z.object({
  title: z.string(),
  description: z.array(z.string()), // Updated to array of bullets
  link: optionalUrlSchema,
  secondaryLink: optionalUrlSchema,
  keyTools: z.string().optional(), // Replaced techStack with keyTools
  startDate: dateString.optional(),
  endDate: dateString.optional(),
});

const skillSchema = z.object({
  category: z.string(), // e.g. "Languages"
  skills: z.array(z.string()), // e.g. ["JS", "TS"]
});

const additionalDetailSchema = z.object({
  title: z.string(), // e.g. "OpenSource Contribution"
  description: z.array(z.string()), // Detailed bullets
  date: dateString.optional(),
});

export const createProfileSchema = z.object({
  core: coreSchema,
  socialLinks: z.array(socialLinkSchema).optional(),
  experiences: z.array(experienceSchema).optional(),
  projects: z.array(projectSchema).optional(),
  skills: z.array(skillSchema).optional(),
  additionalDetails: z.array(additionalDetailSchema).optional(),
});

// Schema for partial updates ensures that individual fields can be updated without providing the full object
export const updateProfileSchema = z.object({
  core: coreSchema.partial(),
  socialLinks: z.array(socialLinkSchema).optional(),
  experiences: z.array(experienceSchema).optional(),
  projects: z.array(projectSchema).optional(),
  skills: z.array(skillSchema).optional(),
  additionalDetails: z.array(additionalDetailSchema).optional(),
}).partial();

export type CreateProfileInput = z.infer<typeof createProfileSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export type CoreProfile = z.infer<typeof coreSchema>;
export type SemesterResultInput = z.infer<typeof semesterResultSchema>;
export type SocialLinkInput = z.infer<typeof socialLinkSchema>;
export type ExperienceInput = z.infer<typeof experienceSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
export type SkillInput = z.infer<typeof skillSchema>;
export type AdditionalDetailInput = z.infer<typeof additionalDetailSchema>;