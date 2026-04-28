import type {
    CreateProfileInput,
    UpdateProfileInput,
} from '../../../types/students/profile.js';
import {
    createStudentProfileRepo,
    getProfileRepo,
    updateStudentProfileRepo,
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
import { invalidateStudentCache } from '../../../utils/cacheInvalidation.js';

// get profile + user service
export const getStudentProfileService = async (userId: number) => {
    const cacheKey = CACHE_KEYS.STUDENT_CORE(userId)
    const cacheClient = getRedisConnectionForCaching();

    const cachedData = await cacheClient.get(cacheKey);
    if (cachedData) {
        console.log('🎯cache hit')
        // redis(string) ----> json
        return JSON.parse(cachedData)
    }

    // fetch the profile with user.email + role for caching
    const profile = await getProfileRepo(userId)

    if (!profile) {
        throw new NotFoundError("Profile not found. Please create one.")
    }

    // redis store cache in string format with 5 minutes TTL
    await cacheClient.set(cacheKey, JSON.stringify(profile), `EX`, 5 * 60)

    return profile
}

// create profile service
export const createStudentProfileService = async (
    userId: number,
    profileData: CreateProfileInput
) => {
    await validateAcademicProtection(profileData)

    const cacheKey = CACHE_KEYS.STUDENT_CORE(userId)
    const cacheClient = getRedisConnectionForCaching();

    // prevent duplicate profiles
    const existing = await getProfileRepo(userId);
    if (existing) {
        throw new ConflictError('Profile already exists');
    }

    // mandatory fields for isProfileComplete to true
    const mandatoryFields = [
        'fullName',
        'branch',
        'dob',
        'rollNo',
        'university',
        'phoneNumber',
        'graduationYear'
    ];

    // isCompleted is false if any mandatory field is not present in profileData
    const isCompleted = mandatoryFields.every(
        (field) => {
            const value = (profileData as any)[field];
            return value != undefined && value != null && String(value).trim() !== ""
        }
    );

    const result = await createStudentProfileRepo(userId, profileData, isCompleted)

    // add to cache
    await cacheClient.set(cacheKey, JSON.stringify(result), `EX`, 5 * 60)

    return result
}


export const updateStudentProfileService = async (
    userId: number,
    profileData: UpdateProfileInput
) => {
    await validateAcademicProtection(profileData)

    // find the profile if exist
    const existing = await getProfileRepo(userId);
    if (!existing) {
        throw new NotFoundError("Profile Not Found")
    }

    // check wether the profile is under verification 
    if (existing.verificationStatus === VerificationStatus.PROCESSING) {
        throw new ForbiddenError("Profile under Verification, you cannot update it now")
    }

    const mandatoryFields = [
        'fullName', 'branch', 'dob', 'rollNo', 'university', 'phoneNumber', 'graduationYear'
    ];
    // Check completion against MERGED data
    const isCompleted = mandatoryFields.every((field) => {
        // 1. Check if the field exists in the update request
        const isProvidedInUpdate = (profileData as any)[field] !== undefined;

        // 2. Use the new value if provided, otherwise the existing one
        const value = isProvidedInUpdate
            ? (profileData as any)[field]
            : (existing as any)[field];
        // 3. A field is "valid" only if it's not null, not undefined, and not an empty string
        return value !== undefined && value !== null && String(value).trim() !== "";
    });

    // update the student
    const result = await updateStudentProfileRepo(
        userId,
        profileData,
        isCompleted
    )

    // invalidate cache
    await invalidateStudentCache(userId)

    return result
}


// Security Guard: Prevents students from manually injecting academic data 
// that must only be updated via the official Document Verification process.
async function validateAcademicProtection(data: Record<string, any>) {
    const restrictedFields = [
        'cgpa',
        'astuRollNo',
        'backlog',
        'backlogSubjects',
        'verificationStatus',
        'verificationReason'
    ];

    const foundField = restrictedFields.find(field => field in data);

    if (foundField) {
        throw new BadRequestError(
            `The field '${foundField}' is protected. Academic records can only be modified via the Document Verification process.`
        );
    }
}
