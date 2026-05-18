import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface DashboardJob {
  id: number;
  title: string;
  company: string;
  deadline: string;
  minCgpa: number;
  eligible: boolean;
}

export interface RecommendedJobsProps {
  jobs: DashboardJob[];
  onApply?: (jobId: number) => void;
  applyingJobId?: number | null;
}

export function RecommendedJobs({ 
  jobs, 
  onApply, 
  applyingJobId 
}: RecommendedJobsProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground font-heading">
          Recommended Jobs for You
        </h2>
        <Link 
          href="/jobs" 
          className="text-xs text-brand-blue hover:text-brand-indigo transition-colors"
        >
          See all
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {jobs.map((job) => (
          <Card 
            key={job.id} 
            className="bg-card border border-border p-5 rounded-xl shadow-card hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex flex-col justify-between dark:bg-[#141414] dark:border-[#202020]"
          >
            <div>
              <div className="flex items-start justify-between gap-4">
                <Badge variant="success" className="bg-success/10 text-success border border-success/20 text-[9px] uppercase font-bold tracking-wider rounded-full px-2 py-0.5 shrink-0">
                  Eligible
                </Badge>
                <span className="text-[10px] text-muted-foreground font-mono">
                  {job.deadline}
                </span>
              </div>

              <h3 className="text-base font-bold text-foreground mt-3 font-heading leading-tight">
                {job.title}
              </h3>
              <p className="text-xs text-muted-foreground font-body mt-1">
                {job.company}
              </p>
            </div>

            <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/10">
              <span className="text-[11px] font-mono text-slate-300 bg-[#1a1a1a] border border-[#2a2a2a] px-2 py-1 rounded">
                Min CGPA: {job.minCgpa}
              </span>
              
              {onApply ? (
                <button 
                  onClick={() => onApply(job.id)}
                  disabled={applyingJobId === job.id}
                  className={cn(
                    buttonVariants({ variant: "default", size: "default" }),
                    "h-8 gap-1.5 px-3.5 text-xs font-semibold text-white rounded-md bg-gradient-to-r from-brand-blue to-brand-indigo shadow-button hover:opacity-90 active:translate-y-px transition-all border-none cursor-pointer flex items-center justify-center disabled:opacity-50"
                  )}
                >
                  {applyingJobId === job.id ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                      Applying...
                    </>
                  ) : (
                    "Apply Now"
                  )}
                </button>
              ) : (
                <Link 
                  href="/jobs"
                  className={cn(
                    buttonVariants({ variant: "default", size: "default" }),
                    "h-8 gap-1.5 px-3.5 text-xs font-semibold text-white rounded-md bg-gradient-to-r from-brand-blue to-brand-indigo shadow-button hover:opacity-90 active:translate-y-px transition-all border-none cursor-pointer"
                  )}
                >
                  Apply Now
                </Link>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
