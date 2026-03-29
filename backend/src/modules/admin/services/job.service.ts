import { createJob, updateJob } from "../repositories/job.repository.js";
import { BadRequestError } from "../../../utils/errors/httpErrors.js";
import type { CreateJobInput, UpdateJobInput } from "../../../types/admin/job.js";
import type { JobCreateInput } from "../../../prisma/generated/prisma/models/Job.js";

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
    // Prisma automatically ignores undefined fields during updates.
    // Manually filtering properties is unnecessary and causes bugs when
    // valid falsy values (like requiredCgpa: 0 or backlogAllowed: false) are passed.
    const job = await updateJob(jobId, jobData)
    if (!job) {
        throw new BadRequestError("Failed to update job")
    }
    return job
}