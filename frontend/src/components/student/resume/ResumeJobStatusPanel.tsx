'use client';

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAppStore } from "@/store/useAppStore";
import { useResumeByIdQuery } from "@/hooks/student/useOptimizeResume";
import { QUERY_KEYS } from "@/constants/query-keys";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle, Download } from "lucide-react";

export function ResumeJobStatusPanel() {
  const queryClient = useQueryClient();
  const { activeResumeId, isResumePolling, setResumePolling, clearResumeJob } = useAppStore();

  const { data, isLoading } = useResumeByIdQuery(activeResumeId, isResumePolling);

  useEffect(() => {
    if (!data) return;

    if (data.status === "COMPLETED") {
      setResumePolling(false);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ALL_RESUMES });
      toast.success("Resume ready to download!");
    } else if (data.status === "FAILED") {
      setResumePolling(false);
      toast.error("Resume optimization failed. Please try again.");
    }
  }, [data?.status, setResumePolling, queryClient]);

  // If there's no active job/polling, don't show the panel
  if (!activeResumeId) return null;

  // Render based on loading/generating status
  const status = data?.status || "GENERATING";

  if (status === "GENERATING" || isLoading) {
    return (
      <Card className="bg-card border-border rounded-lg p-5">
        <div className="flex items-center gap-3">
          <Loader2 className="animate-spin text-primary size-5" />
          <span className="font-medium">Optimizing your resume...</span>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          This runs in the background across multiple AI stages. You can safely stay on this page.
        </p>
        <Progress value={100} className="animate-pulse mt-3" />
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Domain classification &rarr; Content extraction &rarr; Optimization loop &rarr; Integrity check &rarr; PDF generation
        </p>
      </Card>
    );
  }

  if (status === "COMPLETED") {
    return (
      <Card className="border border-[#1D9E75]/30 bg-[#1D9E75]/5 p-5">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="text-[#1D9E75] size-5" />
          <span className="font-medium text-foreground">Resume Optimized Successfully</span>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Your resume has been enhanced and is ready to download.
        </p>
        <div className="flex gap-3 mt-4">
          <Button
            onClick={() => {
              if (data?.pdfUrl) {
                window.open(data.pdfUrl, "_blank");
              } else {
                toast.error("PDF download link is not available.");
              }
            }}
            className="bg-gradient-to-r from-brand-blue to-brand-indigo hover:opacity-90 text-white shadow-button rounded-md font-semibold"
          >
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
          <Button
            variant="ghost"
            onClick={() => clearResumeJob()}
            className="hover:bg-accent"
          >
            Start New
          </Button>
        </div>
      </Card>
    );
  }

  if (status === "FAILED") {
    return (
      <Card className="border border-[#E24B4A]/30 bg-[#E24B4A]/5 p-5">
        <div className="flex items-center gap-3">
          <XCircle className="text-[#E24B4A] size-5" />
          <span className="font-medium text-foreground">Optimization Failed</span>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          An error occurred during optimization. Please try again.
        </p>
        <div className="flex gap-3 mt-4">
          <Button
            variant="outline"
            onClick={() => clearResumeJob()}
            className="border-border hover:bg-accent"
          >
            Try Again
          </Button>
        </div>
      </Card>
    );
  }

  return null;
}
