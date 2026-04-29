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
      // Update Academic Records cache to trigger polling
      queryClient.setQueryData([QUERY_KEYS.STUDENT_ACADEMIC], (oldData: any) => {
        if (!oldData) return oldData
        return {
          ...oldData,
          verificationStatus: "PROCESSING"
        }
      })

      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STUDENT_PROFILE] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STUDENT_ACADEMIC] })
      toast.success("Verification initiated!")
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      const message = error.response?.data?.message ?? "Failed to initiate verification."
      toast.error(message)
    },
  })
}
