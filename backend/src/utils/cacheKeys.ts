// Centralized registry for Redis cache keys
// Use functions for keys that require dynamic parameters (like IDs)

export const CACHE_KEYS = {
    USER_SESSION: (userId: number | string) => `user:session:${userId}`,
    STUDENT_PROFILE: (userId: number | string) => `student:profile:${userId}`,
    STUDENT_CORE: (userId: number | string) => `student:core:${userId}`,
    STUDENT_EXPERIENCES: (userId: number | string) => `student:experiences:${userId}`,
    JOBS_LIST: 'jobs:list',
};
