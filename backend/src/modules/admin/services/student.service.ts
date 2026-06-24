import { getRedisConnectionForCaching } from "../../../infra/redis.config.js";
import { CACHE_KEYS } from "../../../shared/utils/cacheKeys.js";
import type { GetAllStudentsQueryInput } from "../../../shared/types/admin/student.js";
import { NotFoundError } from "../../../shared/utils/errors/httpErrors.js";
import { getAllStudentRepository, getStudentByIdRepository, softDeleteStudentRepository, reactivateStudentRepository } from "../repositories/students.repository.js";

export const getAllStudentService = async (query: GetAllStudentsQueryInput) => {
    // get all the students from the database
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const { search, branch, cgpa, backlogAllowed, verificationStatus } = query;

    const cacheKey = `${CACHE_KEYS.ADMIN_STUDENTS_LIST}:${JSON.stringify(query)}`;

    try {
        const cacheClient = getRedisConnectionForCaching();

        // Try Cache Hit
        const cachedData = await cacheClient.get(cacheKey);
        if (cachedData) {
            console.log('🚀 Admin Student List Cache Hit: ', cacheKey);
            return JSON.parse(cachedData);
        }

        // Cache Miss
        console.log('⚡ Admin Student List Cache Miss: ', cacheKey);
        const { students, totalCount } = await getAllStudentRepository({
            skip,
            search,
            branch,
            cgpa,
            backlogAllowed,
            verificationStatus,
            page,
            limit,
        })

        const result = {
            students,
            pagination: {
                totalCount,
                page,
                limit,
                totalPages: Math.ceil(totalCount / limit)
            }
        };

        // Set Cache with 5-minute TTL
        await cacheClient.set(cacheKey, JSON.stringify(result), 'EX', 300);

        return result;
    } catch (error) {
        console.error('⚠️ Redis Cache Failure (Fallback to DB):', error);
        // FAIL-SAFE: Fallback to Database
        const { students, totalCount } = await getAllStudentRepository({
            skip,
            search,
            branch,
            cgpa,
            backlogAllowed,
            verificationStatus,
            page,
            limit,
        })

        return {
            students,
            pagination: {
                totalCount,
                page,
                limit,
                totalPages: Math.ceil(totalCount / limit)
            }
        };
    }
}

export const getStudentByIdService = async (studentId: number) => {
    const cacheKey = CACHE_KEYS.ADMIN_STUDENT_DETAILS(studentId);

    try {
        const cacheClient = getRedisConnectionForCaching();

        // Try Cache Hit
        const cachedStudent = await cacheClient.get(cacheKey);
        if (cachedStudent) {
            console.log('🚀 Admin Student Detail Cache Hit: ', cacheKey);
            return JSON.parse(cachedStudent);
        }

        // Cache Miss
        console.log('⚡ Admin Student Detail Cache Miss: ', cacheKey);
        const student = await getStudentByIdRepository(studentId);

        if (!student) {
            throw new NotFoundError("Student not Found")
        }

        // Set Cache with 10-minute TTL (Student details change less frequently)
        await cacheClient.set(cacheKey, JSON.stringify(student), 'EX', 600);

        return student;
    } catch (error) {
        if (error instanceof NotFoundError) throw error;

        console.error('⚠️ Redis Cache Failure (Fallback to DB):', error);
        // FAIL-SAFE: Fallback to Database
        const student = await getStudentByIdRepository(studentId);

        if (!student) {
            throw new NotFoundError("Student not Found")
        }

        return student;
    }
}


export const softDeleteStudentService = async (studentId: number) => {
    const student = await softDeleteStudentRepository(studentId);

    if (!student) {
        throw new NotFoundError("Student not Found")
    }

    // Cache Invalidation
    try {
        const cacheClient = getRedisConnectionForCaching();
        const keys = await cacheClient.keys(`${CACHE_KEYS.ADMIN_STUDENTS_LIST}*`);
        if (keys.length > 0) {
            await cacheClient.del(keys);
            console.log(`🧹 Student List Cache Invalidated (${keys.length} keys)`);
        }
        await cacheClient.del(CACHE_KEYS.ADMIN_STUDENT_DETAILS(studentId));
        console.log(`🧹 Student Detail Cache Invalidated: ${CACHE_KEYS.ADMIN_STUDENT_DETAILS(studentId)}`);
    } catch (error) {
        console.error('❌ Cache Invalidation Failed (Deactivate):', error);
    }

    return student;
}

export const reactivateStudentService = async (studentId: number) => {
    const student = await reactivateStudentRepository(studentId);

    if (!student) {
        throw new NotFoundError("Student not Found or already active")
    }

    // Cache Invalidation
    try {
        const cacheClient = getRedisConnectionForCaching();
        const keys = await cacheClient.keys(`${CACHE_KEYS.ADMIN_STUDENTS_LIST}*`);
        if (keys.length > 0) {
            await cacheClient.del(keys);
            console.log(`🧹 Student List Cache Invalidated (${keys.length} keys)`);
        }
        await cacheClient.del(CACHE_KEYS.ADMIN_STUDENT_DETAILS(studentId));
        console.log(`🧹 Student Detail Cache Invalidated: ${CACHE_KEYS.ADMIN_STUDENT_DETAILS(studentId)}`);
    } catch (error) {
        console.error('❌ Cache Invalidation Failed (Reactivate):', error);
    }

    return student;
}