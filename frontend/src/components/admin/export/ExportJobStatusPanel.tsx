'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Download, AlertCircle, CheckCircle, RefreshCcw } from "lucide-react";
import { ExportJobStatus } from "@/types/admin/export";

interface ExportJobStatusPanelProps {
  status: ExportJobStatus;
  downloadUrl: string | null;
  error: string | null;
  onReset: () => void;
}

export default function ExportJobStatusPanel({
  status,
  downloadUrl,
  error,
  onReset,
}: ExportJobStatusPanelProps) {
  if (status === 'idle') return null;

  return (
    <Card className="border border-border/80 shadow-heavy overflow-hidden bg-card transition-all duration-500 animate-in fade-in slide-in-from-top-4">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 flex-1">
            {status === 'processing' && (
              <div className="p-3 bg-primary/10 text-primary rounded-full animate-pulse">
                <Loader2 className="size-6 animate-spin" />
              </div>
            )}
            {status === 'completed' && (
              <div className="p-3 bg-[#1D9E75]/10 text-[#1D9E75] rounded-full">
                <CheckCircle className="size-6" />
              </div>
            )}
            {status === 'failed' && (
              <div className="p-3 bg-[#E24B4A]/10 text-[#E24B4A] rounded-full">
                <AlertCircle className="size-6" />
              </div>
            )}

            <div className="space-y-1 text-center md:text-left flex-1">
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <h4 className="text-base font-heading font-bold text-foreground">
                  {status === 'processing' && "Compiling and Serializing CSV..."}
                  {status === 'completed' && "CSV Export Completed!"}
                  {status === 'failed' && "CSV Export Failed"}
                </h4>
                <Badge
                  variant="outline"
                  className={`text-[10px] font-semibold py-0 px-2 border uppercase ${
                    status === 'processing'
                      ? "bg-[#EF9F27]/10 border-[#EF9F27]/20 text-[#EF9F27]"
                      : status === 'completed'
                      ? "bg-[#1D9E75]/10 border-[#1D9E75]/20 text-[#1D9E75]"
                      : "bg-[#E24B4A]/10 border-[#E24B4A]/20 text-[#E24B4A]"
                  }`}
                >
                  {status}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {status === 'processing' && "Our BullMQ workers are assembling your whitelisted columns in the background. Please wait..."}
                {status === 'completed' && "Your CSV download has been generated and uploaded to the secure raw repository."}
                {status === 'failed' && (error || "Something went wrong during export. Please try again.")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {status === 'completed' && downloadUrl && (
              <Button
                onClick={() => window.open(downloadUrl, '_blank')}
                className="px-5 py-4 bg-gradient-to-r from-brand-blue to-brand-indigo hover:opacity-90 transition-all text-white font-heading font-semibold rounded-md shadow-button border-none flex items-center gap-2 cursor-pointer"
              >
                <Download className="size-4" /> Download File
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={onReset}
              className="text-xs font-heading font-semibold border-border hover:bg-muted text-foreground cursor-pointer flex items-center gap-1.5"
            >
              <RefreshCcw className="size-3.5" /> Start New Export
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
