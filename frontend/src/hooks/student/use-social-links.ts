import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addSocialLink, updateSocialLink, deleteSocialLink, getSocialLinks } from "@/services/student/social-link.service";
import { QUERY_KEYS } from "@/constants/query-keys";
import { toast } from "sonner";
import { AxiosError } from "axios";

export function useSocialLinks() {
  const query = useQuery({
    queryKey: [QUERY_KEYS.STUDENT_SOCIAL_LINKS],
    queryFn: async () => {
      console.log(`⚪ Frontend Cache MISS: ${QUERY_KEYS.STUDENT_SOCIAL_LINKS}`);
      return getSocialLinks();
    },
    staleTime: 1.5 * 60 * 1000, // 1.5 minutes
  });

  if (query.data && !query.isFetching) {
    console.log(`🎯 Frontend Cache HIT: ${QUERY_KEYS.STUDENT_SOCIAL_LINKS}`);
  }

  return query;
}

export function useAddSocialLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addSocialLink,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STUDENT_SOCIAL_LINKS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STUDENT_PROFILE] });
      toast.success("Social link added successfully.");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      const message = error.response?.data?.message ?? "Failed to add social link.";
      toast.error(message);
    },
  });
}

export function useUpdateSocialLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateSocialLink,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STUDENT_SOCIAL_LINKS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STUDENT_PROFILE] });
      toast.success("Social link updated successfully.");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      const message = error.response?.data?.message ?? "Failed to update social link.";
      toast.error(message);
    },
  });
}

export function useDeleteSocialLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSocialLink,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STUDENT_SOCIAL_LINKS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STUDENT_PROFILE] });
      toast.success("Social link deleted successfully.");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      const message = error.response?.data?.message ?? "Failed to delete social link.";
      toast.error(message);
    },
  });
}
