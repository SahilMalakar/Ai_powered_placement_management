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
    .string()
    .url('Invalid URL')
    .or(z.literal(''))
    .optional()

export const coreSchema = z.object({
    fullName: z.string().min(3, 'Full name must be at least 3 characters'),
    branch: z.enum(BranchEnum, {
        message: 'Invalid branch',
    }),
    rollNo: z.string().min(1, 'Roll number is required'),
    dob: dateString,
    phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),
    summary: z.string().optional(),
    university: z.string().optional(),
    degree: z.string().optional(),
    graduationYear: z.number().int().optional(),
});

export const semesterResultSchema = z.object({
    semester: z.number().min(1).max(8),
    sgpa: z.number().min(0).max(10),
});

export const socialLinkSchema = z.object({
    platform: z.string(),
    url: z.string().url('Invalid URL').or(z.literal('')),
});

export const experienceSchema = z.object({
    role: z.string(),
    company: z.string(),
    location: z.string().optional(),
    startDate: dateString,
    endDate: dateString.optional(),
    description: z.array(z.string()),
    toolsUsed: z.string().optional(),
});

export const projectSchema = z.object({
    title: z.string(),
    description: z.array(z.string()),
    link: optionalUrlSchema,
    secondaryLink: optionalUrlSchema,
    keyTools: z.string().optional(),
    startDate: dateString.optional(),
    endDate: dateString.optional(),
});

export const skillSchema = z.object({
    category: z.string(),
    skills: z.array(z.string()),
});

export const additionalDetailSchema = z.object({
    title: z.string(),
    description: z.array(z.string()),
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

export type SkillInput = z.infer<typeof skillSchema>;
export type UpdateSkillInput = Partial<SkillInput>;
export type Skill = SkillInput & { id: number; profileId: number };

export type SocialLinkInput = z.infer<typeof socialLinkSchema>;
export type UpdateSocialLinkInput = Partial<SocialLinkInput>;
export type SocialLink = SocialLinkInput & { id: number; profileId: number };

export type ExperienceInput = z.infer<typeof experienceSchema>;
export type UpdateExperienceInput = Partial<ExperienceInput>;
export type Experience = ExperienceInput & { id: number; profileId: number };

export type ProjectInput = z.infer<typeof projectSchema>;
export type UpdateProjectInput = Partial<ProjectInput>;
export type Project = ProjectInput & { id: number; profileId: number };

export type AdditionalDetailInput = z.infer<typeof additionalDetailSchema>;
export type UpdateAdditionalDetailInput = Partial<AdditionalDetailInput>;
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
        socialLinks: SocialLink[];
        experiences: Experience[];
        projects: Project[];
        skills: Skill[];
        additionalDetails: AdditionalDetail[];
    };
    semesters: z.infer<typeof semesterResultSchema>[];
    documents: {
        sem1: { id: number; type: string; url: string; createdAt: string } | null;
        sem2: { id: number; type: string; url: string; createdAt: string } | null;
        sem3: { id: number; type: string; url: string; createdAt: string } | null;
        sem4: { id: number; type: string; url: string; createdAt: string } | null;
        sem5: { id: number; type: string; url: string; createdAt: string } | null;
        sem6: { id: number; type: string; url: string; createdAt: string } | null;
        sem7: { id: number; type: string; url: string; createdAt: string } | null;
        sem8: { id: number; type: string; url: string; createdAt: string } | null;
        other: {
            id: number;
            type: string;
            url: string;
            semester?: number | null;
            createdAt: string;
        }[];
    };
};
