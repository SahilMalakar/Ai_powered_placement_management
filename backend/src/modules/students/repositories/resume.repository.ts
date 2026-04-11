import { prisma } from '../../../prisma/prisma.js';

// Saves a new resume record to the database.
export const createResumeRecord = async (
    userId: number,
    version: number,
    jsonData: any
) => {
    return await prisma.resume.create({
        data: {
            userId,
            version,
            jsonData,
        },
    });
};

// Fetches all resumes for a specific user.
export const findResumesByUserId = async (userId: number) => {
    return await prisma.resume.findMany({
        where: { userId, deletedAt: null },
        orderBy: { version: 'desc' },
    });
};

// Fetches a resume by its unique ID.
export const findResumeById = async (id: number, tx: any = prisma) => {
    return await tx.resume.findFirst({
        where: { id, deletedAt: null },
    });
};

// Updates the JSON content of an existing resume.
export const updateResumeJson = async (id: number, jsonData: any) => {
    return await prisma.resume.update({
        where: { id },
        data: {
            jsonData,
        },
    });
};

// Updates the PDF URL of a resume after successful export.
export const updateResumePdfUrl = async (id: number, pdfUrl: string) => {
    return await prisma.resume.update({
        where: { id },
        data: { pdfUrl },
    });
};

// Counts the number of non-deleted resumes for a user.
export const countUserResumes = async (userId: number) => {
    return await prisma.resume.count({
        where: { userId, deletedAt: null },
    });
};

// Retrieves the latest version number used for a student's resumes.
export const getLatestResumeVersion = async (userId: number) => {
    const latest = await prisma.resume.findFirst({
        where: { userId },
        orderBy: { version: 'desc' },
        select: { version: true },
    });
    return latest?.version || 0;
};
