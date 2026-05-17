import { prisma } from "../../../prisma/prisma.js";
import type { Branch, NotificationStatus } from "../../../prisma/generated/prisma/enums.js";

export const createMessageRepository = async (data: {
    message: string;
    link?: string | null;
    branches: Branch[];
    createdById: number;
}) => {
    return await prisma.notificationMessage.create({
        data: {
            message: data.message,
            link: data.link || null,
            branches: data.branches,
            createdById: data.createdById,
            status: 'QUEUED',
        },
        select: {
            id: true,
            message: true,
            link: true,
            branches: true,
            status: true,
            createdAt: true,
            createdBy: {
                select: {
                    id: true,
                    email: true,
                    profile: {
                        select: {
                            fullName: true,
                        },
                    },
                },
            },
        },
    });
};

export const getStudentsByBranchesRepository = async (branches: Branch[]) => {
    return await prisma.user.findMany({
        where: {
            role: 'STUDENT',
            deletedAt: null,
            isProfileCompleted: true, // Only send to students who have completed profiles (has a profile in DB)
            profile: {
                branch: {
                    in: branches,
                },
            },
        },
        select: {
            id: true,
            email: true,
            profile: {
                select: {
                    fullName: true,
                    branch: true,
                },
            },
        },
    });
};

export const getAdminByIdRepository = async (adminId: number) => {
    return await prisma.user.findUnique({
        where: { id: adminId },
        select: {
            profile: {
                select: {
                    fullName: true,
                },
            },
        },
    });
};

export const updateMessageStatusRepository = async (id: number, status: NotificationStatus) => {
    return await prisma.notificationMessage.update({
        where: { id },
        data: { status },
    });
};

export const getAdminMessagesHistoryRepository = async (params: { skip: number; take: number }) => {
    const [messages, totalCount] = await Promise.all([
        prisma.notificationMessage.findMany({
            orderBy: {
                createdAt: 'desc',
            },
            skip: params.skip,
            take: params.take,
            select: {
                id: true,
                message: true,
                link: true,
                branches: true,
                status: true,
                createdAt: true,
                createdBy: {
                    select: {
                        id: true,
                        email: true,
                        profile: {
                            select: {
                                fullName: true,
                            },
                        },
                    },
                },
            },
        }),
        prisma.notificationMessage.count(),
    ]);
    return { messages, totalCount };
};


