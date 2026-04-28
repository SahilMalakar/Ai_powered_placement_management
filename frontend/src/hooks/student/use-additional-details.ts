import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addAdditionalDetail, updateAdditionalDetail, deleteAdditionalDetail, getAdditionalDetails } from "@/services/student/additional-detail.service";
import { QUERY_KEYS } from "@/constants/query-keys";
import { toast } from "sonner";
import { AxiosError } from "axios";

export function useAdditionalDetails() {
  const query = useQuery({
    queryKey: [QUERY_KEYS.STUDENT_ADDITIONAL_DETAILS],
    queryFn: async () => {
      console.log(`⚪ Frontend Cache MISS: ${QUERY_KEYS.STUDENT_ADDITIONAL_DETAILS}`);
      return getAdditionalDetails();
    },
    staleTime: 1.5 * 60 * 1000, // 1.5 minutes
  });

  if (query.data && !query.isFetching) {
    console.log(`🎯 Frontend Cache HIT: ${QUERY_KEYS.STUDENT_ADDITIONAL_DETAILS}`);
  }

  return query;
}

export function useAddAdditionalDetail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addAdditionalDetail,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STUDENT_ADDITIONAL_DETAILS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STUDENT_PROFILE] });
      toast.success("Additional detail added successfully.");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      const message = error.response?.data?.message ?? "Failed to add additional detail.";
      toast.error(message);
    },
  });
}

export function useUpdateAdditionalDetail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateAdditionalDetail,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STUDENT_ADDITIONAL_DETAILS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STUDENT_PROFILE] });
      toast.success("Additional detail updated successfully.");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      const message = error.response?.data?.message ?? "Failed to update additional detail.";
      toast.error(message);
    },
  });
}

export function useDeleteAdditionalDetail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAdditionalDetail,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STUDENT_ADDITIONAL_DETAILS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STUDENT_PROFILE] });
      toast.success("Additional detail deleted successfully.");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      const message = error.response?.data?.message ?? "Failed to delete additional detail.";
      toast.error(message);
    },
  });
}
