import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminJobService } from "@/services/admin/job.service";
import { toast } from "sonner";
import { CreateJobInput, UpdateJobInput } from "@/types/admin/job";
import { QUERY_KEYS } from "@/constants/query-keys";

// Centralized Query Keys
export const ADMIN_JOB_KEYS = {
  all: [QUERY_KEYS.ADMIN_JOBS] as const,
  list: (filters: any) => [QUERY_KEYS.ADMIN_JOBS, "list", filters] as const,
  detail: (id: string) => [QUERY_KEYS.ADMIN_JOB_DETAIL, id] as const,
};

export const useAdminJobs = (filters: any = {}) => {
  return useQuery({
    queryKey: ADMIN_JOB_KEYS.list(filters),
    queryFn: () => adminJobService.getAllJobs(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useAdminJob = (id: string) => {
  return useQuery({
    queryKey: ADMIN_JOB_KEYS.detail(id),
    queryFn: () => adminJobService.getJobById(id),
    enabled: !!id,
  });
};

export const useCreateJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateJobInput) => adminJobService.createJob(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_JOB_KEYS.all });
      toast.success(response.message || "Job posted successfully.");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Failed to post job.";
      toast.error(message);
    },
  });
};

export const useUpdateJob = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateJobInput) => adminJobService.updateJob(id, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_JOB_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ADMIN_JOB_KEYS.detail(id) });
      toast.success(response.message || "Job updated successfully.");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Failed to update job.";
      toast.error(message);
    },
  });
};

export const useToggleJobStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, currentStatus }: { id: string; currentStatus: string }) => {
      if (currentStatus === "ACTIVE") {
        return adminJobService.deactivateJob(id);
      }
      return adminJobService.activateJob(id);
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_JOB_KEYS.all });
      toast.success(response.message || "Job status updated.");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Status update failed.";
      toast.error(message);
    },
  });
};

export const useDeleteJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminJobService.deleteJob(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_JOB_KEYS.all });
      toast.success(response.message || "Job deleted successfully.");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Failed to delete job.";
      toast.error(message);
    },
  });
};

// ─── Applications Dashboard ───────────────────────────────────────
export const useApplicationDashboard = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.ADMIN_JOBS, "dashboard"] as const,
    queryFn: () => adminJobService.getApplicationDashboard(),
    staleTime: 1000 * 60 * 3, // 3 minutes
  });
};
