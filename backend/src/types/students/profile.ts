import { z } from 'zod';
import { Branch } from '../../prisma/generated/prisma/enums.js';

const dateString = z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
        message: 'Invalid date format',
    })
    .transform((val) => new Date(val));

// Helper for optional URLs that might be empty strings
const optionalUrlSchema = z
    .url('Invalid URL')
    .or(z.literal(''))
    .optional()
    .transform((val) => (val === '' ? undefined : val));

export const CreateProfileSchema = z.object({
    fullName: z.string().min(3, 'Full name must be at least 3 characters'),
    branch: z.enum(Branch, {
        message: 'Invalid branch',
    }),
    rollNo: z.string().min(1, 'Roll number is required'),
    dob: dateString,
    phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),
    university: z.string(),
    degree: z.string(),
    graduationYear: z.number().int(),
    summary: z.string().optional(),
}).strict();

export const UpdateProfileSchema = CreateProfileSchema.partial().strict().refine(
    (data) => Object.keys(data).length > 0,
    { message: "At least one field must be provided for update" }
);


export const semesterResultSchema = z.object({
    semester: z.number().min(1).max(8),
    sgpa: z.number().min(0).max(10),
});

const socialLinkSchema = z.object({
    platform: z.string(),
    url: z.url('Invalid URL').or(z.literal('')),
});

export const experienceSchema = z.object({
    role: z.string().min(1, 'Role is required'),
    company: z.string().min(1, 'Company is required'),
    location: z.string().optional(),
    startDate: dateString,
    endDate: dateString.optional(),
    description: z.array(z.string()).min(1, 'Description is required'),
    toolsUsed: z.string().optional(),
}).strict();

export const updateExperienceSchema = experienceSchema.partial().strict().refine(
    (data) => Object.keys(data).length > 0,
    { message: "At least one field must be provided for update" }
);

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


export type CreateProfileInput = z.infer<typeof CreateProfileSchema>;
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;

// export type CoreProfile = z.infer<typeof coreSchema>;
export type SemesterResultInput = z.infer<typeof semesterResultSchema>;
export type SocialLinkInput = z.infer<typeof socialLinkSchema>;
export type ExperienceInput = z.infer<typeof experienceSchema>;
export type UpdateExperienceInput = z.infer<typeof updateExperienceSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
export type SkillInput = z.infer<typeof skillSchema>;
export type AdditionalDetailInput = z.infer<typeof additionalDetailSchema>;
