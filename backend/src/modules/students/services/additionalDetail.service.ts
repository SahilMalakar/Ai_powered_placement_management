import {
    addAdditionalDetailRepo,
    deleteAdditionalDetailRepo,
    findAdditionalDetailByIdRepo,
    getAdditionalDetailsByProfileIdRepo,
    updateAdditionalDetailRepo
} from "../repositories/additionalDetail.repository.js";
import { getProfileRepo } from "../repositories/profile.repository.js";
import { ForbiddenError, NotFoundError } from "../../../utils/errors/httpErrors.js";
import type { AdditionalDetailInput, UpdateAdditionalDetailInput } from "../../../types/students/profile.js";
import { VerificationStatus } from "../../../prisma/generated/prisma/enums.js";
import { invalidateAdditionalDetailCache } from "../../../utils/cacheInvalidation.js";
import { CACHE_KEYS } from "../../../utils/cacheKeys.js";
import { getRedisConnectionForCaching } from "../../../configs/redis.config.js";

export const addAdditionalDetailService = async (userId: number, data: AdditionalDetailInput) => {
    const profile = await getProfileRepo(userId);
    if (!profile) throw new NotFoundError("Profile not found. Please create one first.");

    if (profile.verificationStatus === VerificationStatus.PROCESSING) {
        throw new ForbiddenError("Cannot add detail while profile is under verification.");
    }

    const result = await addAdditionalDetailRepo(profile.id, data);
    await invalidateAdditionalDetailCache(userId);
    return result;
};

export const updateAdditionalDetailService = async (userId: number, detailId: number, data: UpdateAdditionalDetailInput) => {
    const detail = await findAdditionalDetailByIdRepo(detailId);
    if (!detail) throw new NotFoundError("Detail not found.");

    if (detail.profile.userId !== userId) {
        throw new ForbiddenError("You do not have permission to update this detail.");
    }

    const profile = await getProfileRepo(userId);
    if (profile?.verificationStatus === VerificationStatus.PROCESSING) {
        throw new ForbiddenError("Cannot update detail while profile is under verification.");
    }

    const result = await updateAdditionalDetailRepo(detailId, data);
    await invalidateAdditionalDetailCache(userId);
    return result;
};

export const deleteAdditionalDetailService = async (userId: number, detailId: number) => {
    const detail = await findAdditionalDetailByIdRepo(detailId);
    if (!detail) throw new NotFoundError("Detail not found.");

    if (detail.profile.userId !== userId) {
        throw new ForbiddenError("You do not have permission to delete this detail.");
    }

    const profile = await getProfileRepo(userId);
    if (profile?.verificationStatus === VerificationStatus.PROCESSING) {
        throw new ForbiddenError("Cannot delete detail while profile is under verification.");
    }

    await deleteAdditionalDetailRepo(detailId);
    await invalidateAdditionalDetailCache(userId);
    return { success: true, message: "Detail deleted successfully." };
};

export const getAdditionalDetailsService = async (userId: number) => {
    const cacheKey = CACHE_KEYS.STUDENT_ADDITIONAL_DETAILS(userId);
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

    const details = await getAdditionalDetailsByProfileIdRepo(profile.id);

    // cache for 5 minutes
    await cacheClient.set(cacheKey, JSON.stringify(details), "EX", 5 * 60);

    return details;
};
