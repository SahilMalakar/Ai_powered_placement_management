import { getRedisConnectionForCaching } from "../configs/redis.config.js";
import { CACHE_KEYS } from "./cacheKeys.js";

// Generic cache invalidation — deletes one or more cache keys.
export async function invalidateCache(...keys: string[]) {
    const cacheClient = getRedisConnectionForCaching();
    await Promise.all(keys.map((key) => cacheClient.del(key)));
}

export async function invalidateStudentCache(userId: number) {
    await invalidateCache(
        CACHE_KEYS.STUDENT_CORE(userId),
        CACHE_KEYS.STUDENT_PROFILE(userId),
        CACHE_KEYS.STUDENT_DOCUMENTS(userId),
        CACHE_KEYS.STUDENT_ACADEMIC(userId),
        CACHE_KEYS.USER_SESSION(userId),
    );
}

export async function invalidateExperienceCache(userId: number) {
    await invalidateCache(CACHE_KEYS.STUDENT_EXPERIENCES(userId));
}

export async function invalidateSocialLinkCache(userId: number) {
    await invalidateCache(CACHE_KEYS.STUDENT_SOCIALLINKS(userId));
}

export async function invalidateProjectCache(userId: number) {
    await invalidateCache(CACHE_KEYS.STUDENT_PROJECTS(userId));
}

export async function invalidateSkillCache(userId: number) {
    await invalidateCache(CACHE_KEYS.STUDENT_SKILLS(userId));
}

export async function invalidateAdditionalDetailCache(userId: number) {
    await invalidateCache(CACHE_KEYS.STUDENT_ADDITIONAL_DETAILS(userId));
}

export async function invalidateDocumentCache(userId: number) {
    await invalidateCache(CACHE_KEYS.STUDENT_DOCUMENTS(userId));
}