import { useMutation, useQueryClient } from "@tanstack/react-query";
import { applyToJob } from "@/services/student/job.service";
import { QUERY_KEYS } from "@/constants/query-keys";
import { toast } from "sonner";

export const useApplyJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (jobId: number) => applyToJob(jobId),
    onSuccess: (data, jobId) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.JOBS] });
      queryClient.invalidateQueries({ queryKey: ["applications", "my"] });
      toast.success(data.message || "Applied successfully.");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Failed to apply.";
      toast.error(message);
    },
  });
};
