import { useMutation, useQueryClient } from "@tanstack/react-query"
import { initiateVerification } from "@/services/student/verification.service"
import { QUERY_KEYS } from "@/constants/query-keys"
import { toast } from "sonner"
import { AxiosError } from "axios"

export function useInitiateVerification() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: initiateVerification,
    onSuccess: (data) => {
      queryClient.setQueryData([QUERY_KEYS.STUDENT_PROFILE], (oldData: any) => {
        if (!oldData || !oldData.profile) return oldData
        return {
          ...oldData,
          profile: {
            ...oldData.profile,
            verificationStatus: data.status || "PROCESSING"
          }
        }
      })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STUDENT_PROFILE] })
      toast.success("Initiated successfully!")
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      const message = error.response?.data?.message ?? "Failed to initiate verification."
      toast.error(message)
    },
  })
}
