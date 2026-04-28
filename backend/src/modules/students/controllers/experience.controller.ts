import { sendSuccess } from "../../../utils/ApiResonse.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { BadRequestError, UnauthorizedError } from "../../../utils/errors/httpErrors.js";
import {
    addExperienceService,
    deleteExperienceService,
    getExperiencesService,
    updateExperienceService
} from "../services/experience.service.js";
import { HTTP_STATUS } from "../../../utils/httpStatus.js";

export const addExperienceController = asyncHandler(async (req, res) => {
    if (!req.user){
        throw new UnauthorizedError("Unauthorized");
    }
    const result = await addExperienceService(req.user.userId, req.body);
    return sendSuccess(res, result, "Experience added successfully", HTTP_STATUS.CREATED);
});

export const updateExperienceController = asyncHandler(async (req, res) => {
    if (!req.user) { 
        throw new UnauthorizedError("Unauthorized");
    }
    const experienceId = Number(req.params.id);
    if (isNaN(experienceId)) {
        throw new BadRequestError("Invalid experience ID");
    }
    const result = await updateExperienceService(req.user.userId, experienceId, req.body);
    return sendSuccess(res, result, "Experience updated successfully", HTTP_STATUS.OK);
});

export const deleteExperienceController = asyncHandler(async (req, res) => {
    if (!req.user){
         throw new UnauthorizedError("Unauthorized");
    }
    const experienceId = Number(req.params.id);
    if (isNaN(experienceId)) {
        throw new BadRequestError("Invalid experience ID");
    }
    const result = await deleteExperienceService(req.user.userId, experienceId);
    return sendSuccess(res, result.message);
});

export const getExperiencesController = asyncHandler(async (req, res) => {
    if (!req.user){
         throw new UnauthorizedError("Unauthorized");
    }
    console.log(`🔍 Fetching experiences for userId: ${req.user.userId}`);
    const result = await getExperiencesService(req.user.userId);
    return sendSuccess(res, result, "Experiences fetched successfully", HTTP_STATUS.OK);
});

