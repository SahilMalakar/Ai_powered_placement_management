import {
    findAllAdmins,
    findAdminById,
    findUserByEmail,
    createAdminUser,
    updateAdminUserRole,
    deleteAdminUser,
    reactivateAdminUser,
    findUserByIdIncludingDeleted,
} from '../repositories/team.repository.js';
import { BadRequestError, NotFoundError } from '../../../shared/utils/errors/httpErrors.js';
import type { CreateAdminInput, UpdateAdminRoleInput, ReactivateAdminInput } from '../../../shared/types/admin/team.js';
import type { Role } from '../../../prisma/generated/prisma/enums.js';
import bcrypt from 'bcrypt';

export const getAllAdminsService = async () => {
    return findAllAdmins();
};

export const createAdminService = async (data: CreateAdminInput) => {
    const isUserExist = await findUserByEmail(data.email);

    if (isUserExist) {
        if (isUserExist.deletedAt) {
            throw new BadRequestError('Email belongs to a deactivated administrator. Please reactivate instead.');
        }
        throw new BadRequestError('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    return createAdminUser({
        email: data.email,
        password: hashedPassword,
        role: data.role as Role,
    });
};

export const reactivateAdminService = async (targetId: number, data: ReactivateAdminInput) => {
    const targetUser = await findUserByIdIncludingDeleted(targetId);
    if (!targetUser) {
        throw new NotFoundError('Admin user not found');
    }

    if (!targetUser.deletedAt) {
        throw new BadRequestError('Admin user is already active');
    }

    const updatePayload: { password?: string; role?: Role } = {};
    if (data.password) {
        updatePayload.password = await bcrypt.hash(data.password, 10);
    }
    if (data.role) {
        updatePayload.role = data.role as Role;
    }

    return reactivateAdminUser(targetId, updatePayload);
};

export const updateAdminRoleService = async (
    targetId: number,
    data: UpdateAdminRoleInput,
    requesterId: number
) => {
    if (targetId === requesterId) {
        throw new BadRequestError('You cannot modify your own administrative role');
    }

    const targetUser = await findAdminById(targetId);
    if (!targetUser) {
        throw new NotFoundError('Admin user not found');
    }

    return updateAdminUserRole(targetId, data.role as Role);
};

export const deleteAdminService = async (targetId: number, requesterId: number) => {
    if (targetId === requesterId) {
        throw new BadRequestError('You cannot delete your own account');
    }

    const targetUser = await findAdminById(targetId);
    if (!targetUser) {
        throw new NotFoundError('Admin user not found');
    }

    return deleteAdminUser(targetId);
};
