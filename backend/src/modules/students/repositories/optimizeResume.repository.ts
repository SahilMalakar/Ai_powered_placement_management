import { prisma } from '../../../prisma/prisma.js';

export const createResumeRepository = async (userId: number, version: number) => {
    return await prisma.resume.create({
        data: { userId, version, jsonData: {}, status: 'GENERATING' },
    });
};

export const getNextVersionRepository = async (userId: number): Promise<number> => {
    const count = await prisma.resume.count({ where: { userId } });
    return count + 1;
};

export const getResumeByIdRepository = async (id: number, userId: number) => {
    return await prisma.resume.findFirst({
        where: { id, userId, deletedAt: null },
    });
};

export const getAllResumesRepository = async (userId: number) => {
    return await prisma.resume.findMany({
        where: { userId, deletedAt: null },
        orderBy: { createdAt: 'desc' },
        select: { id: true, version: true, status: true, pdfUrl: true, createdAt: true },
    });
};

export const updateResumeRepository = async (
    id: number,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: Record<string, any>
) => {
    return await prisma.resume.update({ where: { id }, data });
};

export const softDeleteResumeRepository = async (id: number, userId: number) => {
    return await prisma.resume.updateMany({
        where: { id, userId },
        data: { deletedAt: new Date() },
    });
};
