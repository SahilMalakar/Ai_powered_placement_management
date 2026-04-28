import { useQuery } from "@tanstack/react-query"
import { getProfile } from "@/services/student/profile.service"
import { QUERY_KEYS } from "@/constants/query-keys"

export function useProfile() {
  const query = useQuery({
    queryKey: [QUERY_KEYS.STUDENT_PROFILE],
    queryFn: async () => {
      console.log(`⚪ Frontend Cache MISS: ${QUERY_KEYS.STUDENT_PROFILE}`);
      return getProfile();
    },
    staleTime: 1.5 * 60 * 1000, // 1.5 minutes
  })

  if (query.data && !query.isFetching) {
    console.log(`🎯 Frontend Cache HIT: ${QUERY_KEYS.STUDENT_PROFILE}`);
  }

  return query;
}
