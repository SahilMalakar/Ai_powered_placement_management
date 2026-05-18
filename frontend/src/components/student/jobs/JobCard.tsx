'use client';

import { Job } from "@/types/student/job";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Briefcase, GraduationCap, GitBranch, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, isPast } from "date-fns";

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

import { useRouter } from "next/navigation";

interface JobCardProps {
  job: Job;
}

export function JobCard({ job }: JobCardProps) {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { mutate: apply, isPending } = useApplyJob();

  const {
    id,
    title,
    company,
    allowedBranches,
    requiredCgpa,
    backlogAllowed,
    deadline,
    status,
  } = job;

  const initials = company.charAt(0).toUpperCase();
  const isExpired = isPast(new Date(deadline));

  const handleApply = (e: React.MouseEvent) => {
    e.stopPropagation();
    apply(id, {
      onSuccess: () => {
        setIsDialogOpen(false);
      },
    });
  };

  const handleCardClick = () => {
    router.push(`/jobs/${id}`);
  };

  return (
    <Card
      className={cn(
        "relative transition-all duration-200 hover:translate-y-[-2px] group cursor-pointer",
        isExpired && "opacity-55 grayscale-[0.2]"
      )}
      onClick={handleCardClick}
    >
      <CardContent className="pt-6">
        {/* Header: Icon + Title + Company */}
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted font-heading text-xl font-bold text-foreground">
            {initials}
          </div>
          <div className="flex-1 min-w-0 space-y-1">
            <h3 className="font-heading text-lg font-semibold leading-tight tracking-tight text-foreground">
              {title}
            </h3>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Briefcase className="size-3.5 shrink-0" />
              <span className="font-medium">{company}</span>
            </div>
          </div>
        </div>

        {/* Badges: Branches, CGPA, Backlog, Deadline */}
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge variant="outline" className="gap-1 bg-secondary border-border text-foreground">
            <GitBranch className="size-3" />
            {allowedBranches.join(", ")}
          </Badge>
          <Badge variant="outline" className="gap-1 bg-secondary border-border text-foreground">
            <GraduationCap className="size-3" />
            CGPA ≥ {requiredCgpa}
          </Badge>
          <Badge
            variant="outline"
            className={cn(
              "bg-secondary border-border text-foreground",
              backlogAllowed
                ? "bg-success/10 border-success/20 text-success dark:bg-success/10 dark:border-success/20 dark:text-success"
                : ""
            )}
          >
            {backlogAllowed ? "Backlog OK" : "No backlog"}
          </Badge>
        </div>

        {/* Footer: Deadline + Apply */}
        <div className="mt-6 flex items-center justify-between border-t pt-4 border-border/50">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            {isExpired ? (
              <>
                <AlertTriangle className="size-3.5 text-error" />
                <span className="text-error font-medium">
                  Closed {format(new Date(deadline), "d MMM yyyy")}
                </span>
              </>
            ) : (
              <>
                <Calendar className="size-3.5" />
                <span>Closes {format(new Date(deadline), "d MMM yyyy")}</span>
              </>
            )}
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger
              render={
                <Button
                  onClick={(e) => e.stopPropagation()}
                  disabled={isExpired || status !== "ACTIVE" || isPending}
                  className={cn(
                    "min-w-[100px]",
                    (isExpired || status !== "ACTIVE") &&
                      "bg-muted text-muted-foreground border-none shadow-none"
                  )}
                />
              }
            >
              {isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : isExpired ? (
                "Expired"
              ) : status !== "ACTIVE" ? (
                "Unavailable"
              ) : (
                "Apply"
              )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]" onClick={(e) => e.stopPropagation()}>
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
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsDialogOpen(false);
                  }}
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
        </div>
      </CardContent>
    </Card>
  );
}

