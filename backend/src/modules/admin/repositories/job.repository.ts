import type {
    JobCreateInput,
    JobUpdateInput,
} from '../../../prisma/generated/prisma/models/Job.js';
import { JobStatus } from '../../../prisma/generated/prisma/enums.js';
import { prisma } from '../../../prisma/prisma.js';
import type { UpdateJobInput } from '../../../types/admin/job.js';

export const createJob = async (jobData: JobCreateInput) => {
    return await prisma.job.create({
        data: jobData,
    });
};

export const getAllJobs = async () => {
    return await prisma.job.findMany();
};

export const getJobById = async (jobId: number) => {
    return await prisma.job.findUnique({
        where: {
            id: jobId,
        },
    });
};

export const updateJob = async (jobId: number, jobData: UpdateJobInput) => {
    return await prisma.job.update({
        where: {
            id: jobId,
        },
        data: jobData as unknown as JobUpdateInput,
    });
};

export const updateJobStatus = async (jobId: number, status: JobStatus) => {
    return await prisma.job.update({
        where: {
            id: jobId,
        },
        data: {
            status,
        },
    });
};

export const getStudentsForJobNotification = async () => {
    return await prisma.user.findMany({
        where: {
            role: 'STUDENT',
        },
        select: {
            email: true,
            profile: {
                select: {
                    fullName: true,
                },
            },
        },
    });
};
