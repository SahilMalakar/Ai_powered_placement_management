'use client';

import { useState, useRef } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useOptimizeResumeMutation } from "@/hooks/student/useOptimizeResume";
import { ResumeJobStatusPanel } from "@/components/student/resume/ResumeJobStatusPanel";
import { ResumeList } from "@/components/student/resume/ResumeList";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Upload, FileText, Sparkles, Loader2, X } from "lucide-react";

export default function OptimizeResumePage() {
  const { isResumePolling, activeResumeId } = useAppStore();
  const optimizeMutation = useOptimizeResumeMutation();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragActive, setIsDragActive] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleFile = (file: File) => {
    // Validate file type
    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword"
    ];
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    const isValidType = validTypes.includes(file.type) || extension === "pdf" || extension === "docx";
    if (!isValidType) {
      toast.error("Please upload a PDF or DOCX file only.");
      return;
    }

    // Validate file size (Max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size exceeds 10MB limit.");
      return;
    }

    setSelectedFile(file);
  };

  // Drag handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removeSelectedFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleOptimize = () => {
    if (!selectedFile) return;

    optimizeMutation.mutate(selectedFile, {
      onSuccess: () => {
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    });
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12 animate-in fade-in duration-500">
      {/* Page Header */}
      <div>
        <h1 className="font-heading text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          Optimize Resume
        </h1>
        <p className="text-muted-foreground mt-2 font-body text-base">
          Upload your resume and let AI enhance it without fabricating anything.
        </p>
      </div>

      {/* Upload Section — Card */}
      <Card className="bg-card border-border rounded-lg p-6 shadow-card hover:shadow-card-hover transition-all duration-300">
        <div className="flex items-center gap-2 mb-4">
          <Upload className="size-5 text-muted-foreground" />
          <h2 className="font-heading text-lg font-bold">Upload Resume</h2>
        </div>

        {/* File dropzone area */}
        <div
          onClick={triggerFileInput}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-all duration-200 ${
            isDragActive 
              ? "border-primary bg-primary/5" 
              : "border-border hover:border-primary/50 hover:bg-secondary/20"
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept=".pdf,.docx"
            className="hidden"
          />

          {!selectedFile ? (
            <div className="flex flex-col items-center gap-2">
              <div className="h-10 w-10 bg-secondary/50 rounded-full flex items-center justify-center text-muted-foreground mb-1">
                <FileText className="size-5" />
              </div>
              <p className="text-sm font-medium text-foreground">
                Drop your PDF or DOCX here
              </p>
              <p className="text-xs text-muted-foreground font-body">
                or click to browse
              </p>
              <p className="text-xs text-muted-foreground font-body mt-2">
                PDF or DOCX &bull; Max 10MB
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-1">
                <FileText className="size-6" />
              </div>
              <div className="flex items-center gap-2 max-w-full px-4">
                <span className="text-sm font-medium truncate text-foreground">
                  {selectedFile.name}
                </span>
                <button
                  type="button"
                  onClick={removeSelectedFile}
                  className="text-muted-foreground hover:text-foreground hover:bg-secondary rounded p-0.5"
                  aria-label="Remove file"
                >
                  <X className="size-4" />
                </button>
              </div>
              <p className="text-xs text-muted-foreground font-mono">
                {formatFileSize(selectedFile.size)}
              </p>
            </div>
          )}
        </div>

        {/* Optimize button */}
        <div className="mt-5">
          <Button
            onClick={handleOptimize}
            disabled={!selectedFile || isResumePolling}
            className="w-full bg-gradient-to-r from-brand-blue to-brand-indigo hover:opacity-90 text-white shadow-button rounded-md font-semibold h-10"
          >
            {isResumePolling ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Optimizing...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Optimize Resume
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Job Status Panel */}
      {(isResumePolling || activeResumeId !== null) && (
        <div className="animate-in fade-in duration-300">
          <ResumeJobStatusPanel />
        </div>
      )}

      {/* Separator + Heading */}
      <div className="space-y-4">
        <Separator className="border-border" />
        <h2 className="font-heading text-xl font-bold text-foreground">
          Your Resumes
        </h2>
        <ResumeList />
      </div>
    </div>
  );
}
