import { sendSuccess } from "../../../shared/utils/ApiResonse.js";
import { asyncHandler } from "../../../shared/utils/asyncHandler.js";
import { BadRequestError, UnauthorizedError } from "../../../shared/utils/errors/httpErrors.js";
import {
    addAdditionalDetailService,
    deleteAdditionalDetailService,
    getAdditionalDetailsService,
    updateAdditionalDetailService
} from "../services/additionalDetail.service.js";
import { HTTP_STATUS } from "../../../shared/utils/httpStatus.js";

export const addAdditionalDetailController = asyncHandler(async (req, res) => {
    if (!req.user) {
        throw new UnauthorizedError("Unauthorized");
    }
    const result = await addAdditionalDetailService(req.user.userId, req.body);
    return sendSuccess(res, result, "Additional detail added successfully", HTTP_STATUS.CREATED);
});

export const updateAdditionalDetailController = asyncHandler(async (req, res) => {
    if (!req.user) {
        throw new UnauthorizedError("Unauthorized");
    }
    const detailId = Number(req.params.id);
    if (isNaN(detailId)) {
        throw new BadRequestError("Invalid additional detail ID");
    }
    const result = await updateAdditionalDetailService(req.user.userId, detailId, req.body);
    return sendSuccess(res, result, "Additional detail updated successfully", HTTP_STATUS.OK);
});

export const deleteAdditionalDetailController = asyncHandler(async (req, res) => {
    if (!req.user) {
        throw new UnauthorizedError("Unauthorized");
    }
    const detailId = Number(req.params.id);
    if (isNaN(detailId)) {
        throw new BadRequestError("Invalid additional detail ID");
    }
    const result = await deleteAdditionalDetailService(req.user.userId, detailId);
    return sendSuccess(res, result.message);
});

export const getAdditionalDetailsController = asyncHandler(async (req, res) => {
    if (!req.user) {
        throw new UnauthorizedError("Unauthorized");
    }
    const result = await getAdditionalDetailsService(req.user.userId);
    return sendSuccess(res, result, "Additional details fetched successfully", HTTP_STATUS.OK);
});
