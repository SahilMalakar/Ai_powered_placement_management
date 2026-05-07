'use client';

import { useQuery } from '@tanstack/react-query';
import { atsService } from '@/services/student/ats.service';
import { QUERY_KEYS } from '@/constants/query-keys';

export function useAtsHistory(page: number = 1, limit: number = 10) {
  return useQuery({
    queryKey: [QUERY_KEYS.STUDENT_ATS_HISTORY, page, limit],
    queryFn: () => atsService.getHistory(page, limit),
    staleTime: 60 * 1000, // 1 minute
  });
}
