import api from "@/services/api";
import { ExperienceInput, UpdateExperienceInput, Experience } from "@/types/student/profile";

export const getExperiences = async (): Promise<Experience[]> => {
  return api.get("/students/profile/experience").then((r) => r.data.data);
};

export const addExperience = async (data: ExperienceInput) => {
  return api.post("/students/profile/experience", data).then((r) => r.data.data);
};

export const updateExperience = async ({ id, data }: { id: number; data: UpdateExperienceInput }) => {
  return api.patch(`/students/profile/experience/${id}`, data).then((r) => r.data.data);
};

export const deleteExperience = async (id: number) => {
  return api.delete(`/students/profile/experience/${id}`).then((r) => r.data.data);
};
