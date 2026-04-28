import api from "@/services/api";
import { ProjectInput, UpdateProjectInput, Project } from "@/types/profile";

export const getProjects = async (): Promise<Project[]> => {
  return api.get("/students/projects").then((r) => r.data.data);
};

export const addProject = async (data: ProjectInput) => {
  return api.post("/students/projects", data).then((r) => r.data.data);
};

export const updateProject = async ({ id, data }: { id: number; data: UpdateProjectInput }) => {
  return api.patch(`/students/projects/${id}`, data).then((r) => r.data.data);
};

export const deleteProject = async (id: number) => {
  return api.delete(`/students/projects/${id}`).then((r) => r.data.data);
};
