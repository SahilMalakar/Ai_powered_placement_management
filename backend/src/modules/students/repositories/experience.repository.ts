import { prisma } from "../../../prisma/prisma.js";
import type { ExperienceInput, UpdateExperienceInput } from "../../../shared/types/students/profile.js";

export const addExperienceRepo = async (profileId: number, data: ExperienceInput) => {
    return await prisma.experience.create({
        data: {
            profileId,
            role: data.role,
            company: data.company,
            startDate: data.startDate,
            description: data.description,
            location: data.location ?? null,
            endDate: data.endDate ?? null,
            toolsUsed: data.toolsUsed ?? null,
        }
    });
};

export const updateExperienceRepo = async (id: number, data: UpdateExperienceInput) => {
    const cleanData = Object.fromEntries(
        Object.entries(data).filter(([_, v]) => v !== undefined)
    );
    return await prisma.experience.update({
        where: { id },
        data: cleanData
    }); 
};

export const deleteExperienceRepo = async (id: number) => {
    return await prisma.experience.delete({
        where: { id }
    });
};

export const getExperiencesByProfileIdRepo = async (profileId: number) => {
    return await prisma.experience.findMany({
        where: { profileId },
        orderBy: { startDate: 'desc' }
    });
};

export const findExperienceByIdRepo = async (id: number) => {
    return await prisma.experience.findUnique({
        where: { id },
        include: {
            profile: {
                select: {
                    userId: true
                }
            }
        }
    });
};
