import { getRedisConnectionForCaching } from "../configs/redis.config.js";
import { CACHE_KEYS } from "./cacheKeys.js";

// Generic cache invalidation — deletes one or more cache keys.
export async function invalidateCache(...keys: string[]) {
    const cacheClient = getRedisConnectionForCaching();
    await Promise.all(keys.map((key) => cacheClient.del(key)));
}


// Invalidates the student's core profile cache and session cache.
export async function invalidateStudentCache(userId: number) {
    await invalidateCache(
        CACHE_KEYS.STUDENT_CORE(userId),
        CACHE_KEYS.USER_SESSION(userId),
    );
}


// Invalidates the student's experience cache.
export async function invalidateExperienceCache(userId: number) {
    await invalidateCache(CACHE_KEYS.STUDENT_EXPERIENCES(userId));
}