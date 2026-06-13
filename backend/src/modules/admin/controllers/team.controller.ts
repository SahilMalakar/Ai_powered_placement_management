import { sendSuccess } from '../../../shared/utils/ApiResonse.js';
import { asyncHandler } from '../../../shared/utils/asyncHandler.js';
import { UnauthorizedError } from '../../../shared/utils/errors/httpErrors.js';
import { HTTP_STATUS } from '../../../shared/utils/httpStatus.js';
import {
    getAllAdminsService,
    createAdminService,
    updateAdminRoleService,
    deleteAdminService,
    reactivateAdminService,
} from '../services/team.service.js';

export const getAllAdminsController = asyncHandler(async (req, res) => {
    if (!req.user) {
        throw new UnauthorizedError('Unauthorized');
    }

    const admins = await getAllAdminsService();
    return sendSuccess(
        res,
        admins,
        'Admin team members fetched successfully',
        HTTP_STATUS.OK
    );
});

export const createAdminController = asyncHandler(async (req, res) => {
    if (!req.user) {
        throw new UnauthorizedError('Unauthorized');
    }

    const admin = await createAdminService(req.body);
    return sendSuccess(
        res,
        admin,
        'Admin team member registered successfully',
        HTTP_STATUS.CREATED
    );
});

export const reactivateAdminController = asyncHandler(async (req, res) => {
    if (!req.user) {
        throw new UnauthorizedError('Unauthorized');
    }

    const targetId = Number(req.params.id);
    const reactivatedAdmin = await reactivateAdminService(targetId, req.body);
    return sendSuccess(
        res,
        reactivatedAdmin,
        'Admin team member reactivated successfully',
        HTTP_STATUS.OK
    );
});

export const updateAdminRoleController = asyncHandler(async (req, res) => {
    if (!req.user) {
        throw new UnauthorizedError('Unauthorized');
    }

    const targetId = Number(req.params.id);
    const updatedAdmin = await updateAdminRoleService(targetId, req.body, req.user.userId);
    return sendSuccess(
        res,
        updatedAdmin,
        'Admin role updated successfully',
        HTTP_STATUS.OK
    );
});

export const deleteAdminController = asyncHandler(async (req, res) => {
    if (!req.user) {
        throw new UnauthorizedError('Unauthorized');
    }

    const targetId = Number(req.params.id);
    await deleteAdminService(targetId, req.user.userId);
    return sendSuccess(
        res,
        null,
        'Admin team member deactivated successfully',
        HTTP_STATUS.OK
    );
});
