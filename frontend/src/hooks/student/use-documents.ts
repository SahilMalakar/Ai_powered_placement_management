import { useMutation, useQuery, useQueryClient, UseQueryOptions } from "@tanstack/react-query"
import { uploadDocument, deleteDocument, getDocuments } from "@/services/student/document.service"
import { QUERY_KEYS } from "@/constants/query-keys"
import { toast } from "sonner"
import { AxiosError } from "axios"

export function useDocuments(options?: Partial<UseQueryOptions<any>>) {
  return useQuery({
    queryKey: [QUERY_KEYS.STUDENT_DOCUMENTS],
    queryFn: getDocuments,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  })
}

export function useUploadDocument() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: uploadDocument,
    onSuccess: () => {
      // Invalidate both documents and profile since SGPA upload resets verification status
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STUDENT_DOCUMENTS] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STUDENT_PROFILE] })
      toast.success("Document uploaded successfully.")
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      const message = error.response?.data?.message ?? "Failed to upload document."
      toast.error(message)
    },
  })
}

export function useDeleteDocument() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteDocument,
    onSuccess: () => {
      // Invalidate both documents and profile since SGPA deletion resets verification status
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STUDENT_DOCUMENTS] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STUDENT_PROFILE] })
      toast.success("Document deleted successfully.")
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      const message = error.response?.data?.message ?? "Failed to delete document."
      toast.error(message)
    },
  })
}
