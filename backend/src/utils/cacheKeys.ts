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
    STUDENT_DOCUMENTS: (userId: number | string) => `student:documents:${userId}`,
    STUDENT_ACADEMIC: (userId: number | string) => `student:academic:${userId}`,
    JOBS_LIST: 'jobs:list',
    JOB_DETAILS: (jobId: number | string) => `job:details:${jobId}`,
    STUDENT_APPLICATIONS: (userId: number | string) => `student:applications:${userId}`,
    ADMIN_STUDENTS_LIST: 'admin:students:list',
    ADMIN_STUDENT_DETAILS: (studentId: number | string) => `admin:student:details:${studentId}`,
};
