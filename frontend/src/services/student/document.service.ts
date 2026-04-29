import api from "@/services/api"

/**
 * Student Document Service
 * Handles single document uploads, fetching all documents, and deletions.
 */

export const getDocuments = async () => {
  return api.get("/students/documents").then((r) => r.data.data)
}

export const uploadDocument = async (formData: FormData) => {
  return api.post("/students/documents", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  }).then((r) => r.data.data)
}

export const deleteDocument = async (id: number) => {
  return api.delete(`/students/documents/${id}`).then((r) => r.data.data)
}
