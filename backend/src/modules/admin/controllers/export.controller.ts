import { sendSuccess } from '../../../shared/utils/ApiResonse.js';
import { asyncHandler } from '../../../shared/utils/asyncHandler.js';
import { BadRequestError, UnauthorizedError } from '../../../shared/utils/errors/httpErrors.js';
import { HTTP_STATUS } from '../../../shared/utils/httpStatus.js';
import { exportRequestSchema } from '../../../shared/types/admin/export.js';
import { requestExportService, getExportStatusService } from '../services/export.service.js';

export const requestExportController = asyncHandler(async (req, res) => {
    if (!req.user) {
        throw new UnauthorizedError('Unauthorized');
    }

    // 1. Validate request body
    const result = exportRequestSchema.safeParse(req.body);
    if (!result.success) {
        const message = result.error.issues
            .map((err) => `${err.path.join('.')}: ${err.message}`)
            .join(', ');
        throw new BadRequestError(`Invalid export request: ${message}`);
    }

    // 2. Trigger the service logic
    const data = await requestExportService(result.data, req.user.userId);

    return sendSuccess(
        res,
        data,
        'Export job queued successfully',
        HTTP_STATUS.ACCEPTED
    );
});

export const getExportStatusController = asyncHandler(async (req, res) => {
    if (!req.user) {
        throw new UnauthorizedError('Unauthorized');
    }

    const { jobId } = req.params;
    if (!jobId) {
        throw new BadRequestError('Job ID is required');
    }

    // Trigger the service logic
    const jobResult = await getExportStatusService(String(jobId));

    return sendSuccess(
        res,
        jobResult,
        'Export job status retrieved successfully',
        HTTP_STATUS.OK
    );
});
