import type { ApplicationStatus } from "../../../prisma/generated/prisma/enums.js";
import { prisma } from "../../../prisma/prisma.js";

/**
 * Fetch all applicants for a specific job with pagination and filters.
 * Excludes soft-deleted applications.
 */
export const getApplicantByJobIdRepository = async (jobId: number, query: any) => {
    const { search, status, branch, verificationStatus, page, limit } = query;
    const skip = (page - 1) * limit;

    const where: any = {
        jobId: jobId,
        deletedAt: null,
        user: { deletedAt: null }
    };

    if (status) {
        where.status = status;
    }

    if (branch || search || verificationStatus) {
        where.user.profile = {
            ...(where.user.profile || {}),
        };

        if (branch) {
            where.user.profile.branch = branch;
        }

        if (verificationStatus) {
            where.user.profile.verificationStatus = verificationStatus;
        }

        if (search) {
            where.OR = [
                { user: { email: { contains: search, mode: 'insensitive' } } },
                { user: { profile: { fullName: { contains: search, mode: 'insensitive' } } } },
                { user: { profile: { rollNo: { contains: search, mode: 'insensitive' } } } }
            ];
        }
    }

    const [applicants, total] = await Promise.all([
        prisma.application.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        profile: {
                            select: {
                                fullName: true,
                                rollNo: true,
                                cgpa: true,
                                branch: true,
                                verificationStatus: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: "desc"
            },
            skip,
            take: limit
        }),
        prisma.application.count({ where })
    ]);

    return {
        applicants,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }
    };
};

/**
 * Get per-status application counts for a specific job.
 * Excludes soft-deleted applications and soft-deleted users.
 */
export const getApplicationStatusCountsRepository = async (jobId: number) => {
    const groups = await prisma.application.groupBy({
        by: ['status'],
        where: {
            jobId,
            deletedAt: null,
            user: { deletedAt: null }
        },
        _count: { status: true }
    });

    // Normalize into a flat object with all statuses defaulting to 0
    const counts: Record<string, number> = {
        APPLIED: 0,
        SHORTLISTED: 0,
        SELECTED: 0,
        REJECTED: 0
    };

    for (const g of groups) {
        counts[g.status] = g._count.status;
    }

    return counts;
};

/**
 * Atomically fetch eligible applications and update their status.
 *
 * Uses a Serializable transaction to ensure:
 *  1. The read (eligible check) and write (updateMany) are atomic.
 *  2. If two admins update overlapping students simultaneously,
 *     PostgreSQL detects the conflict and rejects the second transaction.
 *
 * @returns { count: number of rows updated, apps: eligible application data for notifications }
 */

export const bulkUpdateApplicationStatusRepository = async (
    applicationIds: number[],
    newStatus: ApplicationStatus,
    fromStatuses: ApplicationStatus[]
) => {
    return await prisma.$transaction(async (tx) => {
        // 1. Fetch eligible applications (only those in valid "from" state)
        const eligible = await tx.application.findMany({
            where: {
                id: { in: applicationIds },
                status: { in: fromStatuses },
                deletedAt: null,
                user: { deletedAt: null }
            },
            select: {
                id: true,
                user: {
                    select: {
                        email: true,
                        profile: {
                            select: { fullName: true }
                        }
                    }
                },
                job: {
                    select: { title: true, company: true }
                }
            }
        });

        if (eligible.length === 0) {
            return { count: 0, apps: [] };
        }

        const eligibleIds = eligible.map((app) => app.id);

        // 2. Atomic update — re-checks status in WHERE clause for safety
        const updated = await tx.application.updateMany({
            where: {
                id: { in: eligibleIds },
                status: { in: fromStatuses },
                deletedAt: null,
                user: { deletedAt: null }
            },
            data: { status: newStatus }
        });

        return { count: updated.count, apps: eligible };
    }, {
        isolationLevel: "Serializable",
    });
};

/**
 * Fetch all applications across all jobs with pagination and filters.
 */
export const getAllApplicationsRepository = async (query: any) => {
    const { search, status, branch, verificationStatus, page, limit, jobId } = query;
    const skip = (page - 1) * limit;

    const where: any = {
        deletedAt: null,
        user: { deletedAt: null },
        job: { deletedAt: null }
    };

    if (jobId) {
        where.jobId = Number(jobId);
    }

    if (status && status !== 'all') {
        where.status = status;
    }

    if ((branch && branch !== 'all') || search || (verificationStatus && verificationStatus !== "all")) {
        where.user = {
            ...(where.user || {}),
            profile: {
                ...(where.user?.profile || {}),
            }
        };

        if (branch && branch !== 'all') {
            where.user.profile.branch = branch;
        }

        if (verificationStatus && verificationStatus !== "all") {
            where.user.profile.verificationStatus = verificationStatus;
        }

        if (search) {
            where.OR = [
                { user: { email: { contains: search, mode: 'insensitive' } } },
                { user: { profile: { fullName: { contains: search, mode: 'insensitive' } } } },
                { user: { profile: { rollNo: { contains: search, mode: 'insensitive' } } } }
            ];
        }
    }

    const [applicants, total] = await Promise.all([
        prisma.application.findMany({
            where,
            include: {
                job: {
                    select: {
                        id: true,
                        title: true,
                        company: true
                    }
                },
                user: {
                    select: {
                        id: true,
                        email: true,
                        profile: {
                            select: {
                                fullName: true,
                                rollNo: true,
                                cgpa: true,
                                branch: true,
                                verificationStatus: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: "desc"
            },
            skip,
            take: limit
        }),
        prisma.application.count({ where })
    ]);

    return {
        applicants,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }
    };
};