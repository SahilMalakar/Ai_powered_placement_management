import {
    addSocialLinkRepo,
    deleteSocialLinkRepo,
    findSocialLinkByIdRepo,
    getSocialLinksByProfileIdRepo,
    updateSocialLinkRepo
} from "../repositories/socialLink.repository.js";
import { getProfileRepo } from "../repositories/profile.repository.js";
import { ForbiddenError, NotFoundError } from "../../../utils/errors/httpErrors.js";
import type { SocialLinkInput, UpdateSocialLinkInput } from "../../../types/students/profile.js";
import { VerificationStatus } from "../../../prisma/generated/prisma/enums.js";
import { invalidateSocialLinkCache } from "../../../utils/cacheInvalidation.js";
import { CACHE_KEYS } from "../../../utils/cacheKeys.js";
import { getRedisConnectionForCaching } from "../../../configs/redis.config.js";

export const addSocialLinkService = async (userId: number, data: SocialLinkInput) => {
    const profile = await getProfileRepo(userId);
    if (!profile) throw new NotFoundError("Profile not found. Please create one first.");

    if (profile.verificationStatus === VerificationStatus.PROCESSING) {
        throw new ForbiddenError("Cannot add social link while profile is under verification.");
    }

    const result = await addSocialLinkRepo(profile.id, data);
    await invalidateSocialLinkCache(userId);
    return result;
};

export const updateSocialLinkService = async (userId: number, linkId: number, data: UpdateSocialLinkInput) => {
    const link = await findSocialLinkByIdRepo(linkId);
    if (!link) throw new NotFoundError("Social link not found.");

    if (link.profile.userId !== userId) {
        throw new ForbiddenError("You do not have permission to update this social link.");
    }

    const profile = await getProfileRepo(userId);
    if (profile?.verificationStatus === VerificationStatus.PROCESSING) {
        throw new ForbiddenError("Cannot update social link while profile is under verification.");
    }

    const result = await updateSocialLinkRepo(linkId, data);
    await invalidateSocialLinkCache(userId);
    return result;
};

export const deleteSocialLinkService = async (userId: number, linkId: number) => {
    const link = await findSocialLinkByIdRepo(linkId);
    if (!link) throw new NotFoundError("Social link not found.");

    if (link.profile.userId !== userId) {
        throw new ForbiddenError("You do not have permission to delete this social link.");
    }

    const profile = await getProfileRepo(userId);
    if (profile?.verificationStatus === VerificationStatus.PROCESSING) {
        throw new ForbiddenError("Cannot delete social link while profile is under verification.");
    }

    await deleteSocialLinkRepo(linkId);
    await invalidateSocialLinkCache(userId);
    return { success: true, message: "Social link deleted successfully." };
};

export const getSocialLinksService = async (userId: number) => {
    const cacheKey = CACHE_KEYS.STUDENT_SOCIALLINKS(userId);
    const cacheClient = getRedisConnectionForCaching();

    // check cache first
    const cached = await cacheClient.get(cacheKey);
    if (cached) {
        console.log(`🎯 Cache HIT: ${cacheKey}`);
        return JSON.parse(cached);
    }

    console.log(`⚪ Cache MISS: ${cacheKey}`);

    const profile = await getProfileRepo(userId);
    if (!profile) throw new NotFoundError("Profile not found.");

    const links = await getSocialLinksByProfileIdRepo(profile.id);

    // cache for 5 minutes
    await cacheClient.set(cacheKey, JSON.stringify(links), "EX", 5 * 60);

    return links;
};
