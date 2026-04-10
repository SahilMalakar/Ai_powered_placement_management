import { z } from "zod";
import { VerificationStatus } from "../../prisma/generated/prisma/enums.js";

/**
 * Schema for data extracted from a single marksheet.
 */
export const verificationExtractionSchema = z.object({
  rollNo: z.string().min(1, "Roll number not found in document"),
  name: z.string().min(1, "Name not found in document"),
  sgpa: z.coerce.number().min(0).max(10),
});

export type VerificationExtraction = z.infer<typeof verificationExtractionSchema>;

/**
 * Itemized log entry for a single document's verification attempt.
 */
export interface VerificationLogEntry {
  documentId: number;
  semester: number;
  extracted?: VerificationExtraction;
  isValid: boolean;
  flags: string[];
}

/**
 * Result of the overall verification process.
 */
export interface VerificationResult {
  status: VerificationStatus; 
  requiresManualReview: boolean;
  totalDocuments: number;
  dbSgpaCount: number;
  falseNegativeCount: number;
  log: VerificationLogEntry[];
}
