import { prisma } from "../../../prisma/prisma.js"
import type { CreateProfileInput, UpdateProfileInput } from "../../../types/students/profile.js"

export const getFullStudentData = async (userId: number) => {
    // We fetch via the User model to get both StudentProfile and SemesterResults
    return await prisma.user.findUnique({
        where: { id: userId, deletedAt: null },
        select: {
            id: true,
            email: true,
            role: true,
            isProfileCompleted: true,
            profile: {
                include: {
                    socialLinks: true,
                    experiences: true,
                    projects: true,
                    skills: true,
                    additionalDetails: true,
                },
            },
            semesters: {
                orderBy: { semester: 'asc' },
            },
            documents: {
                select: {
                    id: true,
                    type: true,
                    url: true,
                    semester: true,
                    createdAt: true,
                },
                where: { deletedAt: null },
            },
        },
    });
};


export const getProfileRepo = async (userId: number) => {
    return await prisma.studentProfile.findUnique({
        where: {
            userId,
            deletedAt: null
        },
        select: {
            id: true,
            userId: true,
            fullName: true,
            branch: true,
            rollNo: true,
            dob: true,
            phoneNumber: true,
            summary: true,
            university: true,
            degree: true,
            graduationYear: true,
            createdAt: true,
            updatedAt: true,
            deletedAt: true,
            user: {
                select: {
                    email: true,
                    role: true,
                    isProfileCompleted: true
                }
            },
            verificationStatus: true
        }
    })      
}

export const createStudentProfileRepo = async (
    userId: number,
    profileData: CreateProfileInput,
    isCompleted: boolean
) => {
    return await prisma.$transaction(async (tx) => {
        await tx.user.update({
            where: {
                id: userId,
                deletedAt: null
            },
            data: {
                isProfileCompleted: isCompleted
            }
        });

        const profile = await tx.studentProfile.create({
            data: {
                userId,
                ...profileData,
                summary: profileData.summary ?? null,
            },
            select: {
                id: true,
                userId: true,
                fullName: true,
                branch: true,
                rollNo: true,
                dob: true,
                phoneNumber: true,
                summary: true,
                university: true,
                degree: true,
                graduationYear: true,
                user: {
                    select: {
                        email: true,
                        role: true,
                        isProfileCompleted: true
                    }
                }
            }
        });


        return profile;
    })
}

export const updateStudentProfileRepo = async (
    userId: number,
    profileData: UpdateProfileInput,
    isCompleted: boolean
) => {
    return await prisma.$transaction(async (tx) => {
        // Update the User's flag FIRST
        await tx.user.update({
            where: { id: userId },
            data: {
                isProfileCompleted: isCompleted,
            }
        });

        // Filter out any keys that have 'undefined' values
        // This ensures the properties are MISSING rather than set to 'undefined'
        const cleanUpdateData = Object.fromEntries(
            Object.entries(profileData).filter(([_, v]) => v !== undefined)
        );

        const profile = await tx.studentProfile.update({
            where: {
                userId,
                deletedAt: null
            },
            data: cleanUpdateData, // Pass the cleaned object here
            select: {
                id: true,
                userId: true,
                fullName: true,
                branch: true,
                rollNo: true,
                dob: true,
                phoneNumber: true,
                summary: true,
                university: true,
                degree: true,
                graduationYear: true,
                user: {
                    select: {
                        email: true,
                        role: true,
                        isProfileCompleted: true
                    }
                }
            }
        });


        return profile;
    });
}
