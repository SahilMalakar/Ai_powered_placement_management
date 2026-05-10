import {
    createJob,
    updateJob,
    getJobById,
    updateJobStatus,
    getStudentsForJobNotification,
    getAllJobs,
    deleteJob,
    getJobsWithApplicationStats,
} from '../repositories/job.repository.js';
import { BadRequestError } from '../../../utils/errors/httpErrors.js';
import type {
    CreateJobInput,
    GetAllJobsQueryInput,
    UpdateJobInput,
} from '../../../types/admin/job.js';
import type { JobCreateInput } from '../../../prisma/generated/prisma/models/Job.js';
import type { NotificationTypes } from '../../../types/admin/notification.js';
import { addBulkEmailsToQueue } from '../../../queues/notification.queue.js';
import { getRedisConnectionForCaching } from '../../../configs/redis.config.js';
import { CACHE_KEYS } from '../../../utils/cacheKeys.js';

export const createJobService = async (jobData: CreateJobInput) => {
    const job = await createJob(jobData as JobCreateInput);
    if (!job) {
        throw new BadRequestError('Failed to create job');
    }

    // Cache Invalidation
    try {
        const cacheClient = getRedisConnectionForCaching();
        const keys = await cacheClient.keys(`${CACHE_KEYS.JOBS_LIST}*`);
        if (keys.length > 0) {
            await cacheClient.del(keys);
            console.log(`🧹 Cache Invalidated (${keys.length} keys): `, CACHE_KEYS.JOBS_LIST);
        }
    } catch (error) {
        console.error('❌ Cache Invalidation Failed (Create):', error);
    }

    return job;
};

export const updateJobByIdService = async (
    jobId: number,
    jobData: UpdateJobInput
) => {
    // Safety check: remove status if it somehow slipped through validation
    const { status: _status, ...updateData } = jobData as UpdateJobInput & {
        status?: unknown;
    };

    const job = await updateJob(jobId, updateData);
    if (!job) {
        throw new BadRequestError('Failed to update job');
    }

    // Cache Invalidation
    const cacheClient = getRedisConnectionForCaching();
    const listKeys = await cacheClient.keys(`${CACHE_KEYS.JOBS_LIST}*`);
    if (listKeys.length > 0) await cacheClient.del(listKeys);
    await cacheClient.del(CACHE_KEYS.JOB_DETAILS(jobId));
    console.log(`🧹 Cache Invalidated: ${CACHE_KEYS.JOBS_LIST} & ${CACHE_KEYS.JOB_DETAILS(jobId)}`);

    return job;
};

export const activateJobService = async (jobId: number) => {
    // 1. Fetch the job
    const job = await getJobById(jobId);
    if (!job) {
        throw new BadRequestError('Job not found');
    }

    // 2. Prevent activating expired jobs
    if (new Date(job.deadline) <= new Date()) {
        throw new BadRequestError(
            'Cannot activate a job with a past deadline. Please update the deadline first.'
        );
    }

    if (job.status === 'ACTIVE') {
        throw new BadRequestError('Job is already active');
    }

    // 3. Update status to ACTIVE
    const activatedJob = await updateJobStatus(jobId, 'ACTIVE');

    // 4. Invalidate Cache Early
    try {
        const cacheClient = getRedisConnectionForCaching();
        const listKeys = await cacheClient.keys(`${CACHE_KEYS.JOBS_LIST}*`);
        if (listKeys.length > 0) await cacheClient.del(listKeys);
        await cacheClient.del(CACHE_KEYS.JOB_DETAILS(jobId));
    } catch (error) {
        console.error('⚠️ Cache Invalidation Warning (Activate):', error);
    }

    // 5. Scalable Notification Dispatch
    const students = await getStudentsForJobNotification();

    if (students.length > 0) {
        try {
            // Helper for truncation and HTML stripping
            const truncateText = (text: string, length: number) => {
                if (text.length <= length) return text;
                return text.substring(0, length) + '...';
            };
            const plainTextDescription = job.description.replace(/<[^>]*>?/gm, '');
            const truncatedDescription = truncateText(plainTextDescription, 200);

            // Process in chunks of 500 to prevent OOM
            const CHUNK_SIZE = 500;
            for (let i = 0; i < students.length; i += CHUNK_SIZE) {
                const chunk = students.slice(i, i + CHUNK_SIZE);
                const notifications: NotificationTypes[] = chunk.map((student) => ({
                    templateId: 'new-job',
                    to: student.email,
                    subject: `New Job Opportunity: ${job.title} at ${job.company}`,
                    params: {
                        studentName: student.profile?.fullName || 'Student',
                        jobTitle: job.title,
                        companyName: job.company,
                        deadline: job.deadline.toISOString(),
                        dashboardLink: `${process.env.FRONTEND_URL || 'http://localhost:4001'}/dashboard/jobs/${job.id}`,
                        jobDescription: truncatedDescription,
                    },
                }));
                await addBulkEmailsToQueue(notifications);
            }
            console.log(`📢 Notifications queued for ${students.length} students in chunks.`);
        } catch (error) {
            // Graceful failure for notifications - job is already active
            console.error('❌ Notification Batching Failed (Job is ACTIVE):', error);
        }
    }

    return activatedJob;
};

