import { sendSuccess } from "../../../utils/ApiResonse.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { UnauthorizedError } from "../../../utils/errors/httpErrors.js";
import { HTTP_STATUS } from "../../../utils/httpStatus.js";
import { getJobApplicantsService } from "../services/application.service.js";

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
