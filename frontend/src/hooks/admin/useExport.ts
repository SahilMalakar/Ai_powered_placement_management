import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { adminExportService } from "@/services/admin/export.service";
import { adminStudentService } from "@/services/admin/student.service";
import { adminJobApplicationService } from "@/services/admin/jobApplication.service";
import { useAppStore } from "@/store/useAppStore";
import { QUERY_KEYS } from "@/constants/query-keys";
import { toast } from "sonner";

// Keep useAdminExport for backward compatibility
export const useAdminExport = () => {
  const exportMutation = useMutation({
    mutationFn: async (payload: { type: "students" | "applications"; [key: string]: any }): Promise<string> => {
      return new Promise<string>(async (resolve, reject) => {
        try {
          const response = await adminExportService.requestExport(payload);
          const jobId = response.data.jobId;

          let attempts = 0;
          const maxAttempts = 30; // 60 seconds max polling duration

          const interval = setInterval(async () => {
            attempts++;
            if (attempts > maxAttempts) {
              clearInterval(interval);
              reject(new Error("Export request timed out. Please try again."));
              return;
            }

            try {
              const statusRes = await adminExportService.getExportStatus(jobId);
              const { status, downloadUrl, error } = statusRes.data;

              if (status === "completed" && downloadUrl) {
                clearInterval(interval);
                resolve(downloadUrl);
              } else if (status === "failed") {
                clearInterval(interval);
                reject(new Error(error || "Export failed on the server."));
              }
            } catch (err: any) {
              // Ignore network/temporary polling errors and let it retry
            }
          }, 2000);
        } catch (err: any) {
          const errMsg = err.response?.data?.message || "Failed to start export job.";
          reject(new Error(errMsg));
        }
      });
    },
  });

  const exportData = (payload: { type: "students" | "applications"; [key: string]: any }) => {
    const promise = exportMutation.mutateAsync(payload);
    
    toast.promise(promise, {
      loading: `Enqueuing job to process ${payload.type} CSV export...`,
      success: (downloadUrl: string) => {
        // Trigger download
        window.open(downloadUrl, "_blank");
        return "CSV export compiled and downloaded successfully!";
      },
      error: (err: any) => err.message || "Failed to export CSV.",
    });

    return promise;
  };

  return {
    exportData,
    isExporting: exportMutation.isPending,
  };
};

export const useExportMutation = () => {
  const { setExportJobId, setExportStatus, setExportDownloadUrl, setExportError } = useAppStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      type: "students" | "applications";
      selectedIds?: number[];
      selectedFields?: string[];
      [key: string]: any;
    }) => {
      // Reset state first
      setExportJobId(null);
      setExportStatus('idle');
      setExportDownloadUrl(null);
      setExportError(null);

      const response = await adminExportService.triggerExportService(payload);
      return response.data;
    },
    onSuccess: (data, variables) => {
      setExportJobId(data.jobId);
      setExportStatus('processing');
      queryClient.invalidateQueries({ queryKey: ['export', 'logs'] });
      toast.info(`Export job queued for ${variables.type}. Processing in background...`);
    },
    onError: (error: any) => {
      const errMsg = error.response?.data?.message || "Failed to trigger export.";
      setExportStatus('failed');
      setExportError(errMsg);
      toast.error(errMsg);
    },
  });
};

export const useExportStatusQuery = (jobId: string | null) => {
  const { setExportStatus, setExportDownloadUrl, setExportError } = useAppStore();
  const [hasHandled, setHasHandled] = useState(false);
  const queryClient = useQueryClient();
  
  useEffect(() => {
    if (jobId) setHasHandled(false);
  }, [jobId]);
  
  const query = useQuery({
    queryKey: [QUERY_KEYS.ADMIN_EXPORT_STATUS, jobId],
    queryFn: async () => {
      const res = await adminExportService.getExportStatusService(jobId!);
      return res;
    },
    enabled: !!jobId,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return 2000;
      const { status } = data.data;
      if (status === 'completed' || status === 'failed') {
        return false;
      }
      return 2000;
    },
    staleTime: 0,
  });

  useEffect(() => {
    if (query.data && !hasHandled) {
      const { status, downloadUrl, error } = query.data.data;
      setExportStatus(status);
      
      if (status === 'completed') {
        setHasHandled(true);
        if (downloadUrl) {
          setExportDownloadUrl(downloadUrl);
          window.open(downloadUrl, '_blank');
          toast.success("CSV export compiled and downloaded successfully!");
        }
        queryClient.invalidateQueries({ queryKey: ['export', 'logs'] });
      } else if (status === 'failed') {
        setHasHandled(true);
        setExportError(error || "Export failed on the server.");
        toast.error(error || "Export failed on the server.");
        queryClient.invalidateQueries({ queryKey: ['export', 'logs'] });
      }
    }
  }, [query.data, hasHandled, setExportStatus, setExportDownloadUrl, setExportError, queryClient]);

  return query;
};

