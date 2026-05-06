import { prisma } from "../../../prisma/prisma.js"

export const getApplicantByJobIdRepository = async (jobId:number) => {
    return await prisma.application.findMany({
        where:{
            jobId:jobId,
            deletedAt:null
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
        orderBy:{
            createdAt:"desc"
        }
    })
}