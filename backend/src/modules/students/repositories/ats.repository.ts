import { prisma } from "../../../prisma/prisma.js";
import type { ATSResultType } from "../../../types/students/ats.js";

// Saves a new ATS analysis result to the database.
export const createAtsResult = async (userId: number, resumeUrl: string, jobDescription: string, result: ATSResultType) => {
  return await prisma.aTSResult.create({
    data: {
      userId,
      resumeUrl,
      jobDescription,
      score: result.score,
      strengths: result.strengths,
      weaknesses: result.weaknesses,
      suggestions: result.suggestions,
    },
  });
};

// Counts the number of ATS analyses a user has done today.
export const countAtsAnalysesToday = async (userId: number) => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  return await prisma.aTSResult.count({
    where: {
      userId,
      createdAt: {
        gte: startOfDay,
      },
    },
  });
};

// Fetches all ATS analysis results for a specific user.
export const findAtsResultsByUserId = async (userId: number) => {
  return await prisma.aTSResult.findMany({
    where: { userId, deletedAt: null },
    orderBy: { createdAt: "desc" },
  });
};
