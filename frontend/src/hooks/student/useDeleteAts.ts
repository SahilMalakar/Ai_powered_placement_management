import { useMutation, useQueryClient } from '@tanstack/react-query';
import { atsService } from '@/services/student/ats.service';
import { QUERY_KEYS } from '@/constants/query-keys';
import { toast } from 'sonner';

export function useDeleteAts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => atsService.deleteAts(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STUDENT_ATS_HISTORY] });
      toast.success('ATS analysis deleted successfully.');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to delete ATS analysis.';
      toast.error(message);
    }
  });
}
