import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addProject, updateProject, deleteProject, getProjects } from "@/services/student/project.service";
import { QUERY_KEYS } from "@/constants/query-keys";
import { toast } from "sonner";
import { AxiosError } from "axios";

export function useProjects() {
  const query = useQuery({
    queryKey: [QUERY_KEYS.STUDENT_PROJECTS],
    queryFn: async () => {
      console.log(`⚪ Frontend Cache MISS: ${QUERY_KEYS.STUDENT_PROJECTS}`);
      return getProjects();
    },
    staleTime: 1.5 * 60 * 1000, // 1.5 minutes
  });

  if (query.data && !query.isFetching) {
    console.log(`🎯 Frontend Cache HIT: ${QUERY_KEYS.STUDENT_PROJECTS}`);
  }

  return query;
}

export function useAddProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STUDENT_PROJECTS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STUDENT_PROFILE] });
      toast.success("Project added successfully.");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      const message = error.response?.data?.message ?? "Failed to add project.";
      toast.error(message);
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STUDENT_PROJECTS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STUDENT_PROFILE] });
      toast.success("Project updated successfully.");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      const message = error.response?.data?.message ?? "Failed to update project.";
      toast.error(message);
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STUDENT_PROJECTS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STUDENT_PROFILE] });
      toast.success("Project deleted successfully.");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      const message = error.response?.data?.message ?? "Failed to delete project.";
      toast.error(message);
    },
  });
}
