import type { ATSAnalysisType, ATSStatus } from '../../../prisma/generated/prisma/enums.js';
import { prisma } from '../../../prisma/prisma.js';
import type { ATSResultType } from '../../../shared/types/students/ats.js';

// Saves a new ATS analysis result to the database in PENDING status.
export const createAtsResult = async (
    userId: number,
    jobDescriptionText: string | null,
    analysisMode: ATSAnalysisType
) => {
    return await prisma.aTSResult.create({
        data: {
            userId,
            jobDescriptionText,
            analysisMode,
            status: 'PENDING',
            score: 0, // Placeholder
        },
    });
};

// Updates an existing ATS analysis result.
export const updateAtsResult = async (
    id: number,
    data: Partial<ATSResultType> & { status?: ATSStatus }
) => {
    return await prisma.aTSResult.update({
        where: { id },
        data,
    });
};

// Fetches an ATS result by ID, scoped to user.
export const findAtsResultById = async (id: number, userId: number) => {
    return await prisma.aTSResult.findFirst({
        where: {
            id,
            userId,
            deletedAt: null,
        },
    });
};

// Counts the number of non-failed ATS analyses a user has done today.
export const countAtsAnalysesToday = async (userId: number) => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    return await prisma.aTSResult.count({
        where: {
            userId,
            status: { not: 'FAILED' },
            createdAt: {
                gte: startOfDay,
            },
        },
    });
};

// Deletes an ATS result (used for cleanup if queueing fails).
export const deleteAtsResult = async (id: number) => {
    return await prisma.aTSResult.delete({
        where: { id },
    });
};

// Fetches paginated COMPLETED ATS analysis results for a specific user.
export const findAtsResultsByUserId = async (
    userId: number,
    page: number = 1,
    limit: number = 10
) => {
    const skip = (page - 1) * limit;

    const [results, total] = await Promise.all([
        prisma.aTSResult.findMany({
            where: {
                userId,
                status: 'COMPLETED',
                deletedAt: null,
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
        }),
        prisma.aTSResult.count({
            where: {
                userId,
                status: 'COMPLETED',
                deletedAt: null,
            },
        }),
    ]);

    return { results, total };
};
