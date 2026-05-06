import { getFullStudentData } from '../repositories/profile.repository.js';
import {
    countUserResumes,
    findResumesByUserId,
    findResumeById,
    updateResumeJson,
    updateResumePdfUrl,
    createResumeRecord,
    getLatestResumeVersion,
    deleteResumeRecord,
} from '../repositories/resume.repository.js';
import { deleteFromCloudinary } from '../../../utils/fileHandler/cloudinary.js';
import { addResumeJobToQueue } from '../../../queues/resume.queue.js';
import { resumeJsonSchema } from '../../../types/students/resume.js';
import {
    BadRequestError,
    NotFoundError,
    ConflictError,
    InternalServerError,
} from '../../../utils/errors/httpErrors.js';

const MAX_RESUMES = 5;

// AI-Driven Resume Generation (Asynchronous via BullMQ).
export const generateResumeService = async (userId: number) => {
    // 1. Enforce business limit (max 5 resumes per student)
    const resumes = await findResumesByUserId(userId);
    if (resumes.length >= MAX_RESUMES) {
        throw new BadRequestError(
            `Maximum limit of ${MAX_RESUMES} resumes reached. Please delete an old version to generate a new one.`
        );
    }

    // 2. Prevent concurrent generations
    const isAlreadyGenerating = resumes.some(r => r.status === 'GENERATING');
    if (isAlreadyGenerating) {
        throw new ConflictError(
            'A resume is already being generated. Please wait for it to complete.'
        );
    }

    // 2. Fetch student's comprehensive profile data to ensure it exists
    const fullProfile = await getFullStudentData(userId);
    if (!fullProfile?.profile) {
        throw new NotFoundError(
            'Student profile not found. Please complete your profile before generating a resume.'
        );
    }

    // 3. Status Guard: Profile must be completed and verified
    if (!fullProfile.isProfileCompleted) {
        throw new BadRequestError(
            'Please complete your profile before generating a resume.'
        );
    }

    if (fullProfile.profile.verificationStatus !== 'VERIFIED') {
        const status = fullProfile.profile.verificationStatus.toLowerCase().replace('_', ' ');
        throw new BadRequestError(
            `Your profile is currently ${status}. Only verified students can generate resumes.`
        );
    }

    // 4. Validation Guard: Ensure mandatory sections are populated for a professional resume
    const profile = fullProfile.profile;
    const missingSections: string[] = [];

    if (!profile.skills || profile.skills.length === 0)
        missingSections.push('Technical Skills');

    // Ensure student has either Projects or Work Experience
    const hasProjects = profile.projects && profile.projects.length > 0;
    const hasExperience = (profile as any).experiences && (profile as any).experiences.length > 0;

    if (!hasProjects && !hasExperience) {
        missingSections.push('Projects or Work Experience');
    }

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

    // 5. Create a placeholder resume record immediately to get the resumeId
    let resume;
    try {
        const latestVersion = await getLatestResumeVersion(userId);
        const newVersion = latestVersion + 1;
        resume = await createResumeRecord(userId, newVersion, {}); // Empty JSON initially
    } catch (error: any) {
        if (error.code === 'P2002') {
            throw new ConflictError('A generation request is already in progress or version conflict occurred. Please retry.');
        }
        throw error;
    }

    // 6. En-queue for background AI analysis
    console.log(`[Resume Service] En-queueing GENERATE_RESUME for user ${userId}. Profile data keys:`, Object.keys(fullProfile));

    const job = await addResumeJobToQueue({
        type: 'GENERATE_RESUME',
        userId,
        resumeId: resume.id,
        profileData: fullProfile as unknown as Record<string, unknown>,
        branch: fullProfile.profile.branch,
    }, `generate-resume-${userId}-${resume.version}`);

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
    // 1. Fetch Resume and check status
    const resume = await findResumeById(id);
    if (!resume || resume.userId !== userId) {
        throw new NotFoundError('Resume not found or unauthorized access.');
    }

    if (resume.status === 'GENERATING') {
        throw new BadRequestError(
            'Resume is still being generated. Please wait until it is completed before exporting.'
        );
    }

    if (resume.status === 'FAILED') {
        throw new BadRequestError(
            'Resume generation failed. Please try generating a new one.'
        );
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

// Deletes a resume record and its associated PDF from Cloudinary.
export const deleteResumeService = async (id: number, userId: number) => {
    const resume = await findResumeById(id);
    if (!resume || resume.userId !== userId) {
        throw new NotFoundError('Resume not found or unauthorized access.');
    }

    // If there's an exported PDF, delete it from Cloudinary
    if (resume.pdfUrl) {
        try {
            // Extract public ID from Cloudinary URL
            // Format: https://res.cloudinary.com/cloud_name/image/upload/v1234567/folder/public_id.ext
            const urlParts = resume.pdfUrl.split('/');
            const fileNameWithExt = urlParts.pop() || '';
            const folder = urlParts.pop() || '';
            const publicId = `${folder}/${fileNameWithExt.split('.')[0]}`;

            await deleteFromCloudinary(publicId);
        } catch (error) {
            console.error('[Delete Resume Service] Cloudinary deletion failed:', error);
            // We continue even if Cloudinary fails to ensure DB consistency
        }
    }

    return await deleteResumeRecord(id);
};
