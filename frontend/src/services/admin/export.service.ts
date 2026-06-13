import api from "@/services/api";
import { EXPORT_ENDPOINTS } from "@/constants/api";

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
    const response = await api.post(EXPORT_ENDPOINTS.REQUEST, payload);
    return response.data;
  },

  getExportStatus: async (jobId: string): Promise<ExportStatusResponse> => {
    const response = await api.get(EXPORT_ENDPOINTS.STATUS(jobId));
    return response.data;
  },

  triggerExportService: async (payload: {
    type: "students" | "applications";
    selectedIds?: number[];
    selectedFields?: string[];
    [key: string]: any;
  }): Promise<ExportResponse> => {
    const response = await api.post(EXPORT_ENDPOINTS.REQUEST, payload);
    return response.data;
  },

  getExportStatusService: async (jobId: string): Promise<ExportStatusResponse> => {
    const response = await api.get(EXPORT_ENDPOINTS.STATUS(jobId));
    return response.data;
  },
};

