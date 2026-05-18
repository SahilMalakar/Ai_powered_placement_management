import api from "@/services/api";

export interface ExportResponse {
  success: boolean;
  message: string;
  data: {
    jobId: string;
  };
}

export interface ExportStatusResponse {
  success: boolean;
  message: string;
  data: {
    status: "processing" | "completed" | "failed";
    downloadUrl?: string;
    error?: string;
    createdAt: string;
  };
}

export const adminExportService = {
  requestExport: async (payload: { type: "students" | "applications"; [key: string]: any }): Promise<ExportResponse> => {
    const response = await api.post("/admin/export", payload);
    return response.data;
  },

  getExportStatus: async (jobId: string): Promise<ExportStatusResponse> => {
    const response = await api.get(`/admin/export/${jobId}/status`);
    return response.data;
  },
};
