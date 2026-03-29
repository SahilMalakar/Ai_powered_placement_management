import type { JobCreateInput, JobUpdateInput } from "../../../prisma/generated/prisma/models/Job.js";
import { prisma } from "../../../prisma/prisma.js";
import type { UpdateJobInput } from "../../../types/admin/job.js";

export const createJob = async (
    jobData: JobCreateInput
) => {
    return await prisma.job.create({
        data: jobData
    })
}

export const getAllJobs = async () => {
    return await prisma.job.findMany()
}

export const getJobById = async (jobId: number) => {
    return await prisma.job.findUnique({
        where: {
            id: jobId
        }
    })
}

export const updateJob = async (jobId: number, jobData: UpdateJobInput) => {
    return await prisma.job.update({
        where: {
            id: jobId
        },
        data: jobData as unknown as JobUpdateInput
    })
}
