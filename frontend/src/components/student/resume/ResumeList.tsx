'use client';

import { useState } from "react";
import { format } from "date-fns";
import { useAllResumesQuery, useDeleteResumeMutation } from "@/hooks/student/useOptimizeResume";
import { useAppStore } from "@/store/useAppStore";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Loader2, Download, Trash2 } from "lucide-react";

export function ResumeList() {
  const { data: resumes, isLoading } = useAllResumesQuery();
  const deleteMutation = useDeleteResumeMutation();
  const { isResumePolling } = useAppStore();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  // Sort by createdAt desc
  const sortedResumes = resumes ? [...resumes].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ) : [];

  if (sortedResumes.length === 0 && !isResumePolling) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FileText className="h-12 w-12 text-muted-foreground/50 mb-3" />
        <h3 className="text-lg font-medium text-foreground">No resumes yet</h3>
        <p className="text-sm text-muted-foreground">Upload a resume above to get started.</p>
      </div>
    );
  }

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this resume?")) {
      setDeletingId(id);
      deleteMutation.mutate(id, {
        onSettled: () => setDeletingId(null),
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "GENERATING":
        return (
          <Badge variant="outline" className="border-warning/30 bg-warning/10 text-warning flex items-center gap-1">
            <Loader2 className="animate-spin size-3" />
            Processing
          </Badge>
        );
      case "COMPLETED":
        return (
          <Badge variant="outline" className="border-[#1D9E75]/30 bg-[#1D9E75]/10 text-[#1D9E75]">
            Ready
          </Badge>
        );
      case "FAILED":
        return (
          <Badge variant="outline" className="border-[#E24B4A]/30 bg-[#E24B4A]/10 text-[#E24B4A]">
            Failed
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {sortedResumes.map((resume) => (
        <Card key={resume.id} className="bg-card border-border rounded-lg p-4 shadow-card hover:shadow-card-hover transition-all duration-200">
          <div className="flex items-center justify-between gap-4">
            {/* Left side info */}
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <span className="font-heading font-medium text-foreground">
                  Version {resume.version}
                </span>
                {getStatusBadge(resume.status)}
              </div>
              <p className="text-xs text-muted-foreground font-body">
                {format(new Date(resume.createdAt), "dd MMM yyyy")}
              </p>
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-1">
              {resume.status === "COMPLETED" && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    if (resume.pdfUrl) {
                      window.open(resume.pdfUrl, "_blank");
                    }
                  }}
                >
                  <Download className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-[#E24B4A] hover:bg-[#E24B4A]/10"
                onClick={() => handleDelete(resume.id)}
                disabled={deletingId === resume.id}
              >
                {deletingId === resume.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
