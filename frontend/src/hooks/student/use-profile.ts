import { useQuery } from "@tanstack/react-query"
import { getProfile } from "@/services/student/profile.service"
import { QUERY_KEYS } from "@/constants/query-keys"

export function useProfile() {
  return useQuery({
    queryKey: [QUERY_KEYS.STUDENT_PROFILE],
    queryFn: getProfile,
    staleTime: 1 * 60 * 1000, // 1 minutes
  })
}
