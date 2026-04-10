import { z } from "zod";
import { VerificationStatus } from "../../prisma/generated/prisma/enums.js";

// Extraction schema for validating and transforming the raw PDF text into structured data
export const verificationRawTextSchema = z.string().transform((text, ctx) => {
  // Regex: Extracting Roll No, Name, and SGPA directly using Zod transforms
  const rollMatch = text.match(/Roll No\s*:\s*([A-Za-z0-9]+)/i);
  const nameMatch = text.match(/Name\s*:\s*([^\n]+)/i);
  const sgpaMatch = text.match(/SGPA\s*=\s*([\d.]+)/i);

  // Guard against null matches before accessing captured groups to prevent crashes
  if (!rollMatch || !nameMatch || !sgpaMatch) {
    ctx.addIssue({ code: "custom", message: "Required fields (Roll No/Name/SGPA) could not be extracted" });
    return z.NEVER;
  }

  // Pass extracted fields into the core schema for secondary validation (length, range, etc.)
  const result = verificationExtractionSchema.safeParse({
    rollNo: rollMatch[1]!.toLowerCase().trim(),
    name: nameMatch[1]!.toLowerCase().trim(),
    sgpa: sgpaMatch[1]!, // Let z.coerce.number() in the schema handle the parsing
  });

  // If the extracted data violates business rules (e.g. SGPA > 10), add those issues to the context
  if (!result.success) {
    // Spread the issue into a plain object to prevent internal Zod type conflicts
    result.error.issues.forEach((issue) => ctx.addIssue({ ...issue }));
    return z.NEVER;
  }

  return result.data;
});

// Final schema for individual field validation (Used for typing and secondary checks)
export const verificationExtractionSchema = z.object({
  rollNo: z.string().min(1, "Roll number not found in document"),
  name: z.string().min(1, "Name not found in document"),
  sgpa: z.coerce.number().min(0).max(10),
});

export type VerificationExtraction = z.infer<typeof verificationExtractionSchema>;

// log entry for tracking each document's verification status
export interface VerificationLogEntry {
  documentId: number;
  semester: number;
  extracted?: VerificationExtraction;
  isValid: boolean;
  flags: string[];
}

// Global verification result type for student profile updates
export interface VerificationResult {
  status: VerificationStatus; 
  requiresManualReview: boolean;
  totalDocuments: number;
  dbSgpaCount: number;
  falseNegativeCount: number;
  log: VerificationLogEntry[];
}
