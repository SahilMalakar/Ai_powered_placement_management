import { 
  getSgpaDocumentsCount,  
  updateVerificationStatus,
  transitionToProcessing
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
  // 1. Check if user profile exists
  const profile = await findProfileByUserId(userId);
  if (!profile) throw new NotFoundError("Student profile not found.");

  // 2 & 4. Atomic Idempotency & Status Update (via Repository)
  const success = await transitionToProcessing(userId);

  if (!success) {
    throw new ConflictError("Verification is already processing or has been completed.");
  }

  // 3. Document Availability Check
  const sgpaDocsCount = await getSgpaDocumentsCount(userId);

  if (sgpaDocsCount === 0) {
    // Rollback if no docs (though status block ensures we are safe)
    await updateVerificationStatus(userId, VerificationStatus.NOT_VERIFIED);
    throw new BadRequestError("No SGPA marksheets found. Please upload at least one marksheet to initiate verification.");
  }

  try {
    // Dispatch the background job to start PDF text extraction and Regex matching
    await addVerificationJob(userId);
  } catch (error) {
    // Rollback status if queueing fails to prevent student from being "stuck"
    await updateVerificationStatus(userId, profile.verificationStatus);
    throw error;
  }

  return {
    status: VerificationStatus.PROCESSING,
    message: "Verification initiated successfully. Documents are in processing queue."
  };
};