export const deactivateJobService = async (jobId: number) => {
    // 1. Fetch the job
    const job = await getJobById(jobId);
    if (!job) {
        throw new BadRequestError('Job not found');
    }
    if (job.status === 'DRAFT') {
        throw new BadRequestError(
            'Draft jobs cannot be deactivated. They must be activated first.'
        );
    }
    if (job.status === 'DEACTIVE') {
        throw new BadRequestError('Job is already deactivated');
    }

    // 2. Update status to DEACTIVE
    const deactivatedJob = await updateJobStatus(jobId, 'DEACTIVE');

    // Cache Invalidation
    const cacheClient = getRedisConnectionForCaching();
    const listKeys = await cacheClient.keys(`${CACHE_KEYS.JOBS_LIST}*`);
    if (listKeys.length > 0) await cacheClient.del(listKeys);
    await cacheClient.del(CACHE_KEYS.JOB_DETAILS(jobId));
    console.log(`🧹 Cache Invalidated: ${CACHE_KEYS.JOBS_LIST} & ${CACHE_KEYS.JOB_DETAILS(jobId)}`);

    return deactivatedJob;
};

export const getAllJobsService = async (
    filters: GetAllJobsQueryInput,
    userRole?: string
) => {
    // If student, force ACTIVE status
    const effectiveFilters = {
        ...filters,
        status: userRole === 'STUDENT' ? 'ACTIVE' : filters.status,
    };

    const cacheKey = `${CACHE_KEYS.JOBS_LIST}:${JSON.stringify(effectiveFilters)}`;

    try {
        const cacheClient = getRedisConnectionForCaching();

        // Try Cache Hit
        const cachedJobs = await cacheClient.get(cacheKey);
        if (cachedJobs) {
            console.log('🚀 Cache Hit: ', cacheKey);
            return JSON.parse(cachedJobs);
        }

        // Cache Miss
        console.log('⚡ Cache Miss: ', cacheKey);
        const jobs = await getAllJobs(effectiveFilters);

        // Set Cache with 5-minute TTL (300 seconds)
        await cacheClient.set(cacheKey, JSON.stringify(jobs), 'EX', 300);

        return jobs;
    } catch (error) {
        // FAIL-SAFE: Fallback to Database if Redis is down
        console.error('⚠️ Redis Cache Failure (Fallback to DB):', error);
        return await getAllJobs(effectiveFilters);
    }
};

export const getJobByIdService = async (jobId: number, userRole?: string) => {
    const cacheKey = CACHE_KEYS.JOB_DETAILS(jobId);

    try {
        const cacheClient = getRedisConnectionForCaching();

        // Try Cache Hit
        const cachedJob = await cacheClient.get(cacheKey);
        if (cachedJob) {
            const job = JSON.parse(cachedJob);
            // Security Check for cached data
            if (userRole === 'STUDENT' && job.status !== 'ACTIVE') {
                throw new BadRequestError('Job is not available');
            }
            console.log('🚀 Cache Hit (Details): ', cacheKey);
            return job;
        }

        // Cache Miss
        console.log('⚡ Cache Miss (Details): ', cacheKey);
        const job = await getJobById(jobId);

        if (!job) {
            throw new BadRequestError('Job not found');
        }

        // Security: Students should only see ACTIVE jobs
        if (userRole === 'STUDENT' && job.status !== 'ACTIVE') {
            throw new BadRequestError('Job is not available');
        }

        // Set Cache with 5-minute TTL
        await cacheClient.set(cacheKey, JSON.stringify(job), 'EX', 300);

        return job;
    } catch (error) {
        if (error instanceof BadRequestError) throw error;

        // FAIL-SAFE: Fallback to Database
        console.error('⚠️ Redis Cache Failure (Details Fallback):', error);
        const job = await getJobById(jobId);
        if (!job) throw new BadRequestError('Job not found');
        if (userRole === 'STUDENT' && job.status !== 'ACTIVE') {
            throw new BadRequestError('Job is not available');
        }
        return job;
    }
};

export const deleteJobService = async (jobId: number) => {
    const job = await getJobById(jobId);
    if (!job) {
        throw new BadRequestError('Job not found');
    }

    const deletedJob = await deleteJob(jobId);

    // Cache Invalidation
    try {
        const cacheClient = getRedisConnectionForCaching();
        const listKeys = await cacheClient.keys(`${CACHE_KEYS.JOBS_LIST}*`);
        if (listKeys.length > 0) await cacheClient.del(listKeys);
        await cacheClient.del(CACHE_KEYS.JOB_DETAILS(jobId));
        console.log(`🧹 Cache Invalidated: ${CACHE_KEYS.JOBS_LIST} & ${CACHE_KEYS.JOB_DETAILS(jobId)}`);
    } catch (error) {
        console.error('⚠️ Cache Invalidation Failed (Delete):', error);
    }

    return deletedJob;
};

/**
 * Get all jobs with per-status application counts for the applications dashboard.
 */
export const getApplicationDashboardService = async () => {
    return await getJobsWithApplicationStats();
};