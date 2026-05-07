import type { Request, Response } from 'express';
import { sendSuccess } from '../../../utils/ApiResonse.js';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { HTTP_STATUS } from '../../../utils/httpStatus.js';
import {
    requestAtsAnalysisService,
    getAtsResultsService,
    getAtsStatusService,
} from '../services/ats.service.js';
import { BadRequestError } from '../../../utils/errors/httpErrors.js';
import fs from 'fs/promises';

// Controller to handle POST /students/ats/analyze
export const requestAtsAnalysisController = asyncHandler(
    async (req: Request, res: Response) => {
        if (!req.user) {
            throw new BadRequestError('Unauthorized user session.');
        }

        if (!req.file) {
            throw new BadRequestError(
                'Please upload a resume file (PDF/DOCX).'
            );
        }

        // Job Description is now optional (triggers GENERIC mode if missing)
        const { jobDescription } = req.body;

        try {
            const userId = req.user.userId;
            const filePath = req.file.path;

            const { atsResultId, message } = await requestAtsAnalysisService(
                userId,
                filePath,
                jobDescription || null
            );

            await fs.unlink(filePath);

            return sendSuccess(
                res,
                { atsResultId },
                message,
                HTTP_STATUS.ACCEPTED
            );
        } catch (error: unknown) {
            if (req.file) {
                await fs.unlink(req.file.path).catch(() => {});
            }
            throw error;
        }
    }
);

// Controller to fetch status of a specific ATS analysis.
export const getAtsStatusController = asyncHandler(
    async (req: Request, res: Response) => {
        if (!req.user) {
            throw new BadRequestError('Unauthorized user session.');
        }

        const { id } = req.params;
        const numericId = Number(id);

        if (isNaN(numericId)) {
            throw new BadRequestError('Invalid analysis ID provided.');
        }

        const status = await getAtsStatusService(numericId, req.user.userId);

        return sendSuccess(res, status, 'ATS analysis status fetched successfully.');
    }
);

// Controller to fetch paginated COMPLETED ATS analysis reports for the authenticated student.
export const getAtsResultsController = asyncHandler(
    async (req: Request, res: Response) => {
        if (!req.user) {
            throw new BadRequestError('Unauthorized user session.');
        }

        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;

        const results = await getAtsResultsService(req.user.userId, page, limit);

        return sendSuccess(res, results, 'ATS reports fetched successfully.');
    }
);


