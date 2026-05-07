'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { atsService } from '@/services/student/ats.service';
import { QUERY_KEYS } from '@/constants/query-keys';
import { toast } from 'sonner';

interface UseAtsAnalyzeOptions {
  onSuccess?: (atsResultId: number) => void;
}

export function useAtsAnalyze(options?: UseAtsAnalyzeOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => atsService.analyze(formData),
    onSuccess: (data) => {
      // Invalidate history so it's fresh when they go back
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STUDENT_ATS_HISTORY] });
      
      toast.success('Resume analysis started.');
      options?.onSuccess?.(data.atsResultId);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to start analysis.';
      toast.error(message);
    }
  });
}
