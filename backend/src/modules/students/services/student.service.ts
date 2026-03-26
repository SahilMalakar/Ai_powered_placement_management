import type { CreateProfileInput, UpdateProfileInput } from "../../../types/students/profile.js";
import { createProfileWithTransaction, findProfileByUserId, getFullStudentData, updateProfileWithTransaction } from "../repositories/student.repository.js";
import { BadRequestError, ConflictError, NotFoundError } from "../../../utils/errors/httpErrors.js";


// Fetch the authenticated student's full profile for the UI.
export const getStudentProfileService = async (userId: number) => {
    const fullData = await getFullStudentData(userId);
    if (!fullData?.profile) {
        throw new NotFoundError("Profile not found. Please create one.");
    }
    return fullData;
};


export const updateStudentProfile = async (userId: number, updateData: UpdateProfileInput) => {
    // Ensure profile exists
    const existing = await getFullStudentData(userId);
    if (!existing?.profile) {
        throw new NotFoundError("Profile not found. Use POST /profile to create it first.");
    }

    // Process new CGPA and Completion Status
    // Merge existing data with new data for calculation
    const mergedData = {
        core: { ...existing.profile, ...updateData.core },
        semesterResults: updateData.semesterResults || (existing.semesters as any[])
    };

    const { isCompleted, processedData } = await prepareProfileData(userId, mergedData as any);

    // Persistence
    return await updateProfileWithTransaction(
        userId,
        processedData,
        isCompleted
    );
};

export const createStudentProfileService = async (
    userId: number,
    studentData: CreateProfileInput) => {

    // prevent duplicate profiles
    const existing = await findProfileByUserId(userId);
    if (existing) {
        throw new ConflictError("Profile already exists use update instead");
    }

    // Process data (CGPA calculation & Completion status)
    const { isCompleted, processedData } = await prepareProfileData(userId, studentData);

    // validate backlog logic 
    if (processedData.core.backlog === true && (!processedData.core.backlogSubjects || processedData.core.backlogSubjects.length === 0)) {
        throw new BadRequestError("Backlog subjects are required when backlog is true");
    }

    // persistence via Trasaction
    return await createProfileWithTransaction(userId, processedData, isCompleted);
}


async function prepareProfileData(
    userId: number,
    studentData: CreateProfileInput
) {
    const { semesterResults, ...allOtherData } = studentData;

    // Calculate CGPA from available semester results (SGPAs)
    let calculatedCgpa = null;

    if (semesterResults?.length) {
        const sum = semesterResults.reduce(
            (acc: number, curr) => acc + curr.sgpa,
            0
        );

        calculatedCgpa = parseFloat(
            (sum / semesterResults.length).toFixed(2)
        );
    }

    const coreFields = {
        ...allOtherData.core,
        cgpa: calculatedCgpa
    };

    // madatory field checks for isProfileCompleted
    const manadatoryFields = [
        "fullName",
        "branch",
        "rollNo",
        "astuRollNo",
        "dob",
        "phoneNumber",
        "cgpa",
        "backlog"
    ];

    // return false if any condition fails
    const isCompleted = manadatoryFields.every((field) => {
        const value = coreFields[field as keyof typeof coreFields];
        // Allow boolean 'false' as a valid value (important for 'backlog' field)
        return value !== null && value !== undefined && value !== "";
    });

    const processedData = {
        core: coreFields,
        semesterResults,
        socialLinks: allOtherData.socialLinks,
        experiences: allOtherData.experiences,
        projects: allOtherData.projects,
        skills: allOtherData.skills
    };

    return { isCompleted, processedData };
}