import { prisma } from "../../../prisma/prisma.js";
import type { ProjectInput, UpdateProjectInput } from "../../../shared/types/students/profile.js";

export const addProjectRepo = async (profileId: number, data: ProjectInput) => {
    return await prisma.project.create({
        data: {
            profileId,
            title: data.title,
            description: data.description,
            link: data.link ?? null,
            secondaryLink: data.secondaryLink ?? null,
            keyTools: data.keyTools ?? null,
            startDate: data.startDate ?? null,
            endDate: data.endDate ?? null,
        }
    });
};

export const updateProjectRepo = async (id: number, data: UpdateProjectInput) => {
    const cleanData = Object.fromEntries(
        Object.entries(data).filter(([_, v]) => v !== undefined)
    );
    return await prisma.project.update({
        where: { id },
        data: cleanData
    });
};

export const deleteProjectRepo = async (id: number) => {
    return await prisma.project.delete({
        where: { id }
    });
};

export const getProjectsByProfileIdRepo = async (profileId: number) => {
    return await prisma.project.findMany({
        where: { profileId },
        orderBy: { startDate: 'desc' }
    });
};

export const findProjectByIdRepo = async (id: number) => {
    return await prisma.project.findUnique({
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
