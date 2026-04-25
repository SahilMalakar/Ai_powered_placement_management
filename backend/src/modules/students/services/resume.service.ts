import { getFullStudentData } from '../repositories/student.repository.js';
import {
    countUserResumes,
    findResumesByUserId,
    findResumeById,
    updateResumeJson,
    updateResumePdfUrl,
    createResumeRecord,
    getLatestResumeVersion,
} from '../repositories/resume.repository.js';
import { addResumeJobToQueue } from '../../../queues/resume.queue.js';
import { resumeJsonSchema } from '../../../types/students/resume.js';
import {
    BadRequestError,
    NotFoundError,
} from '../../../utils/errors/httpErrors.js';

const MAX_RESUMES = 5;

// AI-Driven Resume Generation (Asynchronous via BullMQ).
export const generateResumeService = async (userId: number) => {
    // 1. Enforce business limit (max 5 resumes per student)
    const currentCount = await countUserResumes(userId);
    if (currentCount >= MAX_RESUMES) {
        throw new BadRequestError(
            `Maximum limit of ${MAX_RESUMES} resumes reached. Please delete an old version to generate a new one.`
        );
    }

    // 2. Fetch student's comprehensive profile data to ensure it exists
    const fullProfile = await getFullStudentData(userId);
    if (!fullProfile?.profile) {
        throw new NotFoundError(
            'Student profile not found. Please complete your profile before generating a resume.'
        );
    }

    // 3. Validation Guard: Ensure mandatory sections are populated for a professional resume
    const profile = fullProfile.profile;
    const missingSections: string[] = [];

    if (!profile.skills || profile.skills.length === 0)
        missingSections.push('Technical Skills');
    if (!profile.projects || profile.projects.length === 0)
        missingSections.push('Projects');

    // Check education via profile or semester results
    const hasEducation =
        (profile as any).education?.length > 0 ||
        (fullProfile as any).semesters?.length > 0;
    if (!hasEducation) missingSections.push('Education');

    if (missingSections.length > 0) {
        throw new BadRequestError(
            `Incomplete Profile: Please add the following sections before generating a resume: ${missingSections.join(', ')}`
        );
    }

    // 4. Create a placeholder resume record immediately to get the resumeId
    const latestVersion = await getLatestResumeVersion(userId);
    const newVersion = latestVersion + 1;
    const resume = await createResumeRecord(userId, newVersion, {}); // Empty JSON initially

    // 4. En-queue for background AI analysis
    console.log(`[Resume Service] En-queueing GENERATE_RESUME for user ${userId}. Profile data keys:`, Object.keys(fullProfile));
    
    const job = await addResumeJobToQueue({
        type: 'GENERATE_RESUME',
        userId,
        resumeId: resume.id,
        profileData: fullProfile as unknown as Record<string, unknown>,
        branch: fullProfile.profile.branch,
    });

    return {
        message:
            'Resume generation has started in the background. It will appear in your list shortly.',
        resumeId: resume.id,
        jobId: job.id,
    };
};

// Fetches all resumes for the authenticated student.
export const getStudentResumesService = async (userId: number) => {
    return await findResumesByUserId(userId);
};

// Fetches a single resume by ID for the authenticated student.
export const getResumeByIdService = async (id: number, userId: number) => {
    const resume = await findResumeById(id);
    if (!resume || resume.userId !== userId) {
        throw new NotFoundError('Resume not found or unauthorized access.');
    }
    return resume;
};

// Updates the JSON content of a student's resume.
export const updateResumeService = async (
    id: number,
    userId: number,
    jsonData: Record<string, unknown>
) => {
    const existing = await findResumeById(id);
    if (!existing || existing.userId !== userId) {
        throw new NotFoundError('Resume not found or unauthorized access.');
    }

    // Validate incoming data against the resume schema
    const validation = resumeJsonSchema.safeParse(jsonData);
    if (!validation.success) {
        const issues = validation.error.issues
            .map((e) => `${e.path.join('.')}: ${e.message}`)
            .join(', ');
        throw new BadRequestError(`Invalid resume data: ${issues}`);
    }

    return await updateResumeJson(id, validation.data);
};

// Initiates PDF export for a resume (Asynchronous via BullMQ).
export const exportResumePdfService = async (id: number, userId: number) => {
    const resume = await findResumeById(id);
    if (!resume || resume.userId !== userId) {
        throw new NotFoundError('Resume not found or unauthorized access.');
    }

    // 2. Reset the PDF URL to null to indicate a new export is in progress
    await updateResumePdfUrl(id, ''); // Passing empty string effectively clears it

    // 3. En-queue for background PDF generation & Cloudinary upload
    const job = await addResumeJobToQueue({
        type: 'EXPORT_RESUME',
        userId,
        resumeId: id,
    });

    return {
        message:
            "PDF export has started. You'll be notified once the download link is ready.",
        resumeId: id,
        jobId: job.id,
    };
};
