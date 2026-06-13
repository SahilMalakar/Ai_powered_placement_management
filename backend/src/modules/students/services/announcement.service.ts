import { prisma } from "../../../prisma/prisma.js";
import { BadRequestError } from "../../../shared/utils/errors/httpErrors.js";

/**
 * Service to fetch paginated broadcasts/announcements targeted to the student's registered branch.
 */
export const getStudentAnnouncementsService = async (
  userId: number,
  query: { page?: number; limit?: number }
) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  // 1. Resolve student's branch from their profile
  const profile = await prisma.studentProfile.findUnique({
    where: { userId },
    select: { branch: true },
  });

  if (!profile) {
    throw new BadRequestError(
      "Academic profile not found. Please complete your basic profile setup before checking announcements."
    );
  }

  const branch = profile.branch;

  // 2. Fetch notifications matching student's branch that are active/sent
  const [messages, totalCount] = await Promise.all([
    prisma.notificationMessage.findMany({
      where: {
        branches: {
          has: branch,
        },
        status: {
          not: "FAILED",
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
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
    prisma.notificationMessage.count({
      where: {
        branches: {
          has: branch,
        },
        status: {
          not: "FAILED",
        },
      },
    }),
  ]);

  return {
    messages,
    pagination: {
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
    },
  };
};
