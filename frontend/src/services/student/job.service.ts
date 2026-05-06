import api from "@/services/api";
import { JobFilters, JobsResponse } from "@/types/student/job";

export const getJobs = async (filters: JobFilters): Promise<JobsResponse> => {
  const response = await api.get('/admin/job', { params: filters });
  return response.data.data;
};

export const getJobById = async (id: number): Promise<any> => {
  const response = await api.get(`/admin/job/${id}`);
  return response.data.data;
};

export const applyToJob = async (jobId: number): Promise<any> => {
  const response = await api.post(`/students/application/${jobId}/apply`);
  return response.data;
};
