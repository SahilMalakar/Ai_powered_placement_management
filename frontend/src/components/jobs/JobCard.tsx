'use client';

import { Job } from "@/types/job";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

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

interface JobCardProps {
  job: Job;
}

export function JobCard({ job }: JobCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { mutate: apply, isPending } = useApplyJob();

  const {
    id,
    title,
    company,
    location,
    ctc,
    allowedBranches,
    requiredCgpa,
    backlogAllowed,
    deadline,
    eligible = true,
    ineligibilityReason = "",
  } = job;

  const initials = company.charAt(0).toUpperCase();

  const handleApply = () => {
    apply(id, {
      onSuccess: () => {
        setIsDialogOpen(false);
      },
    });
  };

  return (
    <Card
      className={cn(
        "relative transition-all duration-200 hover:translate-y-[-2px]",
        !eligible && "opacity-55 grayscale-[0.2]"
      )}
    >
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-pale font-heading text-xl font-bold text-deep-blue dark:bg-muted dark:text-foreground">
            {initials}
          </div>
          <div className="flex-1 space-y-1">
            <h3 className="font-heading text-lg font-semibold leading-none tracking-tight">
              {title}
            </h3>
            <div className="flex items-center gap-1.5 text-sm text-steel dark:text-muted-foreground">
              <span className="font-medium">{company}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="size-3" />
                {location || "Location TBD"}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-mist dark:text-muted-foreground/60 pt-1">
              <Calendar className="size-3" />
              <span>Closes {format(new Date(deadline), "d MMM yyyy")}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <Badge variant="outline" className="bg-pale/30 border-pale text-deep-blue dark:bg-muted/50 dark:border-border dark:text-foreground">
            {ctc || "As per norms"}
          </Badge>
          <Badge variant="outline" className="bg-pale/30 border-pale text-deep-blue dark:bg-muted/50 dark:border-border dark:text-foreground">
            {allowedBranches.join(", ")}
          </Badge>
          <Badge variant="outline" className="bg-pale/30 border-pale text-deep-blue dark:bg-muted/50 dark:border-border dark:text-foreground">
            CGPA ≥ {requiredCgpa}
          </Badge>
          <Badge 
            variant="outline" 
            className={cn(
              "bg-pale/30 border-pale text-deep-blue dark:bg-muted/50 dark:border-border dark:text-foreground",
              backlogAllowed ? "bg-warning/10 border-warning/20 text-warning" : ""
            )}
          >
            {backlogAllowed ? "Backlog OK" : "No backlog"}
          </Badge>
        </div>

        <div className="mt-8 flex items-center justify-between border-t pt-4 border-border/50">
          <div className="space-y-1">
            {eligible ? (
              <div className="flex items-center gap-1.5 text-xs font-medium text-success">
                <CheckCircle2 className="size-3.5" />
                Eligible to apply
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs font-medium text-error">
                <AlertCircle className="size-3.5" />
                {ineligibilityReason}
              </div>
            )}
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger 
              render={
                <Button 
                  disabled={!eligible || isPending}
                  className={cn(
                    "min-w-[100px]",
                    !eligible && "bg-muted text-muted-foreground border-none shadow-none"
                  )}
                />
              }
            >
              {isPending ? <Loader2 className="size-4 animate-spin" /> : (eligible ? "Apply" : "Ineligible")}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Confirm Application</DialogTitle>
                <DialogDescription>
                  Are you sure you want to apply for <strong>{title}</strong> at <strong>{company}</strong>? 
                  A snapshot of your current profile will be shared with the company.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isPending}>
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
