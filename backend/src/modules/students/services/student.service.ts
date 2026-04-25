import type {
    CreateProfileInput,
    UpdateProfileInput,
} from '../../../types/students/profile.js';
import {
    createProfileWithTransaction,
    findProfileByUserId,
    getFullStudentData,
    updateProfileWithTransaction,
} from '../repositories/student.repository.js';
import {
    BadRequestError,
    ConflictError,
    ForbiddenError,
    NotFoundError,
} from '../../../utils/errors/httpErrors.js';
import { getRedisConnectionForCaching } from '../../../configs/redis.config.js';
import { CACHE_KEYS } from '../../../utils/cacheKeys.js';
import { VerificationStatus } from '../../../prisma/generated/prisma/enums.js';

// Fetch the authenticated student's full profile for the UI.
export const getStudentProfileService = async (userId: number) => {
    const cacheKey = CACHE_KEYS.STUDENT_PROFILE(userId);
    const cacheClient = getRedisConnectionForCaching();

    // Try Cache Hit
    const cachedProfile = await cacheClient.get(cacheKey);
    if (cachedProfile) {
        console.log('🚀 Cache Hit: ', cacheKey);
        return JSON.parse(cachedProfile);
    }

    // Cache Miss
    console.log('⚡ Cache Miss: ', cacheKey);
    const fullData = await getFullStudentData(userId);
    if (!fullData?.profile) {
        throw new NotFoundError('Profile not found. Please create one.');
    }

    // Set Cache with 10-minute TTL
    await cacheClient.set(cacheKey, JSON.stringify(fullData), 'EX', 600);

    return fullData;
};

export const updateStudentProfile = async (
    userId: number,
    updateData: UpdateProfileInput
) => {
    console.log('updateData', updateData);
    // 1. Strict Academic Guard: Block manual entry of verified-only data
    await checkForRestrictedFields(updateData);

    // 2. Ensure profile exists
    const existing = await getFullStudentData(userId);
    if (!existing?.profile) {
        throw new NotFoundError(
            'Profile not found. Use POST /profile to create it first.'
        );
    }

    // Lock Guard: Block updates if verification is processing
    if (existing.profile.verificationStatus === VerificationStatus.PROCESSING) {
        throw new ForbiddenError(
            'Profile cannot be updated while verification is in progress.'
        );
    }

    const {
        socialLinks,
        experiences,
        projects,
        skills,
        additionalDetails,
        id: _id,
        userId: _userId,
        verificationStatus: _status,
        verificationReason: _reason,
        createdAt: _createdAt,
        updatedAt: _updatedAt,
        deletedAt: _deletedAt,
        ...coreExisting
    } = existing.profile as Record<string, any>;

    // Process Completion Status using cleaned core data
    const mergedData = {
        // Preserve existing arrays if they aren't being updated in this request
        socialLinks: updateData.socialLinks ?? cleanRelation(socialLinks),
        experiences: updateData.experiences ?? cleanRelation(experiences),
        projects: updateData.projects ?? cleanRelation(projects),
        skills: updateData.skills ?? cleanRelation(skills),
        additionalDetails:
            updateData.additionalDetails ?? cleanRelation(additionalDetails),

        core: { ...coreExisting, ...updateData.core },
    };

    const { isCompleted, processedData } = await prepareProfileData(
        userId,
        mergedData as CreateProfileInput,
        existing.profile.verificationStatus
    );

    // Persistence
    console.log('processedData', processedData);
    const result = await updateProfileWithTransaction(
        userId,
        processedData,
        isCompleted
    );

    // Cache Invalidation (Session & Profile) - Best Effort
    try {
        const cacheClient = getRedisConnectionForCaching();
        const sessionKey = CACHE_KEYS.USER_SESSION(userId);
        const profileKey = CACHE_KEYS.STUDENT_PROFILE(userId);

        await Promise.all([
            cacheClient.del(sessionKey),
            cacheClient.del(profileKey),
        ]);
        console.log('🧹 Cache Invalidated: ', { sessionKey, profileKey });
    } catch (error) {
        console.error('❌ Cache Invalidation Failed:', error);
    }

    return result;
};

export const createStudentProfileService = async (
    userId: number,
    studentData: CreateProfileInput
) => {
    console.log('studentData', studentData);
    // 1. Strict Academic Guard: Block manual entry of verified-only data
    await checkForRestrictedFields(studentData);

    // 2. Prevent duplicate profiles
    const existing = await findProfileByUserId(userId);
    if (existing) {
        throw new ConflictError('Profile already exists use update instead');
    }

    // Process data (Completion status) - New profiles are NOT_VERIFIED by default
    const { isCompleted, processedData } = await prepareProfileData(
        userId,
        studentData,
        VerificationStatus.NOT_VERIFIED
    );

    // persistence via Transaction
    const result = await createProfileWithTransaction(
        userId,
        processedData,
        isCompleted
    );

    // Cache Invalidation (Session & Profile) - Best Effort
    try {
        const cacheClient = getRedisConnectionForCaching();
        const sessionKey = CACHE_KEYS.USER_SESSION(userId);
        const profileKey = CACHE_KEYS.STUDENT_PROFILE(userId);

        await Promise.all([
            cacheClient.del(sessionKey),
            cacheClient.del(profileKey),
        ]);
        console.log('🧹 Cache Invalidated: ', { sessionKey, profileKey });
    } catch (error) {
        console.error('❌ Cache Invalidation Failed:', error);
    }

    return result;
};

async function prepareProfileData(
    userId: number,
    studentData: CreateProfileInput,
    currentStatus: VerificationStatus
) {
    const { ...allOtherData } = studentData;

    const coreFields = {
        ...allOtherData.core,
        // Academic fields are READ-ONLY and populated via verification worker
    };

    // mandatory field checks for isProfileCompleted
    const mandatoryFields = [
        'fullName',
        'branch',
        'rollNo',
        'dob',
        'phoneNumber',
    ];

    // Check basic field completion
    const checklistMatched = mandatoryFields.every((field) => {
        const value = coreFields[field as keyof typeof coreFields];
        return value !== null && value !== undefined && value !== '';
    });

    // A profile is ONLY complete if basic fields are filled AND verification is successful
    const isCompleted =
        checklistMatched && currentStatus === VerificationStatus.VERIFIED;

    const processedData = {
        core: coreFields,
        // We do NOT take semesterResults here; they come from Verification worker
        socialLinks: allOtherData.socialLinks,
        experiences: allOtherData.experiences,
        projects: allOtherData.projects,
        skills: allOtherData.skills,
        additionalDetails: allOtherData.additionalDetails,
    };

    return { isCompleted, processedData };
}

/**
 * Helper to identify and block restricted academic fields in student requests.
 */
async function checkForRestrictedFields(
    data: CreateProfileInput | UpdateProfileInput
) {
    const core = data.core;
    const restrictedFound =
        (core &&
            ('astuRollNo' in core ||
                'cgpa' in core ||
                'backlog' in core ||
                'backlogSubjects' in core ||
                'verificationStatus' in core ||
                'verificationReason' in core)) ||
        (data as Record<string, unknown>).semesterResults;

    if (restrictedFound) {
        throw new BadRequestError(
            'Academic data (SGPAs, CGPA, ASTU Roll No, Backlog Status) is protected and can only be updated via the Document Verification process.'
        );
    }
}

/**
 * Strips database-specific fields (id, profileId) from existing relational data
 * to ensure safe re-insertion during updates.
 */
function cleanRelation(items: any) {
    return Array.isArray(items)
        ? items.map(({ id, profileId, ...rest }: any) => rest)
        : [];
}
