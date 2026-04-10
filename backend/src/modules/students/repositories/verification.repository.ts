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

/**
 * Transactionally saves verified academic data extracted from documents.
 * Updates StudentProfile, SemesterResults, and User.isProfileCompleted.
 */
export const saveVerifiedAcademicData = async (
  userId: number,
  data: {
    astuRollNo: string;
    cgpa: number;
    semesters: { semester: number; sgpa: number }[];
    backlog: boolean;
    backlogSubjects: string[];
    verificationReason: string;
  }
) => {
  return await prisma.$transaction(async (tx) => {
    // 1. Update Student Profile with extracted academic data
    const profile = await tx.studentProfile.update({
      where: { userId },
      data: {
        astuRollNo: data.astuRollNo,
        cgpa: data.cgpa,
        backlog: data.backlog,
        backlogSubjects: data.backlogSubjects,
        verificationStatus: VerificationStatus.VERIFIED,
        verificationReason: data.verificationReason,
      },
    });

    // 2. Sync Semester Results (Overwrite with verified data)
    await tx.semesterResult.deleteMany({
      where: { userId },
    });

    await tx.semesterResult.createMany({
      data: data.semesters.map((s) => ({
        userId,
        semester: s.semester,
        sgpa: s.sgpa,
      })),
    });

    // 3. Mark User Profile as Completed (since strictly dependent on VERIFIED status)
    await tx.user.update({
      where: { id: userId },
      data: { isProfileCompleted: true },
    });

    return profile;
  });
};
