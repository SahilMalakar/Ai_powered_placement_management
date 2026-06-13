'use client';

import { useState, useEffect } from "react";
import { useAdminJobs } from "@/hooks/admin/useAdminJobs";
import { useExportMutation, useExportPreviewQuery, useExportStatusQuery } from "@/hooks/admin/useExport";
import { useAppStore } from "@/store/useAppStore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  FileSpreadsheet, 
  Users, 
  Briefcase, 
  Download, 
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BranchEnum } from "@/types/admin/job";
import ExportFieldSelector from "@/components/admin/export/ExportFieldSelector";
import ExportPreviewTable from "@/components/admin/export/ExportPreviewTable";
import ExportJobStatusPanel from "@/components/admin/export/ExportJobStatusPanel";
import { STUDENT_EXPORT_FIELDS, APPLICATION_EXPORT_FIELDS } from "@/constants/exportFieldConfig";
import { Separator } from "@/components/ui/separator";
import ExportHistoryPanel from "@/components/admin/export/ExportHistoryPanel";

export default function AdminExportPage() {
  const { 
    exportType, 
    setExportType,
    exportFilters,
    setExportFilters,
    setPreviewTriggered,
    exportJobId,
    exportStatus,
    exportDownloadUrl,
    exportError,
    resetExportState 
  } = useAppStore();
  
  // Field and record selection
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Student Filters State
  const [studentFilters, setStudentFilters] = useState({
    search: "",
    branch: "all",
    cgpa: "",
    backlogAllowed: false,
    verificationStatus: "all",
  });

  // Application Filters State
  const [appFilters, setAppFilters] = useState({
    search: "",
    jobId: "all",
    status: "all",
    branch: "all",
    verificationStatus: "all",
  });

  const { data: jobsResponse, isLoading: isJobsLoading } = useAdminJobs({ limit: 100 });
  const jobs = jobsResponse?.data?.jobs || [];

  // Reset selections on tab change
  useEffect(() => {
    setSelectedFields([]);
    setSelectedIds([]);
  }, [exportType]);

  // Sync active filters to store
  const activeFilters = exportType === "students" ? studentFilters : appFilters;
  
  // Sync active filters to store and reset previewTriggered
  useEffect(() => {
    setExportFilters(activeFilters);
    setPreviewTriggered(false);
  }, [activeFilters, setExportFilters, setPreviewTriggered]);

  // Debounce: wait 600ms after filters stop changing before triggering preview
  useEffect(() => {
    const timer = setTimeout(() => {
      setPreviewTriggered(true);
    }, 600);
    return () => clearTimeout(timer);
  }, [exportFilters, exportType, setPreviewTriggered]);

  // Enable polling if there's a processing job
  useExportStatusQuery(exportJobId);

  // Preview Query
  const { data: previewData, isLoading: isPreviewLoading } = useExportPreviewQuery(
    exportType, 
    activeFilters, 
    { enabled: exportStatus === "idle" || exportStatus === "failed" }
  );

  const exportMutation = useExportMutation();

  const handleExport = () => {
    const payload: any = {
      type: exportType,
    };
    
    if (selectedFields.length > 0) {
      payload.selectedFields = selectedFields;
    }
    
    if (selectedIds.length > 0) {
      payload.selectedIds = selectedIds;
    } else {
      if (exportType === "students") {
        if (studentFilters.search) payload.search = studentFilters.search;
        if (studentFilters.branch !== "all") payload.branch = studentFilters.branch;
        if (studentFilters.cgpa) payload.cgpa = studentFilters.cgpa;
        if (studentFilters.backlogAllowed) payload.backlogAllowed = true;
        if (studentFilters.verificationStatus !== "all") payload.verificationStatus = studentFilters.verificationStatus;
      } else {
        if (appFilters.search) payload.search = appFilters.search;
        if (appFilters.jobId !== "all") payload.jobId = Number(appFilters.jobId);
        if (appFilters.status !== "all") payload.status = appFilters.status;
        if (appFilters.branch !== "all") payload.branch = appFilters.branch;
        if (appFilters.verificationStatus !== "all") payload.verificationStatus = appFilters.verificationStatus;
      }
    }

    exportMutation.mutate(payload);
  };

  const isExporting = exportStatus === "processing";

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-5xl mx-auto pb-12">
      <div>
        <h1 className="text-3xl font-heading font-bold text-foreground flex items-center gap-3">
          <FileSpreadsheet className="size-8 text-primary" /> Data Export Center
        </h1>
        <p className="text-muted-foreground mt-1">
          Compile and download large, comprehensive datasets in CSV format via background workers.
        </p>
      </div>

      <ExportJobStatusPanel 
        status={exportStatus}
        downloadUrl={exportDownloadUrl}
        error={exportError}
        onReset={resetExportState}
      />

      <div className={cn("space-y-8 transition-opacity duration-300", exportStatus !== "idle" && exportStatus !== "failed" ? "opacity-50 pointer-events-none" : "opacity-100")}>
        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card 
            className={cn(
              "cursor-pointer transition-all duration-300 relative border-2 hover:border-primary/40 hover:shadow-heavy shadow-subtle group",
              exportType === "students" 
                ? "border-primary bg-primary/5 dark:bg-primary/5 shadow-heavy" 
                : "border-border bg-card"
            )}
            onClick={() => setExportType("students")}
          >
            {exportType === "students" && (
              <div className="absolute top-3 right-3 size-5 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold shadow-md">
                ✓
              </div>
            )}
            <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-3">
              <div className={cn(
                "p-3 rounded-2xl transition-all duration-300",
                exportType === "students" 
                  ? "bg-primary/10 text-primary shadow-sm" 
                  : "bg-muted text-mist group-hover:bg-primary/5 group-hover:text-primary"
              )}>
                <Users className="size-6" />
              </div>
              <div>
                <CardTitle className="text-lg font-heading font-bold">Student Profiles</CardTitle>
                <CardDescription className="text-xs">Export registered academic students directory.</CardDescription>
              </div>
            </CardHeader>
          </Card>

          <Card 
            className={cn(
              "cursor-pointer transition-all duration-300 relative border-2 hover:border-primary/40 hover:shadow-heavy shadow-subtle group",
              exportType === "applications" 
                ? "border-primary bg-primary/5 dark:bg-primary/5 shadow-heavy" 
                : "border-border bg-card"
            )}
            onClick={() => setExportType("applications")}
          >
            {exportType === "applications" && (
              <div className="absolute top-3 right-3 size-5 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold shadow-md">
                ✓
              </div>
            )}
            <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-3">
              <div className={cn(
                "p-3 rounded-2xl transition-all duration-300",
                exportType === "applications" 
                  ? "bg-primary/10 text-primary shadow-sm" 
                  : "bg-muted text-mist group-hover:bg-primary/5 group-hover:text-primary"
              )}>
                <Briefcase className="size-6" />
              </div>
              <div>
                <CardTitle className="text-lg font-heading font-bold">Job Applications</CardTitle>
                <CardDescription className="text-xs">Export active student applicants and recruitment statuses.</CardDescription>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Configurations Form */}
        <Card className="border-none shadow-heavy bg-card">
          <CardHeader className="border-b border-border/50 pb-6">
            <CardTitle className="text-xl font-heading font-bold text-foreground">
              Configure Export Parameters
            </CardTitle>
            <CardDescription>
              Filter records and select specific columns to tailor the CSV output.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 md:p-8 space-y-8">
            {/* Filter Inputs Form */}
            <div className="space-y-4">
              <h3 className="text-sm font-heading font-bold text-foreground mb-4">1. Filter Data</h3>
              {exportType === "students" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="search">Name or Roll Number Search</Label>
                    <Input 
                      id="search" 
                      placeholder="e.g. John Doe"
                      value={studentFilters.search}
                      onChange={(e) => setStudentFilters({ ...studentFilters, search: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="branch">Academic Branch Selection</Label>
                    <Select 
                      value={studentFilters.branch} 
                      onValueChange={(val) => setStudentFilters({ ...studentFilters, branch: val || "all" })}
                    >
                      <SelectTrigger id="branch" className="bg-card">
                        <SelectValue placeholder="All Branches" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Branches</SelectItem>
                        {BranchEnum.map((branch) => (
                          <SelectItem key={branch} value={branch}>{branch}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cgpa">Minimum CGPA Filter</Label>
                    <Input 
                      id="cgpa" 
                      type="number" 
                      step="0.01" 
                      placeholder="e.g. 7.5"
                      value={studentFilters.cgpa}
                      onChange={(e) => setStudentFilters({ ...studentFilters, cgpa: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="verification">Verification Status</Label>
                    <Select 
                      value={studentFilters.verificationStatus} 
                      onValueChange={(val) => setStudentFilters({ ...studentFilters, verificationStatus: val || "all" })}
                    >
                      <SelectTrigger id="verification" className="bg-card">
                        <SelectValue placeholder="All Statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="VERIFIED">Verified Only</SelectItem>
                        <SelectItem value="PROCESSING">Processing Only</SelectItem>
                        <SelectItem value="NOT_VERIFIED">Not Verified Only</SelectItem>
                        <SelectItem value="FAILED">Failed Verification Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between border border-border p-4 rounded-xl md:col-span-2">
                    <div className="space-y-0.5">
                      <Label htmlFor="backlog" className="text-base font-bold text-foreground">Allow Backlog Students</Label>
                      <p className="text-xs text-muted-foreground">Only export students who have active or previous academic backlogs.</p>
                    </div>
                    <Checkbox 
                      id="backlog"
                      checked={studentFilters.backlogAllowed}
                      onCheckedChange={(checked: boolean | "indeterminate") => setStudentFilters({ ...studentFilters, backlogAllowed: checked === true })}
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="job">Associated Job Posting</Label>
                    <Select 
                      value={appFilters.jobId} 
                      onValueChange={(val) => setAppFilters({ ...appFilters, jobId: val || "all" })}
                      disabled={isJobsLoading}
                    >
                      <SelectTrigger id="job" className="bg-card">
                        <SelectValue placeholder={isJobsLoading ? "Loading jobs..." : "All Jobs"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Job Postings</SelectItem>
                        {jobs.map((job: any) => (
                          <SelectItem key={job.id} value={String(job.id)}>
                            {job.title} ({job.company})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="appSearch">Applicant Name or Email Search</Label>
                    <Input 
                      id="appSearch" 
                      placeholder="e.g. John Doe"
                      value={appFilters.search}
                      onChange={(e) => setAppFilters({ ...appFilters, search: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="appStatus">Application Status</Label>
                    <Select 
                      value={appFilters.status} 
                      onValueChange={(val) => setAppFilters({ ...appFilters, status: val || "all" })}
                    >
                      <SelectTrigger id="appStatus" className="bg-card">
                        <SelectValue placeholder="All Statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="APPLIED">Applied</SelectItem>
                        <SelectItem value="SHORTLISTED">Shortlisted</SelectItem>
                        <SelectItem value="SELECTED">Selected</SelectItem>
                        <SelectItem value="REJECTED">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="appBranch">Student Branch</Label>
                    <Select 
                      value={appFilters.branch} 
                      onValueChange={(val) => setAppFilters({ ...appFilters, branch: val || "all" })}
                    >
                      <SelectTrigger id="appBranch" className="bg-card">
                        <SelectValue placeholder="All Branches" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Branches</SelectItem>
                        {BranchEnum.map((branch) => (
                          <SelectItem key={branch} value={branch}>{branch}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="appVerification">Student Profile Verification</Label>
                    <Select 
                      value={appFilters.verificationStatus} 
                      onValueChange={(val) => setAppFilters({ ...appFilters, verificationStatus: val || "all" })}
                    >
                      <SelectTrigger id="appVerification" className="bg-card">
                        <SelectValue placeholder="All Statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="VERIFIED">Verified Only</SelectItem>
                        <SelectItem value="PROCESSING">Processing Only</SelectItem>
                        <SelectItem value="NOT_VERIFIED">Not Verified Only</SelectItem>
                        <SelectItem value="FAILED">Failed Verification Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>

            {/* Field Selection */}
            <div className="pt-6 border-t border-border/50">
              <ExportFieldSelector 
                fields={exportType === "students" ? STUDENT_EXPORT_FIELDS : APPLICATION_EXPORT_FIELDS}
                selectedFields={selectedFields}
                onChange={setSelectedFields}
              />
            </div>

            {/* Data Preview & Record Selection */}
            <div className="pt-6 border-t border-border/50">
              <ExportPreviewTable 
                type={exportType}
                records={previewData?.records || []}
                totalCount={previewData?.totalCount || 0}
                isLoading={isPreviewLoading}
                selectedIds={selectedIds}
                onChange={setSelectedIds}
              />
            </div>

            {/* Guidelines Section */}
            <div className="bg-muted/30 border border-border p-4 rounded-xl space-y-2 text-xs text-muted-foreground mt-4">
              <h4 className="font-heading font-bold text-foreground flex items-center gap-1.5">
                <Clock className="size-3.5" /> Queue Processing Protocols
              </h4>
              <ul className="list-disc pl-4 space-y-1">
                <li>High-volume data queries are compiled dynamically via secondary worker threads.</li>
                <li>Generated CSV reports are uploaded to secure raw cloud repository and auto-expire after <strong>1 hour</strong>.</li>
                <li>Closing this page during execution <strong>will not abort</strong> background file compilation.</li>
              </ul>
            </div>

            <div className="pt-4 border-t border-border/50 flex justify-end">
              <Button
                className="px-6 py-5 bg-gradient-to-r from-brand-blue to-brand-indigo hover:opacity-90 transition-all text-white font-semibold rounded-md shadow-button border-none flex items-center gap-2 group cursor-pointer disabled:opacity-50"
                onClick={handleExport}
                disabled={isExporting || exportMutation.isPending}
              >
                <Download className={cn("size-5 transition-transform duration-300", (isExporting || exportMutation.isPending) ? "animate-bounce" : "group-hover:translate-y-0.5")} />
                {isExporting || exportMutation.isPending ? "Compiling CSV in Background..." : `Compile and Export ${exportType === 'students' ? 'Students' : 'Applications'}`}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator className="my-8" />
      <ExportHistoryPanel />
    </div>
  );
}
