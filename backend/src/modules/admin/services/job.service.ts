import { createJob, updateJob, getJobById, updateJobStatus, getStudentsForJobNotification, getAllJobs } from "../repositories/job.repository.js";
import { BadRequestError } from "../../../utils/errors/httpErrors.js";
import type { CreateJobInput, UpdateJobInput } from "../../../types/admin/job.js";
import type { JobCreateInput } from "../../../prisma/generated/prisma/models/Job.js";
import type { NotificationTypes } from "../../../types/admin/notification.js";
import { addBulkEmailsToQueue } from "../../../queues/notification.queue.js";
import { getRedisConnectionForCaching } from "../../../configs/redis.config.js";
import { CACHE_KEYS } from "../../../utils/cacheKeys.js";


export const createJobService = async (
    jobData: CreateJobInput) => {
    const job = await createJob(jobData as JobCreateInput)
    if (!job) {
        throw new BadRequestError("Failed to create job")
    }
    return job
}


export const updateJobByIdService = async (
    jobId: number,
    jobData: UpdateJobInput) => {
    
    // Safety check: remove status if it somehow slipped through validation
    const { status, ...updateData } = jobData as any;
    
    const job = await updateJob(jobId, updateData)
    if (!job) {
        throw new BadRequestError("Failed to update job")
    }

    // Cache Invalidation
    const cacheClient = getRedisConnectionForCaching();
    await cacheClient.del(CACHE_KEYS.JOBS_LIST);
    console.log("🧹 Cache Invalidated: ", CACHE_KEYS.JOBS_LIST);

    return job
}

export const activateJobService = async (jobId: number) => {
    // 1. Fetch the job
    const job = await getJobById(jobId);
    if (!job) {
        throw new BadRequestError("Job not found");
    }
    if (job.status === "ACTIVE") {
        throw new BadRequestError("Job is already active");
    }

    // 2. Update status to ACTIVE
    const activatedJob = await updateJobStatus(jobId, "ACTIVE");

    // 3. Query all "STUDENT" role records via repository
    const students = await getStudentsForJobNotification();

    if (students.length === 0) {
        return activatedJob;
    }

    // Map students to BullMQ addBulk payloads
    // truncation logic for jobDescription length
    const truncateText = (text: string, length: number) => {
        if (text.length <= length) return text;
        return text.substring(0, length) + "...";
    };
    
    const plainTextDescription = job.description.replace(/<[^>]*>?/gm, ''); // simple html strip if html is present
    const truncatedDescription = truncateText(plainTextDescription, 200);

    const notifications: NotificationTypes[] = students.map(student => ({
        templateId: "new-job",
        to: student.email,
        subject: `New Job Opportunity: ${job.title} at ${job.company}`,
        params: {
            studentName: student.profile?.fullName || "Student",
            jobTitle: job.title,
            companyName: job.company,
            deadline: job.deadline.toISOString(),
            dashboardLink: `${process.env.FRONTEND_URL || 'http://localhost:4001'}/dashboard/jobs/${job.id}`,
            jobDescription: truncatedDescription
        }
    }));
    
    await addBulkEmailsToQueue(notifications);
    
    // Cache Invalidation
    const cacheClient = getRedisConnectionForCaching();
    await cacheClient.del(CACHE_KEYS.JOBS_LIST);
    console.log("🧹 Cache Invalidated: ", CACHE_KEYS.JOBS_LIST);

    return activatedJob;
}

export const deactivateJobService = async (jobId: number) => {
    // 1. Fetch the job
    const job = await getJobById(jobId);
    if (!job) {
        throw new BadRequestError("Job not found");
    }
    if (job.status === "DRAFT") {
        throw new BadRequestError("Draft jobs cannot be deactivated. They must be activated first.");
    }
    if (job.status === "DEACTIVE") {
        throw new BadRequestError("Job is already deactivated");
    }

    // 2. Update status to DEACTIVE
    const deactivatedJob = await updateJobStatus(jobId, "DEACTIVE");

    // Cache Invalidation
    const cacheClient = getRedisConnectionForCaching();
    await cacheClient.del(CACHE_KEYS.JOBS_LIST);
    console.log("🧹 Cache Invalidated: ", CACHE_KEYS.JOBS_LIST);

    return deactivatedJob;
}

export const getAllJobsService = async () => {
    const cacheKey = CACHE_KEYS.JOBS_LIST;
    const cacheClient = getRedisConnectionForCaching();

    // Try Cache Hit
    const cachedJobs = await cacheClient.get(cacheKey);
    if (cachedJobs) {
        console.log("🚀 Cache Hit: ", cacheKey);
        return JSON.parse(cachedJobs);
    }

    // Cache Miss
    console.log("⚡ Cache Miss: ", cacheKey);
    const jobs = await getAllJobs();

    // Set Cache with 5-minute TTL (300 seconds)
    await cacheClient.set(cacheKey, JSON.stringify(jobs), "EX", 300);

    return jobs;
};