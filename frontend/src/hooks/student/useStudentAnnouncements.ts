import { useQuery } from "@tanstack/react-query";
import { getStudentAnnouncements } from "@/services/student/announcement.service";
import { QUERY_KEYS } from "@/constants/query-keys";

interface UseStudentAnnouncementsParams {
  page: number;
  limit: number;
}

/**
 * Custom TanStack hook to fetch the student's targeted active admin announcements.
 */
export function useStudentAnnouncements({ page, limit }: UseStudentAnnouncementsParams) {
  return useQuery({
    queryKey: [QUERY_KEYS.STUDENT_ANNOUNCEMENTS, page, limit],
    queryFn: () => getStudentAnnouncements({ page, limit }),
    placeholderData: (previousData) => previousData, // Smooth pagination transitions
    staleTime: 2 * 60 * 1000, // Stale time of 2 minutes for announcements
  });
}
