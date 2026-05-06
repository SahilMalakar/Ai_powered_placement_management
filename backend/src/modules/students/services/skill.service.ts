import {
    addSkillRepo,
    deleteSkillRepo,
    findSkillByIdRepo,
    getSkillsByProfileIdRepo,
    updateSkillRepo
} from "../repositories/skill.repository.js";
import { getProfileRepo } from "../repositories/profile.repository.js";
import { ForbiddenError, NotFoundError } from "../../../utils/errors/httpErrors.js";
import type { SkillInput, UpdateSkillInput } from "../../../types/students/profile.js";
import { VerificationStatus } from "../../../prisma/generated/prisma/enums.js";
import { invalidateSkillCache } from "../../../utils/cacheInvalidation.js";
import { CACHE_KEYS } from "../../../utils/cacheKeys.js";
import { getRedisConnectionForCaching } from "../../../configs/redis.config.js";

export const addSkillService = async (userId: number, data: SkillInput) => {
    const profile = await getProfileRepo(userId);
    if (!profile) throw new NotFoundError("Profile not found. Please create one first.");

    if (profile.verificationStatus === VerificationStatus.PROCESSING) {
        throw new ForbiddenError("Cannot add skill while profile is under verification.");
    }

    const result = await addSkillRepo(profile.id, data);
    await invalidateSkillCache(userId);
    return result;
};

export const updateSkillService = async (userId: number, skillId: number, data: UpdateSkillInput) => {
    const skill = await findSkillByIdRepo(skillId);
    if (!skill) throw new NotFoundError("Skill not found.");

    if (skill.profile.userId !== userId) {
        throw new ForbiddenError("You do not have permission to update this skill.");
    }

    const profile = await getProfileRepo(userId);
    if (profile?.verificationStatus === VerificationStatus.PROCESSING) {
        throw new ForbiddenError("Cannot update skill while profile is under verification.");
    }

    const result = await updateSkillRepo(skillId, data);
    await invalidateSkillCache(userId);
    return result;
};

export const deleteSkillService = async (userId: number, skillId: number) => {
    const skill = await findSkillByIdRepo(skillId);
    if (!skill) throw new NotFoundError("Skill not found.");

    if (skill.profile.userId !== userId) {
        throw new ForbiddenError("You do not have permission to delete this skill.");
    }

    const profile = await getProfileRepo(userId);
    if (profile?.verificationStatus === VerificationStatus.PROCESSING) {
        throw new ForbiddenError("Cannot delete skill while profile is under verification.");
    }

    await deleteSkillRepo(skillId);
    await invalidateSkillCache(userId);
    return { success: true, message: "Skill deleted successfully." };
};

export const getSkillsService = async (userId: number) => {
    const cacheKey = CACHE_KEYS.STUDENT_SKILLS(userId);
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

    const skills = await getSkillsByProfileIdRepo(profile.id);

    // cache for 5 minutes
    await cacheClient.set(cacheKey, JSON.stringify(skills), "EX", 5 * 60);

    return skills;
};
