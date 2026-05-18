'use client';

import React, { useState, useRef } from 'react';
import { Upload, FileText, X, RotateCcw, BarChart2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface AtsUploadSectionProps {
  onAnalyze: (file: File, jd: string) => void;
  isPending: boolean;
}

export function AtsUploadSection({ onAnalyze, isPending }: AtsUploadSectionProps) {
  const [file, setFile] = useState<File | null>(null);
  const [jd, setJd] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) setFile(selectedFile);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) setFile(droppedFile);
  };

  const handleClear = () => {
    setFile(null);
    setJd('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAnalyze = () => {
    if (file) onAnalyze(file, jd);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Step 1: Upload */}
      <div className="space-y-3">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Step 1 — Upload Resume
        </label>
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "relative group cursor-pointer border-2 border-dashed rounded-xl p-10 transition-all duration-300 flex flex-col items-center justify-center gap-4 bg-card shadow-sm hover:shadow-md",
            isDragging ? "border-primary bg-primary/5 scale-[0.99]" : "border-border hover:border-primary/50",
            file && "border-success/30 bg-success/5"
          )}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".pdf,.docx"
          />
          
          <div className={cn(
            "p-4 rounded-full bg-muted transition-transform duration-300 group-hover:scale-110",
            file && "bg-success/10 text-success"
          )}>
            <Upload className="w-8 h-8" />
          </div>

          <div className="text-center">
            <h3 className="text-lg font-semibold tracking-tight">
              {file ? file.name : "Drag & drop your resume here"}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              PDF or DOCX · Max 5MB
            </p>
          </div>

          {file && (
            <div className="mt-2 flex items-center gap-2 px-3 py-1.5 rounded-full bg-background border shadow-sm animate-in zoom-in-95 duration-200">
              <FileText className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium truncate max-w-[200px]">{file.name}</span>
              <button 
                onClick={(e) => { e.stopPropagation(); setFile(null); }}
                className="p-0.5 hover:bg-muted rounded-full transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Step 2: JD */}
      <div className="space-y-3">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Step 2 — Job Description (Optional)
        </label>
        <Textarea
          placeholder="Paste the job description here for a more accurate analysis. Leave empty for a generic score based on best practices for your role..."
          className="min-h-[150px] resize-none bg-card shadow-sm focus-visible:ring-primary/30"
          value={jd}
          onChange={(e) => setJd(e.target.value)}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <Button
          variant="outline"
          onClick={handleClear}
          disabled={isPending || (!file && !jd)}
          className="gap-2 px-6 h-11"
        >
          <RotateCcw className="w-4 h-4" />
          Clear
        </Button>
        <Button
          onClick={handleAnalyze}
          disabled={!file || isPending}
          className="gap-2 px-8 h-11 bg-gradient-to-br from-brand-blue to-brand-indigo text-white shadow-button hover:opacity-90 transition-all rounded-md"
        >
          <BarChart2 className="w-4 h-4" />
          {isPending ? "Analyzing..." : "Analyze resume"}
        </Button>
      </div>
    </div>
  );
}
