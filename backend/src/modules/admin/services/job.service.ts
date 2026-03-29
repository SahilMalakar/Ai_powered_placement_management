import { createJob, updateJob, getJobById, updateJobStatus, getStudentsForJobNotification } from "../repositories/job.repository.js";
import { BadRequestError } from "../../../utils/errors/httpErrors.js";
import type { CreateJobInput, UpdateJobInput } from "../../../types/admin/job.js";
import type { JobCreateInput } from "../../../prisma/generated/prisma/models/Job.js";
import type { NotificationTypes } from "../../../types/admin/notification.js";
import { addBulkEmailsToQueue } from "../../../queues/notification.queue.js";

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

    return deactivatedJob;
}