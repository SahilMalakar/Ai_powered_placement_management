import type { Prisma } from "../../../prisma/generated/prisma/client.js";
import { prisma } from "../../../prisma/prisma.js";
import type { ExportRequestInput } from "../../../shared/types/admin/export.js";

export const getStudentsForExportRepository = async (params: Omit<ExportRequestInput, 'type'>) => {
    const { search, branch, cgpa, backlogAllowed, verificationStatus, selectedIds } = params;

    if (selectedIds && selectedIds.length > 0) {
        return await prisma.user.findMany({
            where: {
                id: { in: selectedIds },
                role: "STUDENT"
            },
            include: {
                profile: true,
                semesters: true,
                documents: true
            },
            orderBy: {
                createdAt: "desc"
            }
        });
    }

    const where: Prisma.UserWhereInput = {
        role: "STUDENT",
        profile: {
            AND: [
                search ? {
                    OR: [
                        { fullName: { contains: search, mode: "insensitive" } },
                        { rollNo: { contains: search, mode: "insensitive" } }
                    ]
                } : {},
                branch && (branch as string) !== "all" ? { branch: branch as any } : {},
                cgpa ? { cgpa: { gte: Number(cgpa) } } : {},
                backlogAllowed !== undefined ? { backlog: Boolean(backlogAllowed) } : {},
                verificationStatus && (verificationStatus as string) !== "all" ? { verificationStatus: verificationStatus as any } : {}
            ]
        }
    };

    return await prisma.user.findMany({
        where,
        include: {
            profile: true,
            semesters: true,
            documents: true
        },
        orderBy: {
            createdAt: "desc"
        }
    });
};

export const getApplicationsForExportRepository = async (params: Omit<ExportRequestInput, 'type'>) => {
    const { search, status, branch, verificationStatus, jobId, selectedIds } = params;

    const include = {
        job: {
            select: {
                title: true,
                company: true
            }
        },
        user: {
            select: {
                email: true,
                profile: {
                    select: {
                        fullName: true,
                        rollNo: true,
                        cgpa: true,
                        branch: true
                    }
                }
            }
        }
    };

    if (selectedIds && selectedIds.length > 0) {
        return await prisma.application.findMany({
            where: {
                id: { in: selectedIds },
                deletedAt: null
            },
            include,
            orderBy: {
                createdAt: "desc"
            }
        });
    }

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

    if (((branch as string) && (branch as string) !== 'all') || search || ((verificationStatus as string) && (verificationStatus as string) !== "all")) {
        where.user = {
            ...(where.user || {}),
            profile: {
                ...(where.user?.profile || {}),
            }
        };

        if (branch && (branch as string) !== 'all') {
            where.user.profile.branch = branch;
        }

        if (verificationStatus && (verificationStatus as string) !== "all") {
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

    return await prisma.application.findMany({
        where,
        include,
        orderBy: {
            createdAt: "desc"
        }
    });
};

export const getExportLogsRepository = async ({ page, limit }: { page: number; limit: number }) => {
  return prisma.exportLog.findMany({
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      admin: {
        select: { id: true, email: true }
      }
    }
  });
};

export const countExportLogsRepository = () => prisma.exportLog.count();

export const deleteExportLogRepository = async (id: number) => {
  return prisma.exportLog.delete({ where: { id } });
};
