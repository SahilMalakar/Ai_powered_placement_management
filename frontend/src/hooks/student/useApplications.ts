import { useQuery } from "@tanstack/react-query";
import { getMyApplications } from "@/services/student/application.service";

export const useApplications = () => {
  return useQuery({
    queryKey: ["applications", "my"],
    queryFn: getMyApplications,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
