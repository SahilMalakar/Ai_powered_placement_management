'use client';

import { useJob } from "@/hooks/student/useJob";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowLeft, 
  Building2, 
  Calendar,  
  GraduationCap, 
  GitBranch, 
  AlertTriangle,
  Clock
} from "lucide-react";
import { format, isPast } from "date-fns";
import { cn } from "@/lib/utils";
import { useApplyJob } from "@/hooks/student/useApplyJob";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export default function JobDetailsPage() {
  const { jobId } = useParams();
  const router = useRouter();
  const { data: job, isLoading, isError } = useJob(Number(jobId));
  const { mutate: apply, isPending } = useApplyJob();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8 animate-pulse">
        <Skeleton className="h-8 w-32" />
        <div className="space-y-4">
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (isError || !job) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-error mb-4">Job Not Found</h2>
        <p className="text-muted-foreground mb-8">The job you are looking for might have been removed or is unavailable.</p>
        <Button onClick={() => router.back()} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
        </Button>
      </div>
    );
  }

  const {
    id,
    title,
    company,
    description,
    allowedBranches,
    requiredCgpa,
    backlogAllowed,
    deadline,
    status,
  } = job;

  const isExpired = isPast(new Date(deadline));

  const handleApply = () => {
    apply(id, {
      onSuccess: () => {
        setIsDialogOpen(false);
      },
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Back Button */}
      <Button 
        variant="ghost" 
        onClick={() => router.back()} 
        className="text-muted-foreground hover:text-foreground -ml-2"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Jobs
      </Button>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-6 bg-card p-6 md:p-8 rounded-2xl border border-border/50 shadow-sm">
        <div className="space-y-4 flex-1">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl md:text-4xl font-heading font-bold text-navy dark:text-foreground leading-tight">
                {title}
              </h1>
              {status === 'ACTIVE' && !isExpired && (
                <Badge className="bg-success/10 text-success border-success/20 hover:bg-success/20">
                  Active
                </Badge>
              )}
            </div>
            <div className="flex items-center text-xl text-steel dark:text-muted-foreground font-medium gap-2">
              <Building2 className="size-5 text-mist" />
              {company}
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-mist dark:text-muted-foreground/70">
            <div className="flex items-center gap-1.5">
              <Calendar className="size-4" />
              <span>Posted on {format(new Date(job.createdAt), "d MMM yyyy")}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="size-4" />
              <span className={cn(isExpired && "text-error font-medium")}>
                {isExpired ? "Closed" : `Closes ${format(new Date(deadline), "d MMM yyyy")}`}
              </span>
            </div>
          </div>
        </div>

        {/* Application Status or Apply Button */}
        {job.applicationStatus ? (
          <div className="w-full md:w-auto flex flex-col items-center gap-2">
            <Badge
              className={cn(
                "px-5 py-2.5 text-base font-semibold rounded-lg border shadow-sm",
                job.applicationStatus === 'APPLIED' && "bg-primary/10 text-primary border-primary/20",
                job.applicationStatus === 'SHORTLISTED' && "bg-warning/10 text-warning border-warning/20",
                job.applicationStatus === 'SELECTED' && "bg-success/10 text-success border-success/20",
                job.applicationStatus === 'REJECTED' && "bg-error/10 text-error border-error/20"
              )}
            >
              {job.applicationStatus === 'APPLIED' && "✓ Applied"}
              {job.applicationStatus === 'SHORTLISTED' && "⏳ Shortlisted"}
              {job.applicationStatus === 'SELECTED' && "🎉 Selected"}
              {job.applicationStatus === 'REJECTED' && "✗ Not Selected"}
            </Badge>
            <span className="text-xs text-muted-foreground">
              You have already applied
            </span>
          </div>
        ) : (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger
              render={
                <Button
                  size="lg"
                  disabled={isExpired || status !== "ACTIVE" || isPending}
                  className={cn(
                    "w-full md:w-auto min-w-[140px] text-lg py-6",
                    (isExpired || status !== "ACTIVE") &&
                      "bg-muted text-muted-foreground border-none shadow-none"
                  )}
                />
              }
            >
              {isPending ? (
                <Loader2 className="size-5 animate-spin" />
              ) : isExpired ? (
                "Expired"
              ) : status !== "ACTIVE" ? (
                "Unavailable"
              ) : (
                "Apply Now"
              )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Confirm Application</DialogTitle>
                <DialogDescription>
                  Are you sure you want to apply for <strong>{title}</strong> at{" "}
                  <strong>{company}</strong>? A snapshot of your current profile
                  will be shared with the company.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button onClick={handleApply} disabled={isPending}>
                  {isPending ? "Applying..." : "Confirm & Apply"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Quick Stats / Criteria */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-card p-6 rounded-xl border border-border/50 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-mist dark:text-muted-foreground/60 text-sm font-medium">
            <GitBranch className="size-4" />
            Allowed Branches
          </div>
          <div className="flex flex-wrap gap-1.5">
            {allowedBranches.map((branch: string) => (
              <Badge key={branch} variant="outline" className="bg-pale/30 border-pale text-deep-blue dark:bg-muted/50 dark:border-border dark:text-foreground">
                {branch}
              </Badge>
            ))}
          </div>
        </div>

        <div className="bg-card p-6 rounded-xl border border-border/50 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-mist dark:text-muted-foreground/60 text-sm font-medium">
            <GraduationCap className="size-4" />
            Min. CGPA Requirement
          </div>
          <div className="text-2xl font-bold text-navy dark:text-foreground">
            {requiredCgpa} <span className="text-sm font-normal text-mist">/ 10</span>
          </div>
        </div>

        <div className="bg-card p-6 rounded-xl border border-border/50 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-mist dark:text-muted-foreground/60 text-sm font-medium">
            <AlertTriangle className="size-4" />
            Backlog Policy
          </div>
          <div className={cn(
            "text-lg font-semibold",
            backlogAllowed ? "text-success" : "text-steel"
          )}>
            {backlogAllowed ? "Allowed" : "No Backlogs Allowed"}
          </div>
        </div>
      </div>

      {/* Main Content Sections */}
      <div className="space-y-8">
        <div className="bg-card p-8 rounded-2xl border border-border/50 shadow-sm space-y-6">
          <h2 className="text-2xl font-heading font-bold text-navy dark:text-foreground border-b pb-4 border-border/50">
            Job Description
          </h2>
          <div 
            className="prose prose-slate dark:prose-invert max-w-none text-steel dark:text-muted-foreground leading-relaxed text-lg"
            dangerouslySetInnerHTML={{ __html: description }}
          />
        </div>
      </div>
    </div>
  );
}
