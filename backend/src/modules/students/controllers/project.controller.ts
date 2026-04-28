import { sendSuccess } from "../../../utils/ApiResonse.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { BadRequestError, UnauthorizedError } from "../../../utils/errors/httpErrors.js";
import {
    addProjectService,
    deleteProjectService,
    getProjectsService,
    updateProjectService
} from "../services/project.service.js";
import { HTTP_STATUS } from "../../../utils/httpStatus.js";

export const addProjectController = asyncHandler(async (req, res) => {
    if (!req.user) {
        throw new UnauthorizedError("Unauthorized");
    }
    const result = await addProjectService(req.user.userId, req.body);
    return sendSuccess(res, result, "Project added successfully", HTTP_STATUS.CREATED);
});

export const updateProjectController = asyncHandler(async (req, res) => {
    if (!req.user) { 
        throw new UnauthorizedError("Unauthorized");
    }
    const projectId = Number(req.params.id);
    if (isNaN(projectId)) {
        throw new BadRequestError("Invalid project ID");
    }
    const result = await updateProjectService(req.user.userId, projectId, req.body);
    return sendSuccess(res, result, "Project updated successfully", HTTP_STATUS.OK);
});

export const deleteProjectController = asyncHandler(async (req, res) => {
    if (!req.user) {
         throw new UnauthorizedError("Unauthorized");
    }
    const projectId = Number(req.params.id);
    if (isNaN(projectId)) {
        throw new BadRequestError("Invalid project ID");
    }
    const result = await deleteProjectService(req.user.userId, projectId);
    return sendSuccess(res, result.message);
});

export const getProjectsController = asyncHandler(async (req, res) => {
    if (!req.user) {
         throw new UnauthorizedError("Unauthorized");
    }
    const result = await getProjectsService(req.user.userId);
    return sendSuccess(res, result, "Projects fetched successfully", HTTP_STATUS.OK);
});
