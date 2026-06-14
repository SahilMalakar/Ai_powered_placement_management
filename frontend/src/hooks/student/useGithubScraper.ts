import { useMutation, useQueryClient } from "@tanstack/react-query";
import { scrapeGithubService } from "@/services/student/githubScraper.service";
import { QUERY_KEYS } from "@/constants/query-keys";
import { toast } from "sonner";

export function useGithubScraperMutation(projectId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (githubUrl: string) => scrapeGithubService(projectId, githubUrl),
    onSuccess: () => {
      toast.success("GitHub project import queued. Description will update shortly.");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STUDENT_PROFILE] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STUDENT_PROJECTS] });
    },
    onError: () => {
      toast.error("Failed to import GitHub project. Check the URL and try again.");
    },
  });
}
