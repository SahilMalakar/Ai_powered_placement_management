import api from "@/services/api"

/**
 * Student Document Service
 * Handles single document uploads, fetching all documents, and deletions.
 */

export const getDocuments = async () => {
  return api.get("/students/document").then((r) => r.data.data)
}

export const uploadDocument = async (formData: FormData) => {
  return api.post("/students/document", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  }).then((r) => r.data.data)
}

export const deleteDocument = async (id: number) => {
  return api.delete(`/students/document/${id}`).then((r) => r.data.data)
}
