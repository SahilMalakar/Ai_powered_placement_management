import {
    addExperienceRepo,
    deleteExperienceRepo,
    findExperienceByIdRepo,
    getExperiencesByProfileIdRepo,
    updateExperienceRepo
} from "../repositories/experience.repository.js";
import { getProfileRepo } from "../repositories/profile.repository.js";
import { ForbiddenError, NotFoundError } from "../../../utils/errors/httpErrors.js";
import type { ExperienceInput, UpdateExperienceInput } from "../../../types/students/profile.js";
import { VerificationStatus } from "../../../prisma/generated/prisma/enums.js";
import { getRedisConnectionForCaching } from "../../../configs/redis.config.js";
import { CACHE_KEYS } from "../../../utils/cacheKeys.js";
import { invalidateExperienceCache } from "../../../utils/cacheInvalidation.js";

export const addExperienceService = async (userId: number, data: ExperienceInput) => {
    const profile = await getProfileRepo(userId);
    if (!profile) throw new NotFoundError("Profile not found. Please create one first.");

    if (profile.verificationStatus === VerificationStatus.PROCESSING) {
        throw new ForbiddenError("Cannot add experience while profile is under verification.");
    }

    const result = await addExperienceRepo(profile.id, data);
    await invalidateExperienceCache(userId);
    return result;
};

export const updateExperienceService = async (userId: number, experienceId: number, data: UpdateExperienceInput) => {
    const experience = await findExperienceByIdRepo(experienceId);
    if (!experience) throw new NotFoundError("Experience not found.");

    if (experience.profile.userId !== userId) {
        throw new ForbiddenError("You do not have permission to update this experience.");
    }

    const profile = await getProfileRepo(userId);
    if (profile?.verificationStatus === VerificationStatus.PROCESSING) {
        throw new ForbiddenError("Cannot update experience while profile is under verification.");
    }

    const result = await updateExperienceRepo(experienceId, data);
    await invalidateExperienceCache(userId);
    return result;
};

export const deleteExperienceService = async (userId: number, experienceId: number) => {
    const experience = await findExperienceByIdRepo(experienceId);
    if (!experience) throw new NotFoundError("Experience not found.");

    if (experience.profile.userId !== userId) {
        throw new ForbiddenError("You do not have permission to delete this experience.");
    }

    const profile = await getProfileRepo(userId);
    if (profile?.verificationStatus === VerificationStatus.PROCESSING) {
        throw new ForbiddenError("Cannot delete experience while profile is under verification.");
    }

    await deleteExperienceRepo(experienceId);
    await invalidateExperienceCache(userId);
    return { success: true, message: "Experience deleted successfully." };
};

export const getExperiencesService = async (userId: number) => {
    const cacheKey = CACHE_KEYS.STUDENT_EXPERIENCES(userId);
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

    const experiences = await getExperiencesByProfileIdRepo(profile.id);

    // cache for 5 minutes
    await cacheClient.set(cacheKey, JSON.stringify(experiences), "EX", 5 * 60);

    return experiences;
};