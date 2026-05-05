import { useQuery } from "@tanstack/react-query";
import { getJobById } from "@/services/student/job.service";
import { QUERY_KEYS } from "@/constants/query-keys";
import { Job } from "@/types/job";

export const useJob = (id: number) => {
  return useQuery<Job>({
    queryKey: [QUERY_KEYS.JOBS, id],
    queryFn: () => getJobById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
