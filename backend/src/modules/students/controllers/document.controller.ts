import type { Request, Response } from 'express';
import { asyncHandler } from '../../../shared/utils/asyncHandler.js';
import {
    getDocumentsService,
    uploadSingleDocumentService,
    deleteDocumentService,
} from '../services/document.service.js';
import { sendSuccess } from '../../../shared/utils/ApiResonse.js';
import { BadRequestError, UnauthorizedError } from '../../../shared/utils/errors/httpErrors.js';
import { HTTP_STATUS } from '../../../shared/utils/httpStatus.js';

/**
 * Controller to fetch all documents for the logged-in student.
 */
export const getDocumentsController = asyncHandler(
    async (req: Request, res: Response) => {
        if (!req.user) {
            throw new UnauthorizedError('Unauthorized');
        }

        const documents = await getDocumentsService(req.user.userId);
        return sendSuccess(res, documents, 'Documents fetched successfully.');
    }
);

/**
 * Controller to handle single document upload.
 */
export const uploadDocumentController = asyncHandler(
    async (req: Request, res: Response) => {
        if (!req.user) {
            throw new UnauthorizedError('Unauthorized');
        }

        // Multer file presence check
        if (!req.file) {
            throw new BadRequestError('No document file provided.');
        }

        // Delegate to service (body is already validated by Zod middleware)
        const result = await uploadSingleDocumentService(
            req.user.userId,
            req.body,
            req.file
        );

        return sendSuccess(
            res,
            result,
            'Document upload queued for processing.',
            HTTP_STATUS.ACCEPTED
        );
    }
);

/**
 * Controller to handle deletion of a specific document.
 */
export const deleteDocumentController = asyncHandler(
    async (req: Request, res: Response) => {
        if (!req.user) {
            throw new UnauthorizedError('Unauthorized');
        }

        const { id } = req.params;
        const numericId = parseInt(id as string, 10);
        if (isNaN(numericId)) {
            throw new BadRequestError('Invalid document ID format.');
        }

        const result = await deleteDocumentService(req.user.userId, numericId);
        return sendSuccess(res, result, 'Document removed successfully.');
    }
);
