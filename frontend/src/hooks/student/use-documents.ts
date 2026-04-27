import { useMutation, useQueryClient } from "@tanstack/react-query"
import { uploadDocuments, deleteDocument } from "@/services/student/document.service"
import { QUERY_KEYS } from "@/constants/query-keys"
import { toast } from "sonner"
import { AxiosError } from "axios"

export function useUploadDocuments() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: uploadDocuments,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STUDENT_PROFILE] })
      toast.success("Uploaded successfully")
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      const message = error.response?.data?.message ?? "Failed to upload documents."
      toast.error(message)
    },
  })
}

export function useDeleteDocument() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STUDENT_PROFILE] })
      toast.success("Document deleted successfully.")
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      const message = error.response?.data?.message ?? "Failed to delete document."
      toast.error(message)
    },
  })
}
