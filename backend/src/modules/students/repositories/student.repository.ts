import { prisma } from "../../../prisma/prisma.js"

export const createProfileWithTransaction = async(
  userId:number,
  profileData:any,
  isCompleted:boolean)=>{
    return await prisma.$transaction(async(tx)=>{

      //create core profile
      const profile = await tx.studentProfile.create({
        data:{
          userId,
          ...profileData.core
        }
      });

      const profileId = profile.id;

      // sync relational data of students (socialLinks , projects , skills , experiences)
      await syncRelationalData(tx, profileId, profileData);

      // SGPAs/Semester Results are NO LONGER synced at creation. 
      // They are populated via the Verification Worker after document extraction.

      //Update User's Profile Completion Flag
      await tx.user.update({
        where:{
          id:userId
        },
        data:{
          isProfileCompleted:isCompleted
        }
      })

      // 4. Return Full Profile with all relations included
      return await tx.studentProfile.findUnique({
        where: { id: profileId },
        include: {
          socialLinks: true,
          experiences: true,
          projects: true,
          skills: true,
          additionalDetails: true,
        }
      });
    })
  }



export const updateProfileWithTransaction = async (
  userId: number,
  profileData: any,
  isCompleted: boolean
) => {
  return await prisma.$transaction(async (tx) => {
    // 1. Update Core Profile
    const updateData: any = {
      ...profileData.core,
    };

    const profile = await tx.studentProfile.update({
      where: { userId },
      data: updateData,
    });

    const profileId = profile.id;

    // 2. Sync Relational Data (if provided in partial update)
    if (profileData.socialLinks) await syncRelationalData(tx, profileId, { socialLinks: profileData.socialLinks });
    if (profileData.experiences) await syncRelationalData(tx, profileId, { experiences: profileData.experiences });
    if (profileData.projects) await syncRelationalData(tx, profileId, { projects: profileData.projects });
    if (profileData.skills) await syncRelationalData(tx, profileId, { skills: profileData.skills });
    
    // Academic results are managed exclusively by the verification worker.

    // 3. Update User's Profile Completion Flag
    await tx.user.update({
      where: { id: userId },
      data: { isProfileCompleted: isCompleted },
    });

    // 4. Return Full Profile
    return await tx.studentProfile.findUnique({
      where: { id: profileId },
      include: {
        socialLinks: true,
        experiences: true,
        projects: true,
        skills: true,
        additionalDetails: true,
      }
    });
  });
};

async function syncSemesterResults(tx: any, userId: number, results: any[]) {
  if (!results || results.length === 0) return;

  // Delete existing results for the user to ensure exact sync
  await tx.semesterResult.deleteMany({
    where: { userId },
  });

  const formattedResults = results.map((res: any) => ({
    ...res,
    userId,
  }));

  await tx.semesterResult.createMany({
    data: formattedResults,
  });
}


 async function syncRelationalData(
  tx: any,
  profileId: number,
  profileData: any
) {
  const relations = [
    {
      model: "socialLink",
      items: profileData.socialLinks,
    },
    {
      model: "experience",
      items: profileData.experiences,
    },
    {
      model: "project",
      items: profileData.projects,
    },
    {
      model: "skill",
      items: profileData.skills,
    },
    {
      model: "additionalDetail",
      items: profileData.additionalDetails,
    },
  ];

  for (const relation of relations) {
    const { model, items } = relation;

    // Only sync if items are provided (important for PATCH)
    if (items !== undefined) {
      // Remove existing records for this profile
      await tx[model].deleteMany({
        where: { profileId },
      });

      // Insert new records if provided
      if (items && items.length > 0) {
        const formattedData = items.map((item: any) => ({
          ...item,
          profileId,
        }));

        await tx[model].createMany({
          data: formattedData,
        });
      }
    }
  }
}


export const findProfileByUserId = (userId: number) => {
  return prisma.studentProfile.findUnique({ 
    where: { userId, deletedAt: null } 
  });
};


export const getFullStudentData = async (userId: number, tx: any = prisma) => {
  // We fetch via the User model to get both StudentProfile and SemesterResults
  return await tx.user.findUnique({
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
        }
      },
      semesters: {
        orderBy: { semester: 'asc' }
      }
    }
  });
};