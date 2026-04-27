import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createProfile } from "@/services/student/profile.service"
import { toast } from "sonner"
import { AxiosError } from "axios"
import { QUERY_KEYS } from "@/constants/query-keys"

export function useCreateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createProfile,
    onSuccess: (data) => {
      queryClient.setQueryData([QUERY_KEYS.STUDENT_PROFILE], (oldData: any) => {
        if (!oldData) return oldData
        return {
          ...oldData,
          profile: {
            ...oldData.profile,
            ...data
          }
        }
      })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STUDENT_PROFILE] })
      toast.success("Profile created successfully.")
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      const message = error.response?.data?.message ?? "Failed to create profile."
      toast.error(message)
    },
  })
}
