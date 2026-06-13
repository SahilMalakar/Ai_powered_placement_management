import { prisma } from "../../../prisma/prisma.js";
import type { AdditionalDetailInput, UpdateAdditionalDetailInput } from "../../../shared/types/students/profile.js";

export const addAdditionalDetailRepo = async (profileId: number, data: AdditionalDetailInput) => {
    return await prisma.additionalDetail.create({
        data: {
            profileId,
            title: data.title,
            description: data.description,
            date: data.date ?? null,
        }
    });
};

export const updateAdditionalDetailRepo = async (id: number, data: UpdateAdditionalDetailInput) => {
    const cleanData = Object.fromEntries(
        Object.entries(data).filter(([_, v]) => v !== undefined)
    );
    return await prisma.additionalDetail.update({
        where: { id },
        data: cleanData
    });
};

export const deleteAdditionalDetailRepo = async (id: number) => {
    return await prisma.additionalDetail.delete({
        where: { id }
    });
};

export const getAdditionalDetailsByProfileIdRepo = async (profileId: number) => {
    return await prisma.additionalDetail.findMany({
        where: { profileId },
        orderBy: { date: 'desc' }
    });
};

export const findAdditionalDetailByIdRepo = async (id: number) => {
    return await prisma.additionalDetail.findUnique({
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
