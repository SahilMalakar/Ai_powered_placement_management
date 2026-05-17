import { prisma } from '../../../prisma/prisma.js';
import type { Role } from '../../../prisma/generated/prisma/enums.js';

export const findAllAdmins = async () => {
    return prisma.user.findMany({
        where: {
            role: {
                in: ['ADMIN', 'SUPER_ADMIN'],
            },
        },
        select: {
            id: true,
            email: true,
            role: true,
            createdAt: true,
            deletedAt: true,
        },
        orderBy: {
            createdAt: 'desc',
        },
    });
};

export const findAdminById = async (id: number) => {
    return prisma.user.findUnique({
        where: {
            id,
            deletedAt: null,
        },
        select: {
            id: true,
            email: true,
            role: true,
            createdAt: true,
        },
    });
};

export const findUserByEmail = async (email: string) => {
    return prisma.user.findUnique({
        where: {
            email,
        }
    });
};

export const createAdminUser = async (data: {
    email: string;
    password: string;
    role: Role;
}) => {
    return prisma.user.create({
        data: {
            email: data.email,
            password: data.password,
            role: data.role,
        },
        select: {
            id: true,
            email: true,
            role: true,
            createdAt: true,
        },
    });
};

export const updateAdminUserRole = async (id: number, role: Role) => {
    return prisma.user.update({
        where: { id },
        data: { role },
        select: {
            id: true,
            email: true,
            role: true,
            createdAt: true,
        },
    });
};

export const deleteAdminUser = async (id: number) => {
    return prisma.user.update({
        where: { id },
        data: { deletedAt: new Date() },
        select: {
            id: true,
            email: true,
        },
    });
};

export const findUserByIdIncludingDeleted = async (id: number) => {
    return prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            email: true,
            role: true,
            deletedAt: true,
            createdAt: true,
        },
    });
};

export const reactivateAdminUser = async (id: number, data: { password?: string; role?: Role }) => {
    const updateData: Record<string, any> = {
        deletedAt: null,
    };
    if (data.password) updateData.password = data.password;
    if (data.role) updateData.role = data.role;

    return prisma.user.update({
        where: { id },
        data: updateData,
        select: {
            id: true,
            email: true,
            role: true,
            createdAt: true,
        },
    });
};
