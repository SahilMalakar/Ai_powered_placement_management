import { useQuery } from "@tanstack/react-query";
import { getJobs } from "@/services/student/job.service";
import { JobFilters } from "@/types/student/job";
import { QUERY_KEYS } from "@/constants/query-keys";

export const useJobs = (filters: JobFilters) => {
  return useQuery({
    queryKey: [QUERY_KEYS.JOBS, filters],
    queryFn: () => getJobs(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
