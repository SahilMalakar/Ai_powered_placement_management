import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  optimizeResumeService,
  getResumeByIdService,
  getAllResumesService,
  deleteResumeService,
} from "@/services/student/resume.service";
import { QUERY_KEYS } from "@/constants/query-keys";
import { useAppStore } from "@/store/useAppStore";
import { RESUME_POLL_INTERVAL_MS } from "@/constants/resume";
import { toast } from "sonner";

export function useOptimizeResumeMutation() {
  const queryClient = useQueryClient();
  const store = useAppStore();

  return useMutation({
    mutationFn: (file: File) => optimizeResumeService(file),
    onSuccess: (data) => {
      store.setActiveResumeJob({ jobId: data.jobId, resumeId: data.resumeId });
      store.setResumePolling(true);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ALL_RESUMES });
      toast.success("Resume optimization started");
    },
    onError: () => {
      toast.error("Failed to queue resume optimization");
    },
  });
}

export function useResumeByIdQuery(resumeId: number | null, enabled: boolean) {
  return useQuery({
    queryKey: QUERY_KEYS.OPTIMIZE_RESUME_BY_ID(resumeId!),
    queryFn: () => getResumeByIdService(resumeId!),
    enabled: enabled && resumeId !== null,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data?.status === "COMPLETED" || data?.status === "FAILED") {
        return false;
      }
      return RESUME_POLL_INTERVAL_MS;
    },
  });
}

export function useAllResumesQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.ALL_RESUMES,
    queryFn: getAllResumesService,
    staleTime: 30000,
  });
}

export function useDeleteResumeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteResumeService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ALL_RESUMES });
      toast.success("Resume deleted");
    },
    onError: () => {
      toast.error("Failed to delete resume");
    },
  });
}
