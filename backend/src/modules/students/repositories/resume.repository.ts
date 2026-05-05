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
        where: { userId },
        orderBy: { version: 'desc' },
    });
};

// Fetches a resume by its unique ID.
export const findResumeById = async (id: number, tx: any = prisma) => {
    return await tx.resume.findFirst({
        where: { id },
    });
};

// Updates the JSON content of an existing resume and optionally its status.
export const updateResumeJson = async (
    id: number,
    jsonData: any,
    status?: 'GENERATING' | 'COMPLETED' | 'FAILED'
) => {
    return await prisma.resume.update({
        where: { id },
        data: {
            jsonData,
            ...(status && { status }),
        },
    });
};

// Updates only the status of a resume.
export const updateResumeStatus = async (
    id: number,
    status: 'GENERATING' | 'COMPLETED' | 'FAILED'
) => {
    return await prisma.resume.update({
        where: { id },
        data: { status },
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
        where: { userId },
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

// Permanently deletes a resume record from the database.
export const deleteResumeRecord = async (id: number) => {
    return await prisma.resume.delete({
        where: { id },
    });
};
