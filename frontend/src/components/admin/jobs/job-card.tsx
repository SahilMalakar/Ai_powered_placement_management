"use client";

import {
  MoreVertical,
  Calendar,
  Briefcase,
  Users,
  Power,
  PowerOff,
  Edit3,
  Trash2,
  Loader2,
  GraduationCap,
  GitBranch,
  Clock,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { format, isPast } from "date-fns";
import { cn } from "@/lib/utils";
import type { Job } from "@/types/admin/job";

// ─── Status badge config (matches design system) ──────────────────
const STATUS_STYLES: Record<
  string,
  { className: string; label: string }
> = {
  ACTIVE: {
    className:
      "bg-success/10 text-success border-success/20",
    label: "Active",
  },
  DRAFT: {
    className:
      "bg-pale text-steel border-pale dark:bg-muted dark:text-muted-foreground dark:border-border",
    label: "Draft",
  },
  DEACTIVE: {
    className:
      "bg-muted text-muted-foreground border-border",
    label: "Deactive",
  },
};

interface AdminJobCardProps {
  job: Job;
  onEdit: (job: Job) => void;
  onDelete: (job: Job) => void;
  onToggleStatus: (params: { id: string; currentStatus: string }) => void;
  isToggling: boolean;
}

export function AdminJobCard({
  job,
  onEdit,
  onDelete,
  onToggleStatus,
  isToggling,
}: AdminJobCardProps) {
  const {
    id,
    title,
    company,
    allowedBranches,
    requiredCgpa,
    backlogAllowed,
    deadline,
    status,
    createdAt,
    _count,
  } = job;

  const initials = company.charAt(0).toUpperCase();
  const isExpired = isPast(new Date(deadline));
  const statusStyle = STATUS_STYLES[status] || STATUS_STYLES.DRAFT;
  const applicationCount = _count?.applications ?? 0;

  return (
    <Card
      className={cn(
        "relative transition-all duration-200 hover:translate-y-[-2px] group",
        status === "DEACTIVE" && "opacity-70"
      )}
    >
      <CardContent className="pt-6">
        {/* Header: Avatar + Title + Company + Status */}
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-pale font-heading text-xl font-bold text-deep-blue dark:bg-muted dark:text-foreground">
            {initials}
          </div>
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-heading text-lg font-semibold leading-tight tracking-tight text-foreground group-hover:text-primary transition-colors">
                {title}
              </h3>
              <Badge
                variant="outline"
                className={cn("shrink-0 text-xs font-medium", statusStyle.className)}
              >
                {statusStyle.label}
              </Badge>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-steel dark:text-muted-foreground">
              <Briefcase className="size-3.5 shrink-0" />
              <span className="font-medium">{company}</span>
            </div>
          </div>
        </div>

        {/* Badges: Branches, CGPA, Backlog */}
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge
            variant="outline"
            className="gap-1 bg-pale/30 border-pale text-deep-blue dark:bg-muted/50 dark:border-border dark:text-foreground"
          >
            <GitBranch className="size-3" />
            {allowedBranches.join(", ")}
          </Badge>
          <Badge
            variant="outline"
            className="gap-1 bg-pale/30 border-pale text-deep-blue dark:bg-muted/50 dark:border-border dark:text-foreground"
          >
            <GraduationCap className="size-3" />
            CGPA ≥ {requiredCgpa}
          </Badge>
          <Badge
            variant="outline"
            className={cn(
              "bg-pale/30 border-pale text-deep-blue dark:bg-muted/50 dark:border-border dark:text-foreground",
              backlogAllowed &&
                "bg-success/10 border-success/20 text-success dark:bg-success/10 dark:border-success/20 dark:text-success"
            )}
          >
            {backlogAllowed ? "Backlog OK" : "No Backlog"}
          </Badge>
        </div>

        {/* Stats Row: Applications, Deadline, Posted */}
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-mist dark:text-muted-foreground/60">
          <span className="flex items-center gap-1.5">
            <Users className="size-3.5" />
            <span className="font-medium text-foreground dark:text-foreground/80">
              {applicationCount}
            </span>{" "}
            Applications
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="size-3.5" />
            Deadline:{" "}
            <span
              className={cn(
                "font-medium",
                isExpired
                  ? "text-error"
                  : "text-foreground dark:text-foreground/80"
              )}
            >
              {format(new Date(deadline), "d MMM yyyy")}
            </span>
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="size-3.5" />
            Posted: {format(new Date(createdAt), "d MMM yyyy")}
          </span>
        </div>

        {/* Footer: Actions */}
        <div className="mt-5 flex items-center justify-between border-t pt-4 border-border/50">
          <Button
            render={<Link href={`/admin/jobs/${id}`} />}
            nativeButton={false}
            size="sm"
            className="gap-1.5"
          >
            <Users className="size-3.5" />
            View Applicants
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => onEdit(job)}
            >
              <Edit3 className="size-3.5" />
              Edit
            </Button>

            {/* Status toggle button */}
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "gap-1.5",
                status === "ACTIVE"
                  ? "text-error hover:text-error hover:bg-error/5"
                  : "text-success hover:text-success hover:bg-success/5"
              )}
              onClick={() =>
                onToggleStatus({ id: String(id), currentStatus: status })
              }
              disabled={isToggling}
            >
              {isToggling ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : status === "ACTIVE" ? (
                <>
                  <PowerOff className="size-3.5" />
                  Deactivate
                </>
              ) : (
                <>
                  <Power className="size-3.5" />
                  Activate
                </>
              )}
            </Button>

            {/* More actions dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <button className="inline-flex items-center justify-center h-8 w-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <MoreVertical className="size-4" />
                  </button>
                }
              />
              <DropdownMenuContent align="end" className="w-48 shadow-modal">
                <DropdownMenuLabel>More Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="gap-2 cursor-pointer text-error focus:text-error focus:bg-error/10"
                  onClick={() => onDelete(job)}
                >
                  <Trash2 className="size-4" /> Delete Posting
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
