import api from "@/services/api"

/**
 * Student Document Service
 * Handles bulk document uploads and deletions.
 */

export const uploadDocuments = async (formData: FormData) => {
  return api.post("/students/documents", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  }).then((r) => r.data.data)
}

export const deleteDocument = async (id: number) => {
  return api.delete(`/students/documents/${id}`).then((r) => r.data.data)
}
