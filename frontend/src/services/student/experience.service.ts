import api from "@/services/api";
import { ExperienceInput, UpdateExperienceInput, Experience } from "@/types/profile";

export const getExperiences = async (): Promise<Experience[]> => {
  console.log("📡 Calling GET /students/experiences");
  return api.get("/students/experiences").then((r) => r.data.data);
};

export const addExperience = async (data: ExperienceInput) => {
  return api.post("/students/experiences", data).then((r) => r.data.data);
};

export const updateExperience = async ({ id, data }: { id: number; data: UpdateExperienceInput }) => {
  return api.patch(`/students/experiences/${id}`, data).then((r) => r.data.data);
};

export const deleteExperience = async (id: number) => {
  return api.delete(`/students/experiences/${id}`).then((r) => r.data.data);
};
