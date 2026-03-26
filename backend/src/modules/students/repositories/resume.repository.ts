import { prisma } from "../../../prisma/prisma.js";


export const createResumeRecord = async (userId: number, version: number, jsonData: any) => {
  return await prisma.resume.create({
    data: {
      userId,
      version,
      jsonData,
    },
  });
};

export const findResumesByUserId = async (userId: number) => {
  return await prisma.resume.findMany({
    where: { userId, deletedAt: null },
    orderBy: { version: "desc" },
  });
};

export const findResumeById = async (id: number) => {
  return await prisma.resume.findFirst({
    where: { id, deletedAt: null },
  });
};

export const updateResumeJson = async (id: number, jsonData: any) => {
  return await prisma.resume.update({
    where: { id },
    data: {
      jsonData,
    },
  });
};

export const countUserResumes = async (userId: number) => {
  return await prisma.resume.count({
    where: { userId, deletedAt: null },
  });
};

export const getLatestResumeVersion = async (userId: number) => {
  const latest = await prisma.resume.findFirst({
    where: { userId },
    orderBy: { version: "desc" },
    select: { version: true },
  });
  return latest?.version || 0;
};
