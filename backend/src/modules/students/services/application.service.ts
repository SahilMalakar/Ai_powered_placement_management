import { applyToJobWithTransaction, getApplicationRepo } from '../repositories/application.repository.js';
import { applicationSnapshotSchema } from '../../../types/students/application.js';
import type { ApplicationSnapshot } from '../../../types/students/application.js';
import { CACHE_KEYS } from '../../../utils/cacheKeys.js';
import { getRedisConnectionForCaching } from '../../../configs/redis.config.js';

/**
 * Handles the high-level logic for applying to a job.
 * Orchestration resides in the repository layer to ensure atomicity.
 */
export const applyToJobService = async (userId: number, jobId: number) => {
    /**
     * Generates the immutable snapshot for the application.
     * Uses Zod to parse/validate the snapshot BEFORE it hits the repository.
     */
    const generateSnapshot = (profile: any, job: any): ApplicationSnapshot => {
        const rawSnapshot = {
            fullName: profile.fullName,
            branch: String(profile.branch), // Explicit cast to string for long-term snapshot stability
            cgpa: profile.cgpa,
            backlog: profile.backlog,
            backlogSubjects: profile.backlogSubjects,
            astuRollNo: profile.astuRollNo,
            rollNo: profile.rollNo,
            verificationStatus: String(profile.verificationStatus),

            // Enriched requirements for audit trail
            appliedAgainstCgpa: job.requiredCgpa,
            allowedBranches: job.allowedBranches.map((b: any) => String(b)),
            backlogAllowed: job.backlogAllowed,

            appliedAt: new Date().toISOString(),
        };

        // Final Robustness Check: Ensure snapshot matches our contract
        return applicationSnapshotSchema.parse(rawSnapshot);
    };

    // Execute through the repository's transaction wrapper
    const application = await applyToJobWithTransaction(
        userId,
        jobId,
        generateSnapshot
    );

    // Cache Invalidation
    try {
        const cacheClient = getRedisConnectionForCaching();
        await cacheClient.del(CACHE_KEYS.STUDENT_APPLICATIONS(userId));
        console.log('🧹 Cache Invalidated: ', CACHE_KEYS.STUDENT_APPLICATIONS(userId));
    } catch (error) {
        console.error('⚠️ Cache Invalidation Warning (Apply):', error);
    }

    return application;
};


export const getApplicationService = async (userId: number) => {
    const cacheKey = CACHE_KEYS.STUDENT_APPLICATIONS(userId);

    try {
        const cacheClient = getRedisConnectionForCaching();

        // Try Cache Hit
        const cachedApplications = await cacheClient.get(cacheKey);
        if (cachedApplications) {
            console.log('🚀 Cache Hit (Applications): ', cacheKey);
            return JSON.parse(cachedApplications);
        }

        // Cache Miss
        console.log('⚡ Cache Miss (Applications): ', cacheKey);
        const applications = await getApplicationRepo(userId);

        // Set Cache with 5-minute TTL
        await cacheClient.set(cacheKey, JSON.stringify(applications), 'EX', 300);

        return applications;
    } catch (error) {
        // FAIL-SAFE: Fallback to Database
        console.error('⚠️ Redis Cache Failure (Applications Fallback):', error);
        return await getApplicationRepo(userId);
    }
};