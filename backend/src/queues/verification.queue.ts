import { Queue } from "bullmq";
import { getRedisConnection } from "../configs/redis.config.js";
import { InternalServerError } from "../utils/errors/httpErrors.js";

// Name of the queue for student document verification
export const VERIFICATION_QUEUE_NAME = "verificationQueue";

// Interface for the verification job payload
export interface VerificationJobPayload {
  userId: number;
}

// Initialize the Verification Queue with standard BullMQ options
export const verificationQueue = new Queue(VERIFICATION_QUEUE_NAME, {
  connection: getRedisConnection() as any,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

// Helper function to add a verification job using a deterministic jobId
export const addVerificationJob = async (userId: number) => {
  try {
    // Uses deterministic jobId to prevent duplicate processing for the same student
    const job = await verificationQueue.add(
      VERIFICATION_QUEUE_NAME, 
      { userId }, 
      { jobId: `verify_student_${userId}` }
    );
    return job;
  } catch (error: any) {
    console.error("[Verification Queue] Error adding job:", error.message);
    throw new InternalServerError("Failed to queue verification process.");
  }
};
