import { applyToJobWithTransaction, getApplicationRepo } from '../repositories/application.repository.js';
import { applicationSnapshotSchema } from '../../../types/students/application.js';
import type { ApplicationSnapshot } from '../../../types/students/application.js';

/**
 * Handles the high-level logic for applying to a job.
 * Orchestration resides in the repository layer to ensure atomicity.
 */
export const applyToJobService = async (userId: number, jobId: number) => {
    /**
     * Generates the immutable snapshot for the application.
     * Uses Zod to parse/validate the snapshot BEFORE it hits the repository.
     */
    const generateSnapshot = (profile: any, job: any): ApplicationSnapshot => {
        const rawSnapshot = {
            fullName: profile.fullName,
            branch: String(profile.branch), // Explicit cast to string for long-term snapshot stability
            cgpa: profile.cgpa,
            backlog: profile.backlog,
            backlogSubjects: profile.backlogSubjects,
            astuRollNo: profile.astuRollNo,
            rollNo: profile.rollNo,
            verificationStatus: String(profile.verificationStatus),

            // Enriched requirements for audit trail
            appliedAgainstCgpa: job.requiredCgpa,
            allowedBranches: job.allowedBranches.map((b: any) => String(b)),
            backlogAllowed: job.backlogAllowed,

            appliedAt: new Date().toISOString(),
        };

        // Final Robustness Check: Ensure snapshot matches our contract
        return applicationSnapshotSchema.parse(rawSnapshot);
    };

    // Execute through the repository's transaction wrapper
    const application = await applyToJobWithTransaction(
        userId,
        jobId,
        generateSnapshot
    );

    return application;
};


export const getApplicationService = async(userId:number)=>{
    const application = await getApplicationRepo(userId)
    return application
}