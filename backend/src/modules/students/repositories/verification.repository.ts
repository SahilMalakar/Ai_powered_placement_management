import { prisma } from "../../../prisma/prisma.js";
import { VerificationStatus } from "../../../prisma/generated/prisma/enums.js";

/**
 * Fetches only the SGPA documents for a given student
 */
export const getStudentSgpaDocuments = async (userId: number) => {
  return await prisma.document.findMany({
    where: {
      userId,
      type: "SGPA",
      deletedAt: null 
    },
    orderBy: {
      semester: "asc" 
    }
  });
};

/**
 * Gets the count of SGPA documents for completeness check
 */
export const getSgpaDocumentsCount = async (userId: number) => {
  return await prisma.document.count({
    where: {
      userId,
      type: "SGPA",
      deletedAt: null
    }
  });
};

/**
 * Gets the count of Semester results for completeness check
 */
export const getSemesterResultsCount = async (userId: number) => {
  return await prisma.semesterResult.count({
    where: { userId }
  });
};

/**
 * Fetches all semester results for a student ordered by semester
 */
export const getSemesterResults = async (userId: number) => {
  return await prisma.semesterResult.findMany({
    where: { userId },
    orderBy: { semester: "asc" }
  });
};

/**
 * Updates the verification status of a student profile
 */
export const updateVerificationStatus = async (
  userId: number, 
  status: VerificationStatus, 
  reason: string | null = null
) => {
  return await prisma.studentProfile.update({
    where: { userId },
    data: {
      verificationStatus: status,
      verificationReason: reason
    }
  });
};
