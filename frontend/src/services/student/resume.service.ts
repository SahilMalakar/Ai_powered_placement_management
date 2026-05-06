import api from '../api';
import { Resume, ResumeJson } from '@/types/student/resume';

/**
 * Service for student resume management.
 * Handles AI generation, fetching, updating, and exporting resumes.
 */
export const resumeService = {
  /**
   * Triggers the AI-powered resume generation process.
   */
  generateResume: async (): Promise<{ message: string; resumeId: number; jobId: string }> => {
    const response = await api.post('/students/resume/generate');
    return response.data.data;
  },

  /**
   * Fetches all resumes for the authenticated student.
   */
  getResumes: async (): Promise<Resume[]> => {
    const response = await api.get('/students/resume');
    return response.data.data;
  },

  /**
   * Fetches a specific resume by its ID.
   */
  getResumeById: async (id: number): Promise<Resume> => {
    const response = await api.get(`/students/resume/${id}`);
    return response.data.data;
  },

  /**
   * Updates the JSON content of a resume.
   */
  updateResume: async (id: number, jsonData: ResumeJson): Promise<Resume> => {
    const response = await api.patch(`/students/resume/${id}`, jsonData);
    return response.data.data;
  },

  /**
   * Initiates the PDF export process for a resume.
   */
  exportPdf: async (id: number): Promise<{ message: string; resumeId: number; jobId: string }> => {
    const response = await api.get(`/students/resume/${id}/export`);
    return response.data.data;
  },
  
  /**
   * Deletes a resume record.
   */
  deleteResume: async (id: number): Promise<void> => {
    await api.delete(`/students/resume/${id}`);
  },
};
