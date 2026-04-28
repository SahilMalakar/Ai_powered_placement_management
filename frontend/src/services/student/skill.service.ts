import api from "@/services/api";
import { SkillInput, UpdateSkillInput, Skill } from "@/types/profile";

export const getSkills = async (): Promise<Skill[]> => {
  return api.get("/students/skills").then((r) => r.data.data);
};

export const addSkill = async (data: SkillInput) => {
  return api.post("/students/skills", data).then((r) => r.data.data);
};

export const updateSkill = async ({ id, data }: { id: number; data: UpdateSkillInput }) => {
  return api.patch(`/students/skills/${id}`, data).then((r) => r.data.data);
};

export const deleteSkill = async (id: number) => {
  return api.delete(`/students/skills/${id}`).then((r) => r.data.data);
};
