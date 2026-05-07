import api from "@/services/api";
import type {
  ApplicantsResponse,
  BatchUpdateResponse,
  UpdateApplicationStatusInput,
  ApplicantFilters,
} from "@/types/admin/jobApplication";

export const adminJobApplicationService = {
  getJobApplicants: async (
    jobId: string,
    filters: ApplicantFilters = {}
  ): Promise<ApplicantsResponse> => {
    const response = await api.get(`/admin/job/${jobId}/applicants`, {
      params: filters,
    });
    return response.data;
  },

  updateApplicationStatus: async (
    data: UpdateApplicationStatusInput
  ): Promise<BatchUpdateResponse> => {
    const response = await api.post("/admin/job/application/status", data);
    return response.data;
  },
};
