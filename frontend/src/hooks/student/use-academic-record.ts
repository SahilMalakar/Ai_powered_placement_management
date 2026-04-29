import { useQuery, UseQueryOptions } from "@tanstack/react-query"
import { getAcademicRecord } from "@/services/student/profile.service"
import { QUERY_KEYS } from "@/constants/query-keys"

export function useAcademicRecord(options?: Partial<UseQueryOptions<any>>) {
  return useQuery({
    queryKey: [QUERY_KEYS.STUDENT_ACADEMIC],
    queryFn: getAcademicRecord,
    staleTime: 10 * 60 * 1000, // Academic records change rarely
    ...options,
  })
}
