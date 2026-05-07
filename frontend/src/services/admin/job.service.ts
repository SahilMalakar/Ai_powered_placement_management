import {
  CreateJobInput,
  UpdateJobInput,
  AdminJobResponse,
  SingleJobResponse,
} from "@/types/admin/job";
import api from "@/services/api";

export const adminJobService = {
  getAllJobs: async (filters: any = {}): Promise<AdminJobResponse> => {
    const response = await api.get("/admin/job", { params: filters });
    return response.data;
  },

  getJobById: async (id: string): Promise<SingleJobResponse> => {
    const response = await api.get(`/admin/job/${id}`);
    return response.data;
  },

  createJob: async (data: CreateJobInput): Promise<SingleJobResponse> => {
    // Convert string deadline to ISO Date for backend
    const payload = {
      ...data,
      deadline: new Date(data.deadline).toISOString(),
    };
    const response = await api.post("/admin/job", payload);
    return response.data;
  },

  updateJob: async (id: string, data: UpdateJobInput): Promise<SingleJobResponse> => {
    const payload = {
      ...data,
      deadline: data.deadline ? new Date(data.deadline).toISOString() : undefined,
    };
    const response = await api.patch(`/admin/job/${id}`, payload);
    return response.data;
  },

  activateJob: async (id: string): Promise<SingleJobResponse> => {
    const response = await api.post(`/admin/job/${id}/activate`);
    return response.data;
  },

  deactivateJob: async (id: string): Promise<SingleJobResponse> => {
    const response = await api.post(`/admin/job/${id}/deactivate`);
    return response.data;
  },

  deleteJob: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/admin/job/${id}`);
    return response.data;
  },

  getApplicationDashboard: async (): Promise<any> => {
    const response = await api.get("/admin/job/dashboard");
    return response.data;
  },
};
