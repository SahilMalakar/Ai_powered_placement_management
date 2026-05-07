import api from "@/services/api";
import type {
  ApplicantsResponse,
  BatchUpdateResponse,
  UpdateApplicationStatusInput,
} from "@/types/admin/jobApplication";

export const adminJobApplicationService = {
  getJobApplicants: async (jobId: string): Promise<ApplicantsResponse> => {
    const response = await api.get(`/admin/job/${jobId}/applicants`);
    return response.data;
  },

  updateApplicationStatus: async (
    data: UpdateApplicationStatusInput
  ): Promise<BatchUpdateResponse> => {
    const response = await api.post("/admin/job/application/status", data);
    return response.data;
  },
};
