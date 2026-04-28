import { sendSuccess } from "../../../utils/ApiResonse.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { BadRequestError, UnauthorizedError } from "../../../utils/errors/httpErrors.js";
import {
    addSocialLinkService,
    deleteSocialLinkService,
    getSocialLinksService,
    updateSocialLinkService
} from "../services/socialLink.service.js";
import { HTTP_STATUS } from "../../../utils/httpStatus.js";

export const addSocialLinkController = asyncHandler(async (req, res) => {
    if (!req.user) {
        throw new UnauthorizedError("Unauthorized");
    }
    const result = await addSocialLinkService(req.user.userId, req.body);
    return sendSuccess(res, result, "Social link added successfully", HTTP_STATUS.CREATED);
});

export const updateSocialLinkController = asyncHandler(async (req, res) => {
    if (!req.user) { 
        throw new UnauthorizedError("Unauthorized");
    }
    const linkId = Number(req.params.id);
    if (isNaN(linkId)) {
        throw new BadRequestError("Invalid social link ID");
    }
    const result = await updateSocialLinkService(req.user.userId, linkId, req.body);
    return sendSuccess(res, result, "Social link updated successfully", HTTP_STATUS.OK);
});

export const deleteSocialLinkController = asyncHandler(async (req, res) => {
    if (!req.user) {
         throw new UnauthorizedError("Unauthorized");
    }
    const linkId = Number(req.params.id);
    if (isNaN(linkId)) {
        throw new BadRequestError("Invalid social link ID");
    }
    const result = await deleteSocialLinkService(req.user.userId, linkId);
    return sendSuccess(res, result.message);
});

export const getSocialLinksController = asyncHandler(async (req, res) => {
    if (!req.user) {
         throw new UnauthorizedError("Unauthorized");
    }
    const result = await getSocialLinksService(req.user.userId);
    return sendSuccess(res, result, "Social links fetched successfully", HTTP_STATUS.OK);
});