export const useExportPreviewQuery = (
  type: "students" | "applications",
  filters: any,
  options: { enabled?: boolean } = {}
) => {
  const { exportFilters, previewTriggered, exportType } = useAppStore();

  return useQuery({
    queryKey: [QUERY_KEYS.ADMIN_EXPORT_PREVIEW, type, exportFilters],
    queryFn: async () => {
      if (type === "students") {
        const studentParams: any = {
          search: exportFilters.search || undefined,
          branch: exportFilters.branch === 'all' ? undefined : exportFilters.branch,
          cgpa: exportFilters.cgpa || undefined,
          backlogAllowed: exportFilters.backlogAllowed,
          verificationStatus: exportFilters.verificationStatus === 'all' ? undefined : exportFilters.verificationStatus,
          page: 1,
          limit: 50,
        };
        Object.keys(studentParams).forEach(k => studentParams[k] === undefined && delete studentParams[k]);

        const res = await adminStudentService.getAllStudents(studentParams);
        return {
          records: res.data.students.map((student) => ({
            id: student.id,
            fullName: student.profile?.fullName || "N/A",
            rollNo: student.profile?.rollNo || "N/A",
            email: student.email,
            branch: student.profile?.branch || "N/A",
            cgpa: student.profile?.cgpa || "N/A",
            status: student.profile?.verificationStatus || "NOT_VERIFIED",
          })),
          totalCount: res.data.pagination.totalCount,
        };
      } else {
        const appParams: any = {
          search: exportFilters.search || undefined,
          status: exportFilters.status === 'all' ? undefined : exportFilters.status,
          branch: exportFilters.branch === 'all' ? undefined : exportFilters.branch,
          verificationStatus: exportFilters.verificationStatus === 'all' ? undefined : exportFilters.verificationStatus,
          page: 1,
          limit: 50,
        };
        Object.keys(appParams).forEach(k => appParams[k] === undefined && delete appParams[k]);

        if (exportFilters.jobId && exportFilters.jobId !== "all") {
          const res = await adminJobApplicationService.getJobApplicants(String(exportFilters.jobId), appParams);
          return {
            records: res.data.applicants.map((app) => ({
              id: app.id,
              fullName: app.user?.profile?.fullName || "N/A",
              rollNo: app.user?.profile?.rollNo || "N/A",
              email: app.user?.email,
              branch: app.user?.profile?.branch || "N/A",
              cgpa: app.user?.profile?.cgpa || "N/A",
              status: app.status,
            })),
            totalCount: res.data.pagination.total,
          };
        } else {
          const res = await adminJobApplicationService.getAllApplications(appParams);
          return {
            records: res.data.applicants.map((app) => ({
              id: app.id,
              fullName: app.user?.profile?.fullName || "N/A",
              rollNo: app.user?.profile?.rollNo || "N/A",
              email: app.user?.email,
              branch: app.user?.profile?.branch || "N/A",
              cgpa: app.user?.profile?.cgpa || "N/A",
              status: app.status,
            })),
            totalCount: res.data.pagination.total,
          };
        }
      }
    },
    enabled: exportType === type && previewTriggered === true,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useExportLogsQuery = (page: number, isProcessing: boolean) => {
  return useQuery({
    queryKey: QUERY_KEYS.EXPORT_LOGS(page),
    queryFn: () => adminExportService.getExportLogsService(page),
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: true,
    staleTime: 30_000,
    refetchInterval: isProcessing ? 3000 : false,
  });
};

export const useDeleteExportLogMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminExportService.deleteExportLogService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['export', 'logs'] });
      toast.success('Export log deleted');
    },
    onError: () => {
      toast.error('Failed to delete export log');
    },
  });
};
