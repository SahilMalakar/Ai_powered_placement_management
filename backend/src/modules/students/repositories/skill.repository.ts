import { prisma } from "../../../prisma/prisma.js";
import type { SkillInput, UpdateSkillInput } from "../../../shared/types/students/profile.js";

export const addSkillRepo = async (profileId: number, data: SkillInput) => {
    return await prisma.skill.create({
        data: {
            profileId,
            category: data.category,
            skills: data.skills,
        }
    });
};

export const updateSkillRepo = async (id: number, data: UpdateSkillInput) => {
    const cleanData = Object.fromEntries(
        Object.entries(data).filter(([_, v]) => v !== undefined)
    );
    return await prisma.skill.update({
        where: { id },
        data: cleanData
    });
};

export const deleteSkillRepo = async (id: number) => {
    return await prisma.skill.delete({
        where: { id }
    });
};

export const getSkillsByProfileIdRepo = async (profileId: number) => {
    return await prisma.skill.findMany({
        where: { profileId }
    });
};

export const findSkillByIdRepo = async (id: number) => {
    return await prisma.skill.findUnique({
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
