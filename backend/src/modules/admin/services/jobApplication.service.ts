import type { ApplicationStatus } from "../../../prisma/generated/prisma/enums.js";
import type { UpdateApplicationStatusInput } from "../../../types/admin/jobApplication.js";
import type { NotificationTypes } from "../../../types/admin/notification.js";
import { BadRequestError, NotFoundError } from "../../../utils/errors/httpErrors.js";
import { getApplicantByJobIdRepository, bulkUpdateApplicationStatusRepository } from "../repositories/JobApplication.repository.js";
import { getJobById } from "../repositories/job.repository.js";
import { addBulkEmailsToQueue } from "../../../queues/notification.queue.js";

// ─── Valid state transitions ───────────────────────────────────────
// Only forward transitions trigger notifications.
// Rollbacks or re-applications are not allowed through this endpoint.
const VALID_TRANSITIONS: Record<string, ApplicationStatus[]> = {
    SHORTLISTED: ["APPLIED"],
    SELECTED: ["SHORTLISTED"],
    REJECTED: ["APPLIED", "SHORTLISTED"],
};

/**
 * Fetch all applicants for a specific job with pagination and filters.
 */
export const getJobApplicantsService = async (jobId: number, query: any) => {
    const job = await getJobById(jobId);
    if (!job) {
        throw new NotFoundError("Job Not Found");
    }
    return await getApplicantByJobIdRepository(jobId, query);
};


/**
 * Batch update application statuses with race-condition safety.
 *
 * 1. Validates forward-only state transitions.
 * 2. Delegates the atomic read+update to the repository (Serializable transaction).
 * 3. Queues email notifications only AFTER a successful commit.
 */
export const updateApplicationStatusService = async (data: UpdateApplicationStatusInput) => {
    const { applicationIds, status } = data;

    // 1. Validate that the requested status transition is allowed
    const fromStatuses = VALID_TRANSITIONS[status];
    if (!fromStatuses) {
        throw new BadRequestError(`Invalid status transition to "${status}"`);
    }

    // 2. Delegate atomic read+update to the repository
    const result = await bulkUpdateApplicationStatusRepository(applicationIds, status, fromStatuses);

    if (result.count === 0) {
        throw new BadRequestError("No applications eligible for this status change");
    }

    // 3. Queue email notifications AFTER successful commit (fire-and-forget)
    const notifications: NotificationTypes[] = result.apps.map((app) => {
        let subject = "";
        let statusMessage = "";

        if (status === "SHORTLISTED") {
            subject = `Congratulations! You've been shortlisted for ${app.job.title}`;
            statusMessage = "You have been shortlisted for the next round.";
        } else if (status === "SELECTED") {
            subject = `Congratulations! You've been selected for ${app.job.title}`;
            statusMessage = "You have been selected! Please check the portal for further instructions.";
        } else if (status === "REJECTED") {
            subject = `Update regarding your application for ${app.job.title}`;
            statusMessage = `Thank you for your interest in ${app.job.company}. After careful consideration, we will not be moving forward with your application at this time.`;
        }

        return {
            to: app.user.email,
            subject,
            templateId: "application-status",
            params: {
                studentName: app.user.profile?.fullName ?? "Student",
                jobTitle: app.job.title,
                companyName: app.job.company,
                status: status,
                statusMessage,
            },
        };
    });

    addBulkEmailsToQueue(notifications).catch((err) =>
        console.error("⚠️ Failed to queue status notification emails:", err)
    );

    return {
        updated: result.count,
        total: applicationIds.length,
        skipped: applicationIds.length - result.count,
    };
};