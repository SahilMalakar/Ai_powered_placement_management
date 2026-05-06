import api from "@/services/api";
import { ProjectInput, UpdateProjectInput, Project } from "@/types/student/profile";

export const getProjects = async (): Promise<Project[]> => {
  return api.get("/students/profile/project").then((r) => r.data.data);
};

export const addProject = async (data: ProjectInput) => {
  return api.post("/students/profile/project", data).then((r) => r.data.data);
};

export const updateProject = async ({ id, data }: { id: number; data: UpdateProjectInput }) => {
  return api.patch(`/students/profile/project/${id}`, data).then((r) => r.data.data);
};

export const deleteProject = async (id: number) => {
  return api.delete(`/students/profile/project/${id}`).then((r) => r.data.data);
};
