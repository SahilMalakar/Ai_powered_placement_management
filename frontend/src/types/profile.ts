import { z } from "zod"

// Mirroring Backend Branch Enum
export const BranchEnum = [
  "CSE", "ETE", "EE", "ME", "IE", "CE", "CHE", "IPE", "MCA"
] as const

const dateString = z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
        message: 'Invalid date format',
    })

// Helper for optional URLs that might be empty strings
const optionalUrlSchema = z
    .url('Invalid URL')
    .or(z.literal(''))
    .optional()
    .transform((val) => (val === '' ? undefined : val))

export const coreSchema = z.object({
    fullName: z.string().min(3, 'Full name must be at least 3 characters'),
    branch: z.enum(BranchEnum, {
        message: 'Invalid branch',
    }),
    rollNo: z.string().min(1, 'Roll number is required'),
    dob: dateString,
    phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),
    university: z.string().min(1, 'University is required'),
    degree: z.string().min(1, 'Degree is required'),
    graduationYear: z.number().int({ message: 'Graduation year must be a number' }),
    summary: z.string().optional(),
});

export const semesterResultSchema = z.object({
    semester: z.number().min(1).max(8),
    sgpa: z.number().min(0).max(10),
});

export const socialLinkSchema = z.object({
    platform: z.string().min(1, "Platform is required"),
    url: z.url('Invalid URL').or(z.literal('')),
});

export const experienceSchema = z.object({
    role: z.string().min(1, "Role is required"),
    company: z.string().min(1, "Company is required"),
    location: z.string().optional(),
    startDate: dateString,
    endDate: dateString.optional(),
    description: z.array(z.string()).min(1, "Description is required"),
    toolsUsed: z.string().optional(),
});

export const projectSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.array(z.string()).min(1, "Description is required"),
    link: optionalUrlSchema,
    secondaryLink: optionalUrlSchema,
    keyTools: z.string().optional(),
    startDate: dateString.optional(),
    endDate: dateString.optional(),
});

export const skillSchema = z.object({
    category: z.string().min(1, "Category is required"),
    skills: z.array(z.string()).min(1, "At least one skill is required"),
});

export const additionalDetailSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.array(z.string()).min(1, "Description is required"),
    date: dateString.optional(),
});

export const createProfileSchema = coreSchema.strict();
export const updateProfileSchema = coreSchema.partial().strict();

export type CreateProfileInput = z.infer<typeof createProfileSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export type SkillInput = z.infer<typeof skillSchema>;
export type Skill = SkillInput & { id: number; profileId: number };

export type SocialLinkInput = z.infer<typeof socialLinkSchema>;
export type SocialLink = SocialLinkInput & { id: number; profileId: number };

export type ExperienceInput = z.infer<typeof experienceSchema>;
export type Experience = ExperienceInput & { id: number; profileId: number };

export type ProjectInput = z.infer<typeof projectSchema>;
export type Project = ProjectInput & { id: number; profileId: number };

export type AdditionalDetailInput = z.infer<typeof additionalDetailSchema>;
export type AdditionalDetail = AdditionalDetailInput & { id: number; profileId: number };

export type StudentProfileData = {
    email: string;
    isProfileCompleted: boolean;
    profile: {
        id: number;
        userId: number;
        fullName: string;
        branch: typeof BranchEnum[number];
        rollNo: string;
        dob: string;
        phoneNumber: string | null;
        summary: string | null;
        university: string | null;
        degree: string | null;
        graduationYear: number | null;
        cgpa: number | null;
        astuRollNo: string | null;
        backlog: boolean;
        backlogSubjects: string[];
        verificationStatus: 'NOT_VERIFIED' | 'PROCESSING' | 'VERIFIED' | 'FAILED';
        verificationReason: string | null;
        createdAt: string;
        updatedAt: string;
    };
};
