import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { resumeService } from "@/services/student/resume.service";
import { QUERY_KEYS } from "@/constants/query-keys";
import { toast } from "sonner";
import { ResumeJson } from "@/types/student/resume";

/**
 * Hook for fetching all resumes of the student.
 */
export const useResumes = () => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: [QUERY_KEYS.STUDENT_RESUMES],
    queryFn: async () => {
      const resumes = await resumeService.getResumes();
      const previousResumes = queryClient.getQueryData<any[]>([QUERY_KEYS.STUDENT_RESUMES]);

      if (Array.isArray(previousResumes) && Array.isArray(resumes)) {
        resumes.forEach((resume) => {
          const prev = previousResumes.find((r) => r.id === resume.id);
          if (prev) {
            // Detection: Generation Completed
            if (prev.status === 'GENERATING' && resume.status === 'COMPLETED') {
              toast.success(`${resume.jsonData?.targetRole || 'Resume'} generated successfully!`);
            }
            // Detection: Export Completed
            if (prev.isExporting && resume.pdfUrl && resume.pdfUrl !== prev.pdfUrl) {
              toast.success(`${resume.jsonData?.targetRole || 'Resume'} PDF is ready!`);
            }
          }
        });
      }

      // Preserve isExporting flags that haven't finished yet
      return resumes.map(r => {
        const prev = previousResumes?.find(p => p.id === r.id);
        if (prev?.isExporting && (!r.pdfUrl || r.pdfUrl === prev.pdfUrl)) {
          return { ...r, isExporting: true };
        }
        return r;
      });
    },
    // Poll every 3 seconds if any resume is still generating or exporting
    refetchInterval: (query) => {
      const resumes = query.state.data;
      if (Array.isArray(resumes) && resumes.some(r => r.status === 'GENERATING' || (r as any).isExporting)) {
        return 3000;
      }
      return false;
    },
  });
};

/**
 * Hook for fetching a single resume by ID.
 */
export const useResume = (id: number) => {
  const queryClient = useQueryClient();
  
  return useQuery({
    queryKey: [QUERY_KEYS.STUDENT_RESUMES, id],
    queryFn: async () => {
      const resume = await resumeService.getResumeById(id);
      const previousData = queryClient.getQueryData<any>([QUERY_KEYS.STUDENT_RESUMES, id]);
      
      if (previousData) {
        // Generation completed
        if (previousData.status === 'GENERATING' && resume.status === 'COMPLETED') {
          // Toast only if useResumes hasn't already (simple check: only toast in detail view if ID is present)
          toast.success("Resume generation completed!");
        }
        // Export completed
        if (previousData.isExporting && resume.pdfUrl && resume.pdfUrl !== previousData.pdfUrl) {
          toast.success("PDF export completed!");
          return { ...resume, isExporting: false };
        }
        // Preserve flag
        if (previousData.isExporting && (!resume.pdfUrl || resume.pdfUrl === previousData.pdfUrl)) {
          return { ...resume, isExporting: true };
        }
      }
      
      return resume;
    },
    enabled: !!id,
    refetchInterval: (query) => {
      const resume = query.state.data;
      if (resume && (resume.status === 'GENERATING' || (resume as any).isExporting)) {
        return 2000;
      }
      return false;
    },
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
      // Refresh the list to start polling
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STUDENT_RESUMES] });
      toast.info(data.message || "Resume generation started.");
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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => resumeService.exportPdf(id),
    onSuccess: (_, id) => {
      // Mark as exporting in both caches to trigger polling
      queryClient.setQueryData([QUERY_KEYS.STUDENT_RESUMES, id], (old: any) => {
        if (!old) return old;
        return { ...old, isExporting: true };
      });
      
      queryClient.setQueryData([QUERY_KEYS.STUDENT_RESUMES], (old: any) => {
        if (!Array.isArray(old)) return old;
        return old.map(r => r.id === id ? { ...r, isExporting: true } : r);
      });

      toast.info("PDF export started. This may take a few moments.");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to start PDF export.");
    },
  });
};
/**
 * Hook for deleting a resume.
 */
export const useDeleteResume = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => resumeService.deleteResume(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STUDENT_RESUMES] });
      toast.success("Resume deleted successfully.");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete resume.");
    },
  });
};
