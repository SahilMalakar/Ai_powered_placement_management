// Centralized registry for Redis cache keys
// Use functions for keys that require dynamic parameters (like IDs)

export const CACHE_KEYS = {
    USER_SESSION: (userId: number | string) => `user:session:${userId}`,
    STUDENT_PROFILE: (userId: number | string) => `student:profile:${userId}`,
    STUDENT_CORE: (userId: number | string) => `student:core:${userId}`,
    STUDENT_EXPERIENCES: (userId: number | string) => `student:experiences:${userId}`,
    STUDENT_SOCIALLINKS: (userId: number | string) => `student:sociallinks:${userId}`,
    STUDENT_PROJECTS: (userId: number | string) => `student:projects:${userId}`,
    STUDENT_SKILLS: (userId: number | string) => `student:skills:${userId}`,
    STUDENT_ADDITIONAL_DETAILS: (userId: number | string) => `student:additionaldetails:${userId}`,
    JOBS_LIST: 'jobs:list',
};
