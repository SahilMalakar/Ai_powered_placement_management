import { prisma } from '../../../prisma/prisma.js';

export const createResumeRepository = async (userId: number, version: number) => {
    console.log(`[Optimize Resume Repository] Creating new resume entry for userId: ${userId}, version: ${version}`);
    try {
        const resume = await prisma.resume.create({
            data: { userId, version, jsonData: {}, status: 'GENERATING' },
        });
        console.log(`[Optimize Resume Repository] Created resume entry ID: ${resume.id}`);
        return resume;
    } catch (error) {
        console.error(`[Optimize Resume Repository] Error in createResumeRepository for userId ${userId}:`, error);
        throw error;
    }
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
    console.log(`[Optimize Resume Repository] Updating resume ID: ${id} with fields:`, Object.keys(data));
    try {
        const result = await prisma.resume.update({ where: { id }, data });
        console.log(`[Optimize Resume Repository] Successfully updated resume ID: ${id}. Status is now: ${result.status}`);
        return result;
    } catch (error) {
        console.error(`[Optimize Resume Repository] Error updating resume ID ${id}:`, error);
        throw error;
    }
};

export const softDeleteResumeRepository = async (id: number, userId: number) => {
    return await prisma.resume.updateMany({
        where: { id, userId },
        data: { deletedAt: new Date() },
    });
};
