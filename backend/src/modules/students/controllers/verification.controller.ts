import type { Request, Response } from 'express';
import { initiateVerificationService } from '../services/verification.service.js';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { sendSuccess } from '../../../utils/ApiResonse.js';
import { BadRequestError } from '../../../utils/errors/httpErrors.js';

/**
 * Controller to handle the initiation of document verification.
 */
export const initiateVerificationController = asyncHandler(
    async (req: Request, res: Response) => {
        if (!req.user) {
            throw new BadRequestError('Unauthorized user session.');
        }

        const userId = req.user.userId;

        const result = await initiateVerificationService(userId);

        return sendSuccess(res, result, 'Verification initiated successfully.');
    }
);
