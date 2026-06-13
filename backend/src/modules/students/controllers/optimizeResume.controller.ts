import type { Request, Response } from 'express';
import { asyncHandler } from '../../../shared/utils/asyncHandler.js';
import { sendSuccess } from '../../../shared/utils/ApiResonse.js';
import { BadRequestError } from '../../../shared/utils/errors/httpErrors.js';
import {
    requestOptimizeResumeService,
    getResumeByIdService,
    getAllResumesService,
    deleteResumeService,
    getOptimizeResumeJobStatusService,
} from '../services/optimizeResume.service.js';
import mammoth from 'mammoth';
import { extractTextFromPdfBuffer } from '../../../shared/utils/fileHandler/pdfParser.js';

export const requestOptimizeResume = asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) throw new BadRequestError('Resume file is required');

    const mime = req.file.mimetype;
    const ext = req.file.originalname.split('.').pop()?.toLowerCase();
    let rawText: string;

    if (mime === 'application/pdf') {
        rawText = await extractTextFromPdfBuffer(req.file.buffer);
    } else if (mime.includes('word') || ext === 'docx') {
        const result = await mammoth.extractRawText({ buffer: req.file.buffer });
        rawText = result.value;
    } else {
        throw new BadRequestError('Only PDF and DOCX files are supported');
    }

    if (!rawText || rawText.trim().length < 100) {
        throw new BadRequestError('Could not extract sufficient text from file');
    }

    const data = await requestOptimizeResumeService(req.user!.userId, rawText);
    return sendSuccess(res, data, 'Resume optimization queued', 202);
});

export const getResumeById = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (isNaN(id)) throw new BadRequestError('Invalid resume ID');
    const resume = await getResumeByIdService(id, req.user!.userId);
    return sendSuccess(res, resume, 'Resume fetched successfully');
});

export const getAllResumes = asyncHandler(async (req: Request, res: Response) => {
    const resumes = await getAllResumesService(req.user!.userId);
    return sendSuccess(res, resumes, 'Resumes fetched successfully');
});

export const deleteResume = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (isNaN(id)) throw new BadRequestError('Invalid resume ID');
    await deleteResumeService(id, req.user!.userId);
    return sendSuccess(res, null, 'Resume deleted successfully');
});

export const getOptimizeResumeJobStatus = asyncHandler(async (req: Request, res: Response) => {
    const jobId = req.params.jobId;
    if (!jobId || typeof jobId !== 'string') throw new BadRequestError('Job ID is required and must be a string');

    const result = await getOptimizeResumeJobStatusService(jobId);
    return sendSuccess(res, result, 'Resume optimization job status fetched successfully');
});

