import { asyncHandler } from '../../../utils/asyncHandler.js';
import { sendSuccess } from '../../../utils/ApiResonse.js';
import { HTTP_STATUS } from '../../../utils/httpStatus.js';
import { UnauthorizedError } from '../../../utils/errors/httpErrors.js';
import {
    generateResumeService,
    getResumeByIdService,
    getStudentResumesService,
    updateResumeService,
    exportResumePdfService,
} from '../services/resume.service.js';

// Controller for Resume operations.

// AI-Driven Resume Generation (Asynchronous).
export const generateResumeController = asyncHandler(async (req, res) => {
    if (!req.user) {
        throw new UnauthorizedError('Unauthorized access.');
    }

    const userId = req.user.userId;
    const result = await generateResumeService(userId);

    return sendSuccess(
        res,
        result,
        'Resume generation successfully queued.',
        HTTP_STATUS.ACCEPTED
    );
});

// Fetches all resumes for the authenticated student.
export const getStudentResumesController = asyncHandler(async (req, res) => {
    if (!req.user) {
        throw new UnauthorizedError('Unauthorized access.');
    }

    const userId = req.user.userId;
    const result = await getStudentResumesService(userId);

    return sendSuccess(
        res,
        result,
        'Resumes fetched successfully.',
        HTTP_STATUS.OK
    );
});

// Fetches a single resume by its unique ID.
export const getResumeByIdController = asyncHandler(async (req, res) => {
    if (!req.user) {
        throw new UnauthorizedError('Unauthorized access.');
    }

    const userId = req.user.userId;
    const resumeId = parseInt(req.params.id as string);
    const result = await getResumeByIdService(resumeId, userId);

    return sendSuccess(
        res,
        result,
        'Resume fetched successfully.',
        HTTP_STATUS.OK
    );
});

// Updates the JSON content of a student's resume.
export const updateResumeController = asyncHandler(async (req, res) => {
    if (!req.user) {
        throw new UnauthorizedError('Unauthorized access.');
    }

    const userId = req.user.userId;
    const resumeId = parseInt(req.params.id as string);
    const result = await updateResumeService(resumeId, userId, req.body);

    return sendSuccess(
        res,
        result,
        'Resume updated successfully.',
        HTTP_STATUS.OK
    );
});

// Initiates PDF export for a resume (Asynchronous).
export const exportResumeController = asyncHandler(async (req, res) => {
    if (!req.user || req.user.role !== 'STUDENT') {
        throw new UnauthorizedError(
            'Only authenticated students can perform this action.'
        );
    }

    const userId = req.user.userId;
    const resumeId = parseInt(req.params.id as string);

    const result = await exportResumePdfService(resumeId, userId);

    return sendSuccess(
        res,
        result,
        'Resume export successfully queued.',
        HTTP_STATUS.ACCEPTED
    );
});
