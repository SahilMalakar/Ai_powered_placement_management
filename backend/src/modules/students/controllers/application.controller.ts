import type { Request, Response, NextFunction } from 'express';
import { applyToJobService } from '../services/application.service.js';

/**
 * Controller to handle student job applications.
 * (Moved back to Students module as requested).
 */
export const applyToJobController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = req.user!.userId;
        const jobId = parseInt(req.params.jobId as string);

        const application = await applyToJobService(userId, jobId);

        res.status(201).json({
            success: true,
            message: 'Application submitted successfully.',
            data: application,
        });
    } catch (error) {
        next(error);
    }
};
