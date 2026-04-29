import api from "@/services/api"
import { CreateProfileInput, UpdateProfileInput, StudentProfileData } from "@/types/profile"

/**
 * Student Profile Service
 * Handles fetching, creating, and updating student profile data.
 */

const transformResponse = (data: any): StudentProfileData => {
  const profile = data;
  const user = data.user || {};

  return {
    email: user.email || "",
    isProfileCompleted: user.isProfileCompleted || false,
    profile: {
      ...profile,
    },
  };
};

export const getProfile = async (): Promise<StudentProfileData> => {
  return api.get("/students/profile").then((r) => transformResponse(r.data.data));
};

export const createProfile = async (data: any) => {
  const payload = data.core ? { ...data.core } : { ...data };
  return api.post("/students/profile", payload).then((r) => transformResponse(r.data.data));
};

export const updateProfile = async (data: any) => {
  const payload = data.core ? { ...data.core } : { ...data };
  return api.patch("/students/profile", payload).then((r) => transformResponse(r.data.data));
};

export const getAcademicRecord = async () => {
  return api.get("/students/profile/academic").then((r) => r.data.data);
};
