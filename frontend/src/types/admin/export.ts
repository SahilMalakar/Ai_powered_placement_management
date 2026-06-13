export type ExportType = 'students' | 'applications';

export type ExportJobStatus = 'idle' | 'processing' | 'completed' | 'failed';

export interface ExportFilters {
  search?: string;
  branch?: string;
  cgpa?: string;
  backlogAllowed?: boolean;
  verificationStatus?: string;
  status?: string;
  jobId?: string | number;
}

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
    status: 'processing' | 'completed' | 'failed';
    downloadUrl?: string;
    error?: string;
    createdAt: string;
  };
}

export interface ExportLogEntry {
  id: number;
  type: 'students' | 'applications';
  fileUrl: string;
  filters: Record<string, any>;
  selectedIds: number[];
  recordCount: number;
  createdAt: string;
  admin: { id: number; email: string };
}

export interface ExportLogsResponse {
  logs: ExportLogEntry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

