"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  User,
  Mail,
  GraduationCap,
  GitBranch,
  CheckCircle2,
  Clock,
  ExternalLink,
  History,
  AlertCircle,
  FileText,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { Applicant, ApplicationStatus } from "@/types/admin/jobApplication";

const STATUS_CONFIG: Record<ApplicationStatus, { label: string; className: string; icon: any }> = {
  APPLIED: {
    label: "Applied",
    className: "bg-pale text-steel border-pale dark:bg-muted dark:text-muted-foreground",
    icon: Clock,
  },
  SHORTLISTED: {
    label: "Shortlisted",
    className: "bg-warning/10 text-warning border-warning/20",
    icon: AlertCircle,
  },
  SELECTED: {
    label: "Selected",
    className: "bg-success/10 text-success border-success/20",
    icon: CheckCircle2,
  },
  REJECTED: {
    label: "Rejected",
    className: "bg-error/10 text-error border-error/20",
    icon: FileText,
  },
};

const VERIFICATION_CONFIG: Record<string, { label: string; className: string }> = {
  VERIFIED: {
    label: "Verified",
    className: "bg-success/10 text-success border-success/20",
  },
  NOT_VERIFIED: {
    label: "Not Verified",
    className: "bg-pale text-steel border-pale dark:bg-muted dark:text-muted-foreground",
  },
  PROCESSING: {
    label: "Processing",
    className: "bg-warning/10 text-warning border-warning/20",
  },
  FAILED: {
    label: "Failed",
    className: "bg-error/10 text-error border-error/20",
  },
};

interface ApplicantDetailsSheetProps {
  applicant: Applicant | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ApplicantDetailsSheet({ applicant, open, onOpenChange }: ApplicantDetailsSheetProps) {
  const profile = applicant?.user?.profile;
  const statusConfig = applicant ? STATUS_CONFIG[applicant.status] : null;
  const verificationConfig = applicant ? VERIFICATION_CONFIG[profile?.verificationStatus || "NOT_VERIFIED"] : null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md border-l border-border bg-card p-0 shadow-modal">
        {applicant && statusConfig && verificationConfig && (
          <ScrollArea className="h-full">
            <div className="p-6 space-y-8">
              {/* Header Identity */}
              <SheetHeader className="p-0 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-pale font-heading text-2xl font-bold text-deep-blue dark:bg-muted dark:text-foreground shadow-sm">
                    {(profile?.fullName || "?").charAt(0).toUpperCase()}
                  </div>
                  <div className="space-y-1">
                    <SheetTitle className="text-xl font-bold tracking-tight">
                      {profile?.fullName || "Student Name"}
                    </SheetTitle>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={cn("text-[10px] uppercase tracking-wider font-bold h-5 px-1.5", verificationConfig.className)}
                      >
                        {verificationConfig.label}
                      </Badge>
                    </div>
                  </div>
                </div>
              </SheetHeader>

              <Separator className="bg-border/50" />

              {/* Core Info Grid */}
              <div className="grid grid-cols-2 gap-y-6">
                <InfoItem label="Roll Number" value={profile?.rollNo || "—"} icon={User} />
                <InfoItem label="Branch" value={profile?.branch || "—"} icon={GitBranch} />
                <InfoItem label="CGPA" value={profile?.cgpa?.toFixed(2) || "—"} icon={GraduationCap} mono />
                <InfoItem label="Applied On" value={format(new Date(applicant.createdAt), "dd MMM yyyy")} icon={Clock} />
                <div className="col-span-2">
                  <InfoItem label="Email Address" value={applicant.user.email} icon={Mail} />
                </div>
              </div>

              <Separator className="bg-border/50" />

              {/* Application Status & Timeline */}
              <div className="space-y-4">
                <h3 className="text-sm font-heading font-semibold text-foreground/80 flex items-center gap-2">
                  <History className="size-4" />
                  Application Status
                </h3>

                <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground font-medium">Current Status</span>
                    <Badge className={cn("font-semibold", statusConfig.className)} variant="outline">
                      {statusConfig.label}
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <TimelineItem
                      status="Applied"
                      date={format(new Date(applicant.createdAt), "dd MMM yyyy, hh:mm a")}
                      isCompleted
                      isFirst
                    />
                    <TimelineItem
                      status="Shortlisted"
                      date={applicant.status === "SHORTLISTED" || applicant.status === "SELECTED" ? format(new Date(applicant.updatedAt), "dd MMM yyyy, hh:mm a") : "Pending"}
                      isCompleted={applicant.status === "SHORTLISTED" || applicant.status === "SELECTED"}
                    />
                    <TimelineItem
                      status="Selected"
                      date={applicant.status === "SELECTED" ? format(new Date(applicant.updatedAt), "dd MMM yyyy, hh:mm a") : "Pending"}
                      isCompleted={applicant.status === "SELECTED"}
                      isLast
                    />
                  </div>
                </div>
              </div>

              <Separator className="bg-border/50" />

              {/* Admin Notes Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-heading font-semibold text-foreground/80 flex items-center gap-2">
                  <FileText className="size-4" />
                  Admin Notes
                </h3>
                <div className="space-y-3">
                  <Textarea
                    placeholder="Add internal notes about this applicant..."
                    className="min-h-[100px] bg-muted/30 border-border resize-none focus-visible:ring-primary"
                  />
                  <Button size="sm" className="w-full shadow-button btn-primary">
                    Save Notes
                  </Button>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4">
                <Button variant="outline" className="w-full gap-2 border-border hover:bg-accent">
                  <ExternalLink className="size-4" />
                  View Full Profile
                </Button>
              </div>
            </div>
          </ScrollArea>
        )}
      </SheetContent>
    </Sheet>
  );
}


function InfoItem({ label, value, icon: Icon, mono = false }: { label: string; value: string; icon: any; mono?: boolean }) {
  return (
    <div className="space-y-1.5">
      <p className="text-[10px] font-heading font-bold uppercase tracking-wider text-mist dark:text-muted-foreground/60 flex items-center gap-1.5">
        <Icon className="size-3" />
        {label}
      </p>
      <p className={cn("text-sm font-medium text-foreground", mono && "font-mono")}>
        {value}
      </p>
    </div>
  );
}

function TimelineItem({ status, date, isCompleted, isFirst = false, isLast = false }: { status: string; date: string; isCompleted: boolean; isFirst?: boolean; isLast?: boolean }) {
  return (
    <div className="flex gap-3 min-h-[40px]">
      <div className="flex flex-col items-center">
        <div className={cn(
          "size-2.5 rounded-full z-10",
          isCompleted ? "bg-primary shadow-[0_0_8px_rgba(129,140,248,0.5)]" : "bg-border"
        )} />
        {!isLast && <div className={cn("w-px flex-1 my-1", isCompleted ? "bg-primary/30" : "bg-border")} />}
      </div>
      <div className="space-y-0.5 pb-2">
        <p className={cn("text-xs font-semibold", isCompleted ? "text-foreground" : "text-muted-foreground")}>
          {status}
        </p>
        <p className="text-[10px] text-mist dark:text-muted-foreground/60 font-medium">
          {date}
        </p>
      </div>
    </div>
  );
}
