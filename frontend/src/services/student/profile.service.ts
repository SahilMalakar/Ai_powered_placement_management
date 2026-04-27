import api from "@/services/api"
import { CreateProfileInput, UpdateProfileInput, StudentProfileData } from "@/types/profile"

/**
 * Student Profile Service
 * Handles fetching, creating, and updating student profile data.
 */

export const getProfile = async (): Promise<StudentProfileData> => {
  return api.get("/students/profile").then((r) => r.data.data)
}

export const createProfile = async (data: CreateProfileInput) => {
  console.log("🚀 TRIGGERING CREATE PROFILE (POST)", data)
  return api.post("/students/profile", data).then((r) => r.data.data)
}

export const updateProfile = async (data: UpdateProfileInput) => {
  console.log("🚀 TRIGGERING UPDATE PROFILE (PATCH)", data)
  return api.patch("/students/profile", data).then((r) => r.data.data)
}
