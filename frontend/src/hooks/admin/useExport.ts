import { useMutation } from "@tanstack/react-query";
import { adminExportService } from "@/services/admin/export.service";
import { toast } from "sonner";

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
