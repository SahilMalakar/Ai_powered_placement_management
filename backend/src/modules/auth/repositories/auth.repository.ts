import type { Prisma } from '../../../prisma/generated/prisma/client.js';
import { prisma } from '../../../prisma/prisma.js';
import { UniqueConstraintError } from '../../../utils/errors/databaseErrors.js';

export const findUserByEmail = async (email: string) => {
    return prisma.user.findUnique({
        where: { email },
    });
};

export const createUser = async (data: { email: string; password: string }) => {
    try {
        return await prisma.user.create({ data });
    } catch (err: any) {
        console.log('error in create user', err);

        if (err.code === 'P2002') {
            throw new UniqueConstraintError('Email already exists');
        }
        throw err;
    }
};

export const findUserById = async (userId: number) => {
    try {
        return await prisma.user.findUnique({
            where: {
                id: userId,
            },
            select: {
                id: true,
                email: true,
                role: true,
                isProfileCompleted: true,
                deletedAt: true,
            },
        });
    } catch (err) {
        console.log('error in create user', err);
    }
};

export const findUserWithPasswordById = async (userId: number) => {
    return prisma.user.findUnique({
        where: {
            id: userId,
            deletedAt: null,
        },
        select: {
            password: true,
        },
    });
};

export const updateUserPassword = async (userId: number, password: string) => {
    // will add transaction to prevent race condition if multi-record updates are added

    return prisma.user.update({
        where: {
            id: userId,
        },
        data: {
            password: password,
        },
    });
};
