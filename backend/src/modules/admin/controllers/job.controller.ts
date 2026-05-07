import { sendSuccess } from '../../../utils/ApiResonse.js';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { BadRequestError, UnauthorizedError } from '../../../utils/errors/httpErrors.js';
import { HTTP_STATUS } from '../../../utils/httpStatus.js';
import {
    createJobService,
    updateJobByIdService,
    activateJobService,
    deactivateJobService,
    getAllJobsService,
    getJobByIdService,
    deleteJobService,
    getApplicationDashboardService,
} from '../services/job.service.js';
import { getAllJobsQuerySchema } from '../../../types/admin/job.js';

export const createJobController = asyncHandler(async (req, res) => {
    if (!req.user) {
        throw new UnauthorizedError('Unauthorized');
    }

    // Securely inject the logged-in admin's ID
    const jobPayload = {
        ...req.body,
        createdBy: {
            connect: {
                id: req.user.userId,
            },
        },
    };

    const job = await createJobService(jobPayload);
    return sendSuccess(
        res,
        job,
        'Job created successfully',
        HTTP_STATUS.CREATED
    );
});

export const updateJobByIdController = asyncHandler(async (req, res) => {
    if (!req.user) {
        throw new UnauthorizedError('Unauthorized');
    }
    // Get the validated data from the body
    const jobData = req.body;
    // Securely inject the logged-in admin's ID
    const jobPayload = {
        ...jobData,
        createdBy: {
            connect: {
                id: req.user.userId,
            },
        },
    };

    const job = await updateJobByIdService(Number(req.params.id), jobPayload);
    return sendSuccess(res, job, 'Job updated successfully', HTTP_STATUS.OK);
});

export const activateJobController = asyncHandler(async (req, res) => {
    if (!req.user) {
        throw new UnauthorizedError('Unauthorized');
    }

    const jobId = Number(req.params.id);
    const job = await activateJobService(jobId);

    return sendSuccess(
        res,
        job,
        'Job activated and notifications dispatched to students successfully',
        HTTP_STATUS.OK
    );
});

export const deactivateJobController = asyncHandler(async (req, res) => {
    if (!req.user) {
        throw new UnauthorizedError('Unauthorized');
    }

    const jobId = Number(req.params.id);
    const job = await deactivateJobService(jobId);

    return sendSuccess(
        res,
        job,
        'Job deactivated successfully',
        HTTP_STATUS.OK
    );
});

export const getAllJobsController = asyncHandler(async (req, res) => {
    if (!req.user) {
        throw new UnauthorizedError('Unauthorized');
    }

    // Use safeParse to handle validation errors gracefully
    const result = getAllJobsQuerySchema.safeParse(req.query);

    if (!result.success) {
        const message = result.error.issues.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
        throw new BadRequestError(`Invalid query parameters: ${message}`);
    }

    const filters = result.data;

    const jobsData = await getAllJobsService(filters, req.user.role);
    return sendSuccess(
        res,
        jobsData,
        'Jobs fetched successfully',
        HTTP_STATUS.OK
    );
});

export const getJobByIdController = asyncHandler(async (req, res) => {
    if (!req.user) {
        throw new UnauthorizedError('Unauthorized');
    }

    const jobId = Number(req.params.id);
    const job = await getJobByIdService(jobId, req.user.role);

    return sendSuccess(res, job, 'Job fetched successfully', HTTP_STATUS.OK);
});

export const deleteJobByIdController = asyncHandler(async (req, res) => {
    if (!req.user) {
        throw new UnauthorizedError('Unauthorized');
    }

    const jobId = Number(req.params.id);
    await deleteJobService(jobId);

    return sendSuccess(res, null, 'Job deleted successfully', HTTP_STATUS.OK);
});

export const getApplicationDashboardController = asyncHandler(async (req, res) => {
    if (!req.user) {
        throw new UnauthorizedError('Unauthorized');
    }
    const data = await getApplicationDashboardService();
    return sendSuccess(res, data, 'Application dashboard fetched successfully', HTTP_STATUS.OK);
});
