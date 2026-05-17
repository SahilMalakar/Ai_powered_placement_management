import { prisma } from '../../../prisma/prisma.js';

/**
 * Fetch all aggregate counts for the admin dashboard in parallel.
 * Uses Promise.all to minimize DB round-trips.
 */
export const getDashboardCounts = async () => {
    const [
        totalStudents,
        verifiedStudents,
        pendingVerifications,
        activeJobs,
        draftJobs,
        totalJobs,
        totalApplications,
        placedStudents,
        shortlistedStudents,
    ] = await Promise.all([
        // Total registered students (non-deleted)
        prisma.user.count({
            where: { role: 'STUDENT', deletedAt: null },
        }),

        // Students with VERIFIED profile
        prisma.studentProfile.count({
            where: { verificationStatus: 'VERIFIED', deletedAt: null },
        }),

        // Students pending verification (NOT_VERIFIED + PROCESSING)
        prisma.studentProfile.count({
            where: {
                verificationStatus: { in: ['NOT_VERIFIED', 'PROCESSING'] },
                deletedAt: null,
            },
        }),

        // Active job postings
        prisma.job.count({
            where: { status: 'ACTIVE', deletedAt: null },
        }),

        // Draft jobs awaiting activation
        prisma.job.count({
            where: { status: 'DRAFT', deletedAt: null },
        }),

        // Total non-deleted jobs
        prisma.job.count({
            where: { deletedAt: null },
        }),

        // Total applications
        prisma.application.count({
            where: { deletedAt: null },
        }),

        // Distinct students who got SELECTED
        prisma.application.groupBy({
            by: ['userId'],
            where: { status: 'SELECTED', deletedAt: null },
        }),

        // Distinct students who are SHORTLISTED
        prisma.application.groupBy({
            by: ['userId'],
            where: { status: 'SHORTLISTED', deletedAt: null },
        }),
    ]);

    return {
        totalStudents,
        verifiedStudents,
        pendingVerifications,
        activeJobs,
        draftJobs,
        totalJobs,
        totalApplications,
        placedStudents: placedStudents.length,
        shortlistedStudents: shortlistedStudents.length,
    };
};

/**
 * Fetch the most recent platform activities for the dashboard feed.
 * Combines recent job posts and recent applications into a unified timeline.
 */
export const getRecentActivities = async (limit: number = 8) => {
    const [recentJobs, recentApplications] = await Promise.all([
        // Recent job postings
        prisma.job.findMany({
            where: { deletedAt: null },
            orderBy: { createdAt: 'desc' },
            take: limit,
            select: {
                id: true,
                title: true,
                company: true,
                status: true,
                createdAt: true,
                createdBy: {
                    select: {
                        email: true,
                    },
                },
            },
        }),

        // Recent applications
        prisma.application.findMany({
            where: { deletedAt: null },
            orderBy: { createdAt: 'desc' },
            take: limit,
            select: {
                id: true,
                status: true,
                createdAt: true,
                user: {
                    select: {
                        email: true,
                        profile: {
                            select: { fullName: true },
                        },
                    },
                },
                job: {
                    select: {
                        title: true,
                        company: true,
                    },
                },
            },
        }),
    ]);

    return { recentJobs, recentApplications };
};

/**
 * Fetch branch-wise student distribution with placement counts.
 */
export const getBranchDistribution = async () => {
    const branches = await prisma.studentProfile.groupBy({
        by: ['branch'],
        where: { deletedAt: null },
        _count: { branch: true },
    });

    // Get placed count per branch
    const placedByBranch = await prisma.application.findMany({
        where: {
            status: 'SELECTED',
            deletedAt: null,
        },
        select: {
            user: {
                select: {
                    profile: {
                        select: { branch: true },
                    },
                },
            },
        },
    });

    // Aggregate placed students by branch
    const placedMap: Record<string, Set<number>> = {};
    // We need userId for distinct count, let's re-query
    const placedWithIds = await prisma.application.findMany({
        where: {
            status: 'SELECTED',
            deletedAt: null,
        },
        select: {
            userId: true,
            user: {
                select: {
                    profile: {
                        select: { branch: true },
                    },
                },
            },
        },
    });

    placedWithIds.forEach((app) => {
        const branch = app.user.profile?.branch;
        if (branch) {
            if (!placedMap[branch]) placedMap[branch] = new Set();
            placedMap[branch].add(app.userId);
        }
    });

    return branches.map((b) => ({
        branch: b.branch,
        total: b._count.branch,
        placed: placedMap[b.branch]?.size ?? 0,
    }));
};
