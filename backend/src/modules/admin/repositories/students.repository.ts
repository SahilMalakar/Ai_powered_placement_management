import type { Prisma } from "../../../prisma/generated/prisma/client.js";
import { prisma } from "../../../prisma/prisma.js";
import type { GetAllStudentsQueryInput } from "../../../shared/types/admin/student.js";


export const getAllStudentRepository = async (params: GetAllStudentsQueryInput & { skip: number }) => {
    const { limit: take, skip, search, branch, cgpa, backlogAllowed, verificationStatus } = params;

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
                branch ? { branch: branch } : {},
                cgpa ? { cgpa: { gte: Number(cgpa) } } : {},
                backlogAllowed !== undefined ? { backlog: Boolean(backlogAllowed) } : {},
                verificationStatus ? { verificationStatus: verificationStatus } : {}
            ]
        }
    };

    const [students, totalCount] = await Promise.all([
        prisma.user.findMany({
            where,
            skip,
            take,
            select: {
                id: true,
                email: true,
                deletedAt: true, // Included so admin can see who is banned
                profile: {
                    select: {
                        fullName: true,
                        branch: true,
                        cgpa: true,
                        backlog: true,
                        verificationStatus: true,
                    }
                }
            },
            orderBy: {
                createdAt: "desc"
            }
        }),
        prisma.user.count({ where })
    ]);
    return { students, totalCount };

}

export const getStudentByIdRepository = async (studentId: number) => {
    return await prisma.user.findFirst({
        where: {
            id: studentId,
            role: "STUDENT"
        },

        select: {
            id: true,
            email: true,
            createdAt: true,
            updatedAt: true,
            deletedAt: true,

            profile: {
                select: {
                    id: true,
                    fullName: true,
                    rollNo: true,
                    branch: true,
                    degree: true,
                    cgpa: true,
                    dob: true,
                    backlog: true,
                    backlogSubjects: true,
                    verificationStatus: true,
                    phoneNumber: true,
                    graduationYear: true,
                    university: true,
                }
            },

            semesters: {
                select: {
                    id: true,
                    semester: true,
                    sgpa: true,
                },
                orderBy: {
                    semester: "asc"
                }
            },

            documents: {
                select: {
                    id: true,
                    semester: true,
                    publicId: true,
                    url: true,
                },

                orderBy: {
                    semester: "asc"
                }
            },

            applications: {
                select: {
                    id: true,
                    userId: true,
                    jobId: true,
                    status: true,
                    createdAt: true,
                    updatedAt: true,
                    deletedAt: true,

                    job: {
                        select: {
                            id: true,
                            title: true,
                            company: true,
                        }
                    }
                },

                orderBy: {
                    createdAt: "desc"
                }
            }
        }
    })
}

export const softDeleteStudentRepository = async (studentId: number) => {
    return await prisma.user.update({
        where: {
            id: studentId,
            role: "STUDENT"
        },
        data: {
            deletedAt: new Date(),
            profile: {
                update: {
                    deletedAt: new Date()
                }
            },
            documents: {
                updateMany: {
                    where: { deletedAt: null },
                    data: { deletedAt: new Date() }
                }
            },
            applications: {
                updateMany: {
                    where: { deletedAt: null },
                    data: { deletedAt: new Date() }
                }
            },
            resumes: {
                updateMany: {
                    where: { deletedAt: null },
                    data: { deletedAt: new Date() }
                }
            },
            atsResults: {
                updateMany: {
                    where: { deletedAt: null },
                    data: { deletedAt: new Date() }
                }
            }
        },
        select: {
            id: true,
            email: true,
            deletedAt: true,
        }
    })
}