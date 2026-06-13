import { sendSuccess } from '../../../shared/utils/ApiResonse.js';
import { asyncHandler } from '../../../shared/utils/asyncHandler.js';
import { BadRequestError, UnauthorizedError } from '../../../shared/utils/errors/httpErrors.js';
import { HTTP_STATUS } from '../../../shared/utils/httpStatus.js';
import { exportRequestSchema } from '../../../shared/types/admin/export.js';
import { requestExportService, getExportStatusService, getExportLogsService, deleteExportLogService } from '../services/export.service.js';

export const requestExportController = asyncHandler(async (req, res) => {
    console.log("=== requestExportController HIT ===");
    console.log("req.body:", req.body);
    
    if (!req.user) {
        console.log("requestExportController: Unauthorized (no req.user)");
        throw new UnauthorizedError('Unauthorized');
    }

    // 1. Validate request body
    const result = exportRequestSchema.safeParse(req.body);
    if (!result.success) {
        const message = result.error.issues
            .map((err) => `${err.path.join('.')}: ${err.message}`)
            .join(', ');
        console.log("requestExportController: Validation failed", message);
        throw new BadRequestError(`Invalid export request: ${message}`);
    }

    // 2. Trigger the service logic
    console.log("requestExportController: Validation success, triggering service", result.data);
    const data = await requestExportService(result.data, req.user.userId);
    console.log("requestExportController: Service finished successfully. Job info:", data);

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

export const getExportLogsController = asyncHandler(async (req, res) => {
    if (!req.user) {
        throw new UnauthorizedError('Unauthorized');
    }

    const page = Number(req.query.page) || 1;
    const limit = Math.min(Number(req.query.limit) || 10, 10);

    const result = await getExportLogsService({ page, limit });

    return sendSuccess(
        res,
        result,
        'Export logs retrieved successfully',
        HTTP_STATUS.OK
    );
});

export const deleteExportLogController = asyncHandler(async (req, res) => {
    if (!req.user) {
        throw new UnauthorizedError('Unauthorized');
    }

    const id = Number(req.params.id);
    if (isNaN(id)) {
        throw new BadRequestError('Invalid export log ID');
    }

    await deleteExportLogService(id);

    return sendSuccess(
        res,
        null,
        'Export log deleted successfully',
        HTTP_STATUS.OK
    );
});

