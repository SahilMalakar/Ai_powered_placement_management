import type { ApplicationStatus } from "../../../prisma/generated/prisma/enums.js";
import { prisma } from "../../../prisma/prisma.js";

/**
 * Fetch all applicants for a specific job.
 * Excludes soft-deleted applications.
 */
export const getApplicantByJobIdRepository = async (jobId: number) => {
    return await prisma.application.findMany({
        where: {
            jobId: jobId,
            deletedAt: null
        },
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
        }
    });
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