import { applyToJobService, getApplicationService } from '../services/application.service.js';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { NotFoundError } from '../../../utils/errors/httpErrors.js';

/**
 * Controller to handle student job applications.
 * (Moved back to Students module as requested).
 */
export const applyToJobController = asyncHandler(async (req, res) => {
    const userId = req.user!.userId;
    const jobId = parseInt(req.params.jobId as string);

    const application = await applyToJobService(userId, jobId);

    res.status(201).json({
        success: true,
        message: 'Application submitted successfully.',
        data: application,
    });
})



export const getApplicationsController = asyncHandler(async (req, res) => {
    const userId = req.user!.userId;
    const application = await getApplicationService(userId);
    return res.status(200).json({
        success: true,
        message: 'Applications fetched successfully.',
        data: application,
    });
})