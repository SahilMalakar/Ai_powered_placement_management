import { prisma } from '../../../prisma/prisma.js';
import {
    ForbiddenError,
    ConflictError,
    NotFoundError,
} from '../../../utils/errors/httpErrors.js';
import {
    VerificationStatus,
    JobStatus,
} from '../../../prisma/generated/prisma/enums.js';
import type { ApplicationSnapshot } from '../../../types/students/application.js';

/**
 * Fetches an application by user and job ID to check for duplicates.
 */
export const findApplicationByUserIdAndJobId = async (
    userId: number,
    jobId: number,
    tx: any = prisma
) => {
    return await tx.application.findUnique({
        where: {
            userId_jobId: {
                userId,
                jobId,
            },
        },
    });
};

/**
 * Orchestrates the entire application process within a transaction to ensure atomicity.
 * Moves the robustness logic into the repository layer.
 */
export const applyToJobWithTransaction = async (
    userId: number,
    jobId: number,
    getSnapshotFn: (profile: any, job: any) => ApplicationSnapshot
) => {
    return await prisma.$transaction(async (tx) => {
        // 1. Fetch Job and check availability (inside transaction for consistency)
        const job = await tx.job.findUnique({
            where: { id: jobId, deletedAt: null },
        });
        if (!job) throw new NotFoundError('Job posting not found.');

        if (job.status !== JobStatus.ACTIVE)
            throw new ForbiddenError('Job is not active.');

        if (new Date() > new Date(job.deadline))
            throw new ForbiddenError('Deadline passed.');

        // 2. Prevent duplicate applications
        const existing = await findApplicationByUserIdAndJobId(
            userId,
            jobId,
            tx
        );
        if (existing) throw new ConflictError('Already applied.');

        // 3. Fetch Student for final eligibility check
        const user = await tx.user.findUnique({
            where: { id: userId, deletedAt: null },
            include: { profile: true },
        });
        if (!user?.profile) throw new NotFoundError('Profile not found.');
        const profile = user.profile;

        // 4. Eligibility Enforcement
        if (!user.isProfileCompleted)
            throw new ForbiddenError('Complete profile first.');
        if (profile.verificationStatus !== VerificationStatus.VERIFIED)
            throw new ForbiddenError('Verify profile first.');
        if (profile.cgpa === null || profile.cgpa < job.requiredCgpa)
            throw new ForbiddenError('CGPA too low.');
        if (!job.allowedBranches.includes(profile.branch))
            throw new ForbiddenError('Branch not eligible.');
        if (!job.backlogAllowed && profile.backlog)
            throw new ForbiddenError('Backlogs not allowed.');

        // 5. Generate Snapshot and Create Application
        const snapshot = getSnapshotFn(profile, job);

        return await tx.application.create({
            data: {
                userId,
                jobId,
                snapshot,
            },
        });
    });
};


export const getApplicationRepo = async(userId:number)=>{
    return await prisma.application.findMany({
        where:{
            userId:userId,
            deletedAt:null,
            job:{
                deletedAt:null
            }
        },
        select:{
            id:true,
            userId:true,
            jobId:true,
            status:true,
            createdAt:true,
            job:{
                select:{
                    id:true,
                    title:true,
                    company:true,
                    status:true,
                    deadline:true,
                }
            }
        },
        orderBy:{
            createdAt:"desc"
        }
    })
}