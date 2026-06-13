import { sendSuccess } from "../../../shared/utils/ApiResonse.js";
import { asyncHandler } from "../../../shared/utils/asyncHandler.js";
import { BadRequestError, UnauthorizedError } from "../../../shared/utils/errors/httpErrors.js";
import {
    addSkillService,
    deleteSkillService,
    getSkillsService,
    updateSkillService
} from "../services/skill.service.js";
import { HTTP_STATUS } from "../../../shared/utils/httpStatus.js";

export const addSkillController = asyncHandler(async (req, res) => {
    if (!req.user) {
        throw new UnauthorizedError("Unauthorized");
    }
    const result = await addSkillService(req.user.userId, req.body);
    return sendSuccess(res, result, "Skill added successfully", HTTP_STATUS.CREATED);
});

export const updateSkillController = asyncHandler(async (req, res) => {
    if (!req.user) {
        throw new UnauthorizedError("Unauthorized");
    }
    const skillId = Number(req.params.id);
    if (isNaN(skillId)) {
        throw new BadRequestError("Invalid skill ID");
    }
    const result = await updateSkillService(req.user.userId, skillId, req.body);
    return sendSuccess(res, result, "Skill updated successfully", HTTP_STATUS.OK);
});

export const deleteSkillController = asyncHandler(async (req, res) => {
    if (!req.user) {
        throw new UnauthorizedError("Unauthorized");
    }
    const skillId = Number(req.params.id);
    if (isNaN(skillId)) {
        throw new BadRequestError("Invalid skill ID");
    }
    const result = await deleteSkillService(req.user.userId, skillId);
    return sendSuccess(res, result.message);
});

export const getSkillsController = asyncHandler(async (req, res) => {
    if (!req.user) {
        throw new UnauthorizedError("Unauthorized");
    }
    const result = await getSkillsService(req.user.userId);
    return sendSuccess(res, result, "Skills fetched successfully", HTTP_STATUS.OK);
});
