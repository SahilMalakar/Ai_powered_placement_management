import api from "@/services/api";
import { ApplicationsResponse } from "@/types/student/application";

export const getMyApplications = async (): Promise<ApplicationsResponse> => {
  const response = await api.get('/students/application');
  return response.data.data;
};

export const applyToJob = async (jobId: number) => {
  const response = await api.post(`/students/application/${jobId}/apply`);
  return response.data;
};
