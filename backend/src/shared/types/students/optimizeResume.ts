import { z } from 'zod';

// ─────────────────────────────────────────────────────────────
// STAGE 1 — Branch + Role Classifier
// ─────────────────────────────────────────────────────────────
export const ClassifierSchema = z.object({
    detectedBranch: z.string().min(1),
    detectedRole: z.string().min(1),
    roleCategory: z.enum([
        'software',
        'hardware',
        'electrical',
        'mechanical',
        'industrial',
        'civil',
        'chemical',
    ]),
    confidence: z.enum(['high', 'medium', 'low']),
});
export type ClassifierOutput = z.infer<typeof ClassifierSchema>;

// ─────────────────────────────────────────────────────────────
// STAGE 2 — Content Inventory
// ─────────────────────────────────────────────────────────────
const EducationSchema = z.object({
    institution: z.string(),
    degree: z.string(),
    branch: z.string(),
    cgpa: z.string(),
    graduationYear: z.string(),
    coursework: z.string(),
});

const SkillCategorySchema = z.object({
    category: z.string(),
    items: z.array(z.string()),
});

const ExperienceSchema = z.object({
    role: z.string(),
    company: z.string(),
    duration: z.string(),
    bullets: z.array(z.string()),
    tools: z.string(),
});

const ProjectSchema = z.object({
    title: z.string(),
    description: z.array(z.string()),
    tools: z.string(),
    link: z.string(),
    outcome: z.string(),
});

const InternshipSchema = z.object({
    org: z.string(),
    role: z.string(),
    duration: z.string(),
    work: z.array(z.string()),
});

const CertificationSchema = z.object({
    name: z.string(),
    issuer: z.string(),
    year: z.string(),
});

export const ContentInventorySchema = z.object({
    personalInfo: z.object({
        name: z.string(),
        email: z.string(),
        phone: z.string(),
        location: z.string(),
        linkedin: z.string(),
        github: z.string(),
        portfolio: z.string(),
    }),
    education: z.array(EducationSchema),
    skills: z.array(SkillCategorySchema),
    experience: z.array(ExperienceSchema),
    projects: z.array(ProjectSchema),
    internships: z.array(InternshipSchema),
    certifications: z.array(CertificationSchema),
    achievements: z.array(z.string()),
    extracurriculars: z.array(z.string()),
    missingSections: z.array(z.string()),
});
export type ContentInventoryOutput = z.infer<typeof ContentInventorySchema>;

// ─────────────────────────────────────────────────────────────
// STAGE 4 — Resume JSON Mapper
// ─────────────────────────────────────────────────────────────
export const ResumeJsonMapperSchema = z.object({
    targetRole: z.string(),
    name: z.string(),
    contact: z.object({
        email: z.string(),
        phone: z.string(),
        linkedin: z.string(),
        github: z.string(),
        portfolio: z.string(),
        leetcode: z.string(),
        address: z.string(),
    }),
    summary: z.string(),
    skills: z.array(
        z.object({
            category: z.string(),
            items: z.array(z.string()),
        })
    ),
    workExperience: z.array(
        z.object({
            title: z.string(),
            company: z.string(),
            location: z.string(),
            dateRange: z.string(),
            techStack: z.array(z.string()),
            bullets: z.array(z.string()),
        })
    ),
    projects: z.array(
        z.object({
            title: z.string(),
            techStack: z.array(z.string()),
            githubUrl: z.string(),
            liveUrl: z.string(),
            dateRange: z.string(),
            bullets: z.array(z.string()),
        })
    ),
    education: z.array(
        z.object({
            institution: z.string(),
            degree: z.string(),
            dateRange: z.string(),
            cgpa: z.string(),
        })
    ),
    additionalDetails: z.array(
        z.object({
            title: z.string(),
            description: z.array(z.string()),
            date: z.string(),
        })
    ),
});
export type ResumeJsonMapperOutput = z.infer<typeof ResumeJsonMapperSchema>;

// ─────────────────────────────────────────────────────────────
// STAGE 5 — Gap Report
// ─────────────────────────────────────────────────────────────
export const GapReportSchema = z.object({
    skillsToLearn: z.array(
        z.object({
            skill: z.string(),
            whyItMatters: z.string(),
            howToLearn: z.string(),
        })
    ),
    projectsToBuild: z.array(
        z.object({
            idea: z.string(),
            relevance: z.string(),
        })
    ),
    certificationsToPursue: z.array(
        z.object({
            name: z.string(),
            relevance: z.string(),
        })
    ),
    experienceToSeek: z.array(z.string()),
    immediateActions: z.array(z.string()),
    messageToCandidate: z.string(),
});
export type GapReportOutput = z.infer<typeof GapReportSchema>;

// ─────────────────────────────────────────────────────────────
// Redis Cache — Job Status
// ─────────────────────────────────────────────────────────────
export const ResumeJobResultSchema = z.object({
    status: z.enum(['processing', 'completed', 'failed']),
    resumeId: z.number().optional(),
    pdfUrl: z.string().optional(),
    error: z.string().optional(),
    createdAt: z.string(),
});
export type ResumeJobResult = z.infer<typeof ResumeJobResultSchema>;

export interface OptimizeResumeJobPayload {
    userId: number;
    resumeId: number;
    rawText: string;
}