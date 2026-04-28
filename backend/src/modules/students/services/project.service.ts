import { 
    addProjectRepo, 
    deleteProjectRepo, 
    findProjectByIdRepo, 
    getProjectsByProfileIdRepo, 
    updateProjectRepo 
} from "../repositories/project.repository.js";
import { getProfileRepo } from "../repositories/student.repository.js";
import { ForbiddenError, NotFoundError } from "../../../utils/errors/httpErrors.js";
import type { ProjectInput, UpdateProjectInput } from "../../../types/students/profile.js";
import { VerificationStatus } from "../../../prisma/generated/prisma/enums.js";
import { invalidateProjectCache } from "../../../utils/cacheInvalidation.js";
import { CACHE_KEYS } from "../../../utils/cacheKeys.js";
import { getRedisConnectionForCaching } from "../../../configs/redis.config.js";

export const addProjectService = async (userId: number, data: ProjectInput) => {
    const profile = await getProfileRepo(userId);
    if (!profile) throw new NotFoundError("Profile not found. Please create one first.");

    if (profile.verificationStatus === VerificationStatus.PROCESSING) {
        throw new ForbiddenError("Cannot add project while profile is under verification.");
    }

    const result = await addProjectRepo(profile.id, data);
    await invalidateProjectCache(userId);
    return result;
};

export const updateProjectService = async (userId: number, projectId: number, data: UpdateProjectInput) => {
    const project = await findProjectByIdRepo(projectId);
    if (!project) throw new NotFoundError("Project not found.");

    if (project.profile.userId !== userId) {
        throw new ForbiddenError("You do not have permission to update this project.");
    }

    const profile = await getProfileRepo(userId);
    if (profile?.verificationStatus === VerificationStatus.PROCESSING) {
        throw new ForbiddenError("Cannot update project while profile is under verification.");
    }

    const result = await updateProjectRepo(projectId, data);
    await invalidateProjectCache(userId);
    return result;
};

export const deleteProjectService = async (userId: number, projectId: number) => {
    const project = await findProjectByIdRepo(projectId);
    if (!project) throw new NotFoundError("Project not found.");

    if (project.profile.userId !== userId) {
        throw new ForbiddenError("You do not have permission to delete this project.");
    }

    const profile = await getProfileRepo(userId);
    if (profile?.verificationStatus === VerificationStatus.PROCESSING) {
        throw new ForbiddenError("Cannot delete project while profile is under verification.");
    }

    await deleteProjectRepo(projectId);
    await invalidateProjectCache(userId);
    return { success: true, message: "Project deleted successfully." };
};

export const getProjectsService = async (userId: number) => {
    const cacheKey = CACHE_KEYS.STUDENT_PROJECTS(userId);
    const cacheClient = getRedisConnectionForCaching();

    // check cache first
    const cached = await cacheClient.get(cacheKey);
    if (cached) {
        console.log(`🎯 Cache HIT: ${cacheKey}`);
        return JSON.parse(cached);
    }

    console.log(`⚪ Cache MISS: ${cacheKey}`);

    const profile = await getProfileRepo(userId);
    if (!profile) throw new NotFoundError("Profile not found.");

    const projects = await getProjectsByProfileIdRepo(profile.id);

    // cache for 5 minutes
    await cacheClient.set(cacheKey, JSON.stringify(projects), "EX", 5 * 60);

    return projects;
};
