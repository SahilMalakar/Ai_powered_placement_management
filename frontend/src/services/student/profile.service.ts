import api from "@/services/api"
import { CreateProfileInput, UpdateProfileInput, StudentProfileData } from "@/types/profile"

/**
 * Student Profile Service
 * Handles fetching, creating, and updating student profile data.
 */

export const getProfile = async (): Promise<StudentProfileData> => {
  return api.get("/students/profile").then((r) => {
    const data = r.data.data;
    // Map the backend response to the frontend's expected nested structure
    return {
      email: data.user?.email || "",
      isProfileCompleted: data.user?.isProfileCompleted || false,
      profile: {
        ...data,
        socialLinks: data.socialLinks || [],
        experiences: data.experiences || [],
        projects: data.projects || [],
        skills: data.skills || [],
        additionalDetails: data.additionalDetails || [],
      },
      semesters: data.semesters || [],
      documents: data.documents || {
        sem1: null, sem2: null, sem3: null, sem4: null,
        sem5: null, sem6: null, sem7: null, sem8: null,
        other: []
      }
    };
  });
};

export const createProfile = async (data: CreateProfileInput) => {
  console.log("🚀 TRIGGERING CREATE PROFILE (POST)", data);
  return api.post("/students/profile", data).then((r) => {
    const data = r.data.data;
    return {
      email: data.user?.email || "",
      isProfileCompleted: data.user?.isProfileCompleted || false,
      profile: {
        ...data,
        socialLinks: data.socialLinks || [],
        experiences: data.experiences || [],
        projects: data.projects || [],
        skills: data.skills || [],
        additionalDetails: data.additionalDetails || [],
      },
      semesters: data.semesters || [],
      documents: data.documents || {
        sem1: null, sem2: null, sem3: null, sem4: null,
        sem5: null, sem6: null, sem7: null, sem8: null,
        other: []
      }
    };
  });
};

export const updateProfile = async (data: UpdateProfileInput) => {
  console.log("🚀 TRIGGERING UPDATE PROFILE (PATCH)", data);
  return api.patch("/students/profile", data).then((r) => {
    const data = r.data.data;
    return {
      email: data.user?.email || "",
      isProfileCompleted: data.user?.isProfileCompleted || false,
      profile: {
        ...data,
        socialLinks: data.socialLinks || [],
        experiences: data.experiences || [],
        projects: data.projects || [],
        skills: data.skills || [],
        additionalDetails: data.additionalDetails || [],
      },
      semesters: data.semesters || [],
      documents: data.documents || {
        sem1: null, sem2: null, sem3: null, sem4: null,
        sem5: null, sem6: null, sem7: null, sem8: null,
        other: []
      }
    };
  });
};
