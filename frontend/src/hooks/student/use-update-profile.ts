import { useMutation, useQueryClient } from "@tanstack/react-query"
import { updateProfile } from "@/services/student/profile.service"
import { QUERY_KEYS } from "@/constants/query-keys"
import { toast } from "sonner"
import { AxiosError } from "axios"

export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateProfile,
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
      toast.success("Profile updated successfully.")
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      const message = error.response?.data?.message ?? "Failed to update profile."
      toast.error(message)
    },
  })
}
