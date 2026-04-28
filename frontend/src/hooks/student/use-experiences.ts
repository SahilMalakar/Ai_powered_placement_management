import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addExperience, updateExperience, deleteExperience, getExperiences } from "@/services/student/experience.service";
import { QUERY_KEYS } from "@/constants/query-keys";
import { toast } from "sonner";
import { AxiosError } from "axios";

export function useExperiences() {
  const query = useQuery({
    queryKey: [QUERY_KEYS.STUDENT_EXPERIENCES],
    queryFn: async () => {
      console.log(`⚪ Frontend Cache MISS: ${QUERY_KEYS.STUDENT_EXPERIENCES}`);
      return getExperiences();
    },
    staleTime: 1.5 * 60 * 1000, // 1.5 minutes
  });

  if (query.data && !query.isFetching) {
    console.log(`🎯 Frontend Cache HIT: ${QUERY_KEYS.STUDENT_EXPERIENCES}`);
  }

  return query;
}

export function useAddExperience() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addExperience,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STUDENT_EXPERIENCES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STUDENT_PROFILE] });
      toast.success("Experience added successfully.");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      const message = error.response?.data?.message ?? "Failed to add experience.";
      toast.error(message);
    },
  });
}

export function useUpdateExperience() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateExperience,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STUDENT_EXPERIENCES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STUDENT_PROFILE] });
      toast.success("Experience updated successfully.");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      const message = error.response?.data?.message ?? "Failed to update experience.";
      toast.error(message);
    },
  });
}

export function useDeleteExperience() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteExperience,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STUDENT_EXPERIENCES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STUDENT_PROFILE] });
      toast.success("Experience deleted successfully.");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      const message = error.response?.data?.message ?? "Failed to delete experience.";
      toast.error(message);
    },
  });
}
