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

export const getAllJobs = async (filters: {
    search?: string;
    branch?: string;
    branches?: string[];
    backlogAllowed?: boolean;
    cgpa?: string;
    page?: number;
    limit?: number;
    status?: JobStatus;
}) => {
    const { search, branch, cgpa, page = 1, limit = 10, status } = filters;
    const skip = (page - 1) * limit;

    const where: any = {
        deletedAt: null,
    };

    if (status) {
        where.status = status;
    }

    if (search) {
        where.OR = [
            { title: { contains: search, mode: 'insensitive' } },
            { company: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
        ];
    }

    if (branch) {
        where.allowedBranches = {
            has: branch,
        };
    }

    if (filters.branches && filters.branches.length > 0) {
        where.allowedBranches = {
            hasSome: filters.branches,
        };
    }

    if (filters.backlogAllowed !== undefined) {
        where.backlogAllowed = filters.backlogAllowed;
    }

    const [jobs, total] = await Promise.all([
        prisma.job.findMany({
            where,
            orderBy: {
                createdAt: 'desc',
            },
            skip: Number(skip),
            take: Number(limit),
        }),
        prisma.job.count({ where }),
    ]);

    return {
        jobs,
        pagination: {
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(total / limit),
        },
    };
};

export const getJobById = async (jobId: number) => {
    return await prisma.job.findFirst({
        where: {
            id: jobId,
            deletedAt: null,
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
