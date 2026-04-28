import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addSkill, updateSkill, deleteSkill, getSkills } from "@/services/student/skill.service";
import { QUERY_KEYS } from "@/constants/query-keys";
import { toast } from "sonner";
import { AxiosError } from "axios";

export function useSkills() {
  const query = useQuery({
    queryKey: [QUERY_KEYS.STUDENT_SKILLS],
    queryFn: async () => {
      console.log(`⚪ Frontend Cache MISS: ${QUERY_KEYS.STUDENT_SKILLS}`);
      return getSkills();
    },
    staleTime: 1.5 * 60 * 1000, // 1.5 minutes
  });

  if (query.data && !query.isFetching) {
    console.log(`🎯 Frontend Cache HIT: ${QUERY_KEYS.STUDENT_SKILLS}`);
  }

  return query;
}

export function useAddSkill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addSkill,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STUDENT_SKILLS] });
      toast.success("Skill added successfully.");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      const message = error.response?.data?.message ?? "Failed to add skill.";
      toast.error(message);
    },
  });
}

export function useUpdateSkill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateSkill,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STUDENT_SKILLS] });
      toast.success("Skill updated successfully.");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      const message = error.response?.data?.message ?? "Failed to update skill.";
      toast.error(message);
    },
  });
}

export function useDeleteSkill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSkill,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STUDENT_SKILLS] });
      toast.success("Skill deleted successfully.");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      const message = error.response?.data?.message ?? "Failed to delete skill.";
      toast.error(message);
    },
  });
}
