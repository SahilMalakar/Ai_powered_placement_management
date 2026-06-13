import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
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
      } else if (status === 'failed') {
        setHasHandled(true);
        setExportError(error || "Export failed on the server.");
        toast.error(error || "Export failed on the server.");
      }
    }
  }, [query.data, hasHandled, setExportStatus, setExportDownloadUrl, setExportError]);

  return query;
};

export const useExportPreviewQuery = (
  type: "students" | "applications",
  filters: any,
  options: { enabled?: boolean } = {}
) => {
  return useQuery({
    queryKey: [QUERY_KEYS.ADMIN_EXPORT_PREVIEW, type, filters],
    queryFn: async () => {
      if (type === "students") {
        const queryParams: any = {
          page: 1,
          limit: 10,
        };
        if (filters.search) queryParams.search = filters.search;
        if (filters.branch && filters.branch !== "all") queryParams.branch = filters.branch;
        if (filters.cgpa) queryParams.cgpa = filters.cgpa;
        if (filters.backlogAllowed !== undefined) queryParams.backlogAllowed = filters.backlogAllowed;
        if (filters.verificationStatus && filters.verificationStatus !== "all") {
          queryParams.verificationStatus = filters.verificationStatus;
        }

        const res = await adminStudentService.getAllStudents(queryParams);
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
        const queryParams: any = {
          page: 1,
          limit: 10,
        };
        if (filters.search) queryParams.search = filters.search;
        if (filters.status && filters.status !== "all") queryParams.status = filters.status;
        if (filters.branch && filters.branch !== "all") queryParams.branch = filters.branch;
        if (filters.verificationStatus && filters.verificationStatus !== "all") {
          queryParams.verificationStatus = filters.verificationStatus;
        }

        if (filters.jobId && filters.jobId !== "all") {
          const res = await adminJobApplicationService.getJobApplicants(String(filters.jobId), queryParams);
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
          const res = await adminJobApplicationService.getAllApplications(queryParams);
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
    enabled: options.enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
