import { prisma } from "../../../prisma/prisma.js";
import type { SocialLinkInput, UpdateSocialLinkInput } from "../../../shared/types/students/profile.js";

export const addSocialLinkRepo = async (profileId: number, data: SocialLinkInput) => {
    return await prisma.socialLink.create({
        data: {
            profileId,
            platform: data.platform,
            url: data.url || "",
        }
    });
};

export const updateSocialLinkRepo = async (id: number, data: UpdateSocialLinkInput) => {
    const cleanData = Object.fromEntries(
        Object.entries(data).filter(([_, v]) => v !== undefined)
    );
    return await prisma.socialLink.update({
        where: { id },
        data: cleanData
    });
};

export const deleteSocialLinkRepo = async (id: number) => {
    return await prisma.socialLink.delete({
        where: { id }
    });
};

export const getSocialLinksByProfileIdRepo = async (profileId: number) => {
    return await prisma.socialLink.findMany({
        where: { profileId }
    });
};

export const findSocialLinkByIdRepo = async (id: number) => {
    return await prisma.socialLink.findUnique({
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
