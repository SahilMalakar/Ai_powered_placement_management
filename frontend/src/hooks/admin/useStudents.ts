import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { adminStudentService } from "@/services/admin/student.service";
import { toast } from "sonner";
import { QUERY_KEYS } from "@/constants/query-keys";
import { GetAllStudentsQueryInput } from "@/types/admin/student";

export const ADMIN_STUDENT_KEYS = {
  all: [QUERY_KEYS.ADMIN_STUDENTS] as const,
  list: (filters: GetAllStudentsQueryInput) => [QUERY_KEYS.ADMIN_STUDENTS, "list", filters] as const,
  detail: (id: number) => [QUERY_KEYS.ADMIN_STUDENT_DETAIL, id] as const,
};

export const useAdminStudents = (filters: GetAllStudentsQueryInput) => {
  return useQuery({
    queryKey: ADMIN_STUDENT_KEYS.list(filters),
    queryFn: () => adminStudentService.getAllStudents(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
    placeholderData: keepPreviousData, // Keep old data visible during refetch
  });
};

export const useAdminStudent = (id: number) => {
  return useQuery({
    queryKey: ADMIN_STUDENT_KEYS.detail(id),
    queryFn: () => adminStudentService.getStudentById(id),
    enabled: !!id,
  });
};

export const useSoftDeleteStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => adminStudentService.softDeleteStudent(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_STUDENT_KEYS.all });
      toast.success(response.message || "Student account deactivated.");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Failed to deactivate student.";
      toast.error(message);
    },
  });
};
