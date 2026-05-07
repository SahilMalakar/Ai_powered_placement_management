'use client';

import { useQuery } from '@tanstack/react-query';
import { atsService } from '@/services/student/ats.service';
import { QUERY_KEYS } from '@/constants/query-keys';

export function useAtsStatus(id: number | null) {
  return useQuery({
    queryKey: [QUERY_KEYS.STUDENT_ATS_STATUS, id],
    queryFn: () => atsService.getStatus(id!),
    enabled: !!id,
    // Polling logic: Refetch every 3 seconds while status is not final
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === 'PENDING' || status === 'PROCESSING') {
        return 3000;
      }
      return false;
    },
    // Keep stale data while refetching
    staleTime: 0,
  });
}
