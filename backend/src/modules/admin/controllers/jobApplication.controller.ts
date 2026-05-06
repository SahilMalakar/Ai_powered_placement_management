import { sendSuccess } from "../../../utils/ApiResonse.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { BadRequestError, UnauthorizedError } from "../../../utils/errors/httpErrors.js";
import { HTTP_STATUS } from "../../../utils/httpStatus.js";
import { getJobApplicantsService, updateApplicationStatusService } from "../services/jobApplication.service.js";
import { updateApplicationStatusSchema } from "../../../types/admin/jobApplication.js";

/**
 * Controller to fetch all applicants for a specific job.
 */
export const getJobApplicantsController = asyncHandler(async (req, res) => {
    if (!req.user) {
        throw new UnauthorizedError('Unauthorized');
    }

    const jobId = Number(req.params.id);

    const applicants = await getJobApplicantsService(jobId);

    return sendSuccess(
        res,
        applicants,
        "Job Applicants fetched successfully",
        HTTP_STATUS.OK
    );
});

/**
 * Controller to batch update application statuses.
 * Validates the request body using Zod safeParse before delegating to the service.
 */
export const updateApplicationStatusController = asyncHandler(async (req, res) => {
    if (!req.user) {
        throw new UnauthorizedError('Unauthorized');
    }

    // 1. Validate request body
    const result = updateApplicationStatusSchema.safeParse(req.body);

    if (!result.success) {
        throw new BadRequestError(result.error.issues[0]?.message ?? "Invalid request body");
    }

    // 2. Delegate to service
    const data = await updateApplicationStatusService(result.data);

    return sendSuccess(
        res,
        data,
        `${data.updated} application(s) updated to ${result.data.status}`,
        HTTP_STATUS.OK
    );
});
