import api from "@/services/api"

/**
 * Student Verification Service
 * Handles triggering the document verification process.
 */

export const initiateVerification = async () => {
  return api.post("/students/verification").then((r) => r.data.data)
}
