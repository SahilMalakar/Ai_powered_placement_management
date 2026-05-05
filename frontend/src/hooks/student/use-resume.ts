import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { resumeService } from "@/services/student/resume.service";
import { QUERY_KEYS } from "@/constants/query-keys";
import { toast } from "sonner";
import { ResumeJson } from "@/types/resume";

/**
 * Hook for fetching all resumes of the student.
 */
export const useResumes = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.STUDENT_RESUMES],
    queryFn: () => resumeService.getResumes(),
  });
};

/**
 * Hook for fetching a single resume by ID.
 */
export const useResume = (id: number) => {
  return useQuery({
    queryKey: [QUERY_KEYS.STUDENT_RESUMES, id],
    queryFn: () => resumeService.getResumeById(id),
    enabled: !!id,
  });
};

/**
 * Hook for generating a new AI resume.
 */
export const useGenerateResume = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => resumeService.generateResume(),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STUDENT_RESUMES] });
      toast.success(data.message || "Resume generation started.");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to start resume generation.");
    },
  });
};

/**
 * Hook for updating a resume.
 */
export const useUpdateResume = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, jsonData }: { id: number; jsonData: ResumeJson }) =>
      resumeService.updateResume(id, jsonData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STUDENT_RESUMES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STUDENT_RESUMES, data.id] });
      toast.success("Resume updated successfully.");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update resume.");
    },
  });
};

/**
 * Hook for exporting a resume to PDF.
 */
export const useExportResume = () => {
  return useMutation({
    mutationFn: (id: number) => resumeService.exportPdf(id),
    onSuccess: (data) => {
      toast.info(data.message || "PDF export started.");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to start PDF export.");
    },
  });
};
