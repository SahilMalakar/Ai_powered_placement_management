import { sendSuccess } from "../../../utils/ApiResonse.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { UnauthorizedError } from "../../../utils/errors/httpErrors.js";
import { HTTP_STATUS } from "../../../utils/httpStatus.js";
import { createJobService, updateJobByIdService, activateJobService, deactivateJobService } from "../services/job.service.js";

export const createJobController = asyncHandler(async(req,res)=>{
    if (!req.user) {
        throw new UnauthorizedError("Unauthorized")
    }

    // Securely inject the logged-in admin's ID
    const jobPayload = {
        ...req.body,
        createdBy: {
            connect: {
                id: req.user.userId
            }
        }
    }

    const job = await createJobService(jobPayload);
    return sendSuccess(
        res,
        job,
        "Job created successfully",
        HTTP_STATUS.CREATED
    );
})

export const updateJobByIdController = asyncHandler(async(req,res)=>{
    if (!req.user) {
        throw new UnauthorizedError("Unauthorized")
    }
    // Get the validated data from the body
    const jobData = req.body;
    // Securely inject the logged-in admin's ID
    const jobPayload = {
        ...jobData,
        createdBy: {
            connect: {
                id: req.user.userId
            }
        }
    }

    const job = await updateJobByIdService(Number(req.params.id),jobPayload);
    return sendSuccess(
        res,
        job,
        "Job updated successfully",
        HTTP_STATUS.OK
    );
})

export const activateJobController = asyncHandler(async(req,res)=>{
    if (!req.user) {
        throw new UnauthorizedError("Unauthorized")
    }

    const jobId = Number(req.params.id);
    const job = await activateJobService(jobId);

    return sendSuccess(
        res,
        job,
        "Job activated and notifications dispatched to students successfully",
        HTTP_STATUS.OK
    );
})

export const deactivateJobController = asyncHandler(async(req,res)=>{
    if (!req.user) {
        throw new UnauthorizedError("Unauthorized")
    }

    const jobId = Number(req.params.id);
    const job = await deactivateJobService(jobId);

    return sendSuccess(
        res,
        job,
        "Job deactivated successfully",
        HTTP_STATUS.OK
    );
})