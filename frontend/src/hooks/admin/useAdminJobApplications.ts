import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminJobApplicationService } from "@/services/admin/jobApplication.service";
import { toast } from "sonner";
import type { UpdateApplicationStatusInput } from "@/types/admin/jobApplication";
import { QUERY_KEYS } from "@/constants/query-keys";

// ─── Query key helpers ─────────────────────────────────────────────
export const APPLICANT_KEYS = {
  list: (jobId: string) =>
    [QUERY_KEYS.ADMIN_JOB_APPLICANTS, jobId] as const,
};

// ─── Fetch applicants for a job ────────────────────────────────────
export const useJobApplicants = (jobId: string) => {
  return useQuery({
    queryKey: APPLICANT_KEYS.list(jobId),
    queryFn: () => adminJobApplicationService.getJobApplicants(jobId),
    enabled: !!jobId,
    staleTime: 1000 * 60 * 2, // 2 minutes — applications change frequently
  });
};

// ─── Batch status update mutation ──────────────────────────────────
export const useUpdateApplicationStatus = (jobId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateApplicationStatusInput) =>
      adminJobApplicationService.updateApplicationStatus(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({
        queryKey: APPLICANT_KEYS.list(jobId),
      });
      toast.success(
        response.message ||
          `${response.data.updated} application(s) updated successfully.`
      );
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message ?? "Failed to update application status.";
      toast.error(message);
    },
  });
};
