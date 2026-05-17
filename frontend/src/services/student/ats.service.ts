import api from "../api";

export interface AtsAnalyzeResponse {
  atsResultId: number;
}

export interface AtsStatusResponse {
  id: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  score?: number;
  analysisMode?: 'GENERIC' | 'JD_MATCHED';
  detectedRole?: string;
  keywordScore?: number;
  formatScore?: number;
  experienceScore?: number;
  projectScore?: number;
  skillsScore?: number;
  additionalDetailsScore?: number;
  matchedKeywords?: string[];
  missingKeywords?: string[];
  strengths?: string[];
  weaknesses?: string[];
  suggestions?: string[];
  createdAt: string;
}

export interface AtsHistoryResponse {
  results: AtsStatusResponse[];
  total: number;
  todayCount?: number;
}

export const atsService = {
  analyze: async (data: FormData): Promise<AtsAnalyzeResponse> => {
    return api.post('/students/ats/analyze', data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }).then(r => r.data.data);
  },

  getStatus: async (id: number): Promise<AtsStatusResponse> => {
    return api.get(`/students/ats/status/${id}`).then(r => r.data.data);
  },

  getHistory: async (page: number = 1, limit: number = 10): Promise<AtsHistoryResponse> => {
    return api.get(`/students/ats?page=${page}&limit=${limit}`).then(r => r.data.data);
  },

  deleteAts: async (id: number): Promise<void> => {
    return api.delete(`/students/ats/${id}`).then(r => r.data.data);
  }
};
