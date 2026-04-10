import { 
  getSgpaDocumentsCount, 
  getSemesterResultsCount, 
  updateVerificationStatus 
} from "../repositories/verification.repository.js";
import { findProfileByUserId } from "../repositories/student.repository.js";
import { addVerificationJob } from "../../../queues/verification.queue.js";
import { BadRequestError, ConflictError, NotFoundError } from "../../../utils/errors/httpErrors.js";
import { VerificationStatus } from "../../../prisma/generated/prisma/enums.js";

/**
 * Service to initiate the verification process.
 * Performs idempotency and completeness checks before marking as PROCESSING.
 */
export const initiateVerificationService = async (userId: number) => {
  // 1. Fetch Profile using student repository
  const profile = await findProfileByUserId(userId);

  if (!profile) {
    throw new NotFoundError("Student profile not found.");
  }

  // 2. Idempotency Check
  if (profile.verificationStatus === VerificationStatus.PROCESSING || profile.verificationStatus === VerificationStatus.VERIFIED) {
    throw new ConflictError(`Verification is already ${profile.verificationStatus.toLowerCase()}.`);
  }

  // 3. Document Completeness Check
  const [sgpaDocsCount, sgpaResultsCount] = await Promise.all([
    getSgpaDocumentsCount(userId),
    getSemesterResultsCount(userId)
  ]);

  if (sgpaResultsCount === 0) {
    throw new BadRequestError("No SGPA results found in profile to verify.");
  }

  if (sgpaDocsCount !== sgpaResultsCount) {
    throw new BadRequestError(`Document completeness failed: You have ${sgpaResultsCount} semesters entered but only uploaded ${sgpaDocsCount} valid marksheets.`);
  }

  // 4. Update status to PROCESSING using verification repository
  const updatedProfile = await updateVerificationStatus(userId, VerificationStatus.PROCESSING);

  try {
    // Dispatch the background job to start PDF text extraction and Regex matching
    await addVerificationJob(userId);
  } catch (error) {
    // Rollback status if queueing fails to prevent student from being "stuck"
    await updateVerificationStatus(userId, profile.verificationStatus);
    throw error;
  }

  return {
    status: updatedProfile.verificationStatus,
    message: "Verification initiated successfully. Documents are in processing queue."
  };
};

/**
 * Helper to validate text extraction results against database (Regex-based).
 * This will be moved/used by the worker in later steps.
 */
// export const validateExtractionContent = ... (Planned for Step 3)
