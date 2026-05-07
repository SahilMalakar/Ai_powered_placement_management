"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Applicant, ApplicationStatus } from "@/types/admin/jobApplication";
import { VALID_TRANSITIONS } from "@/types/admin/jobApplication";

interface StatusUpdateBarProps {
  selectedApplicants: Applicant[];
  onUpdateStatus: (status: ApplicationStatus) => void;
  isPending: boolean;
  onClearSelection: () => void;
}

/**
 * Computes which target statuses are valid given the selected applicants.
 * A target status is valid only if ALL selected applicants are in one of its
 * allowed "from" states.
 */
function getValidTargets(selected: Applicant[]): ApplicationStatus[] {
  if (selected.length === 0) return [];

  const targets: ApplicationStatus[] = [];
  for (const [target, fromStatuses] of Object.entries(VALID_TRANSITIONS)) {
    const allEligible = selected.every((a) =>
      fromStatuses.includes(a.status)
    );
    if (allEligible) {
      targets.push(target as ApplicationStatus);
    }
  }
  return targets;
}

const ACTION_CONFIG: Record<
  string,
  {
    label: string;
    icon: React.ElementType;
    className: string;
    confirmTitle: string;
    confirmDescription: (count: number) => string;
  }
> = {
  SHORTLISTED: {
    label: "Shortlist Selected",
    icon: ArrowUpRight,
    className:
      "bg-warning/10 text-warning border-warning/30 hover:bg-warning/20",
    confirmTitle: "Shortlist Applicants?",
    confirmDescription: (n) =>
      `Are you sure you want to shortlist ${n} applicant(s)? They will be notified via email.`,
  },
  SELECTED: {
    label: "Select Selected",
    icon: CheckCircle2,
    className:
      "bg-success/10 text-success border-success/30 hover:bg-success/20",
    confirmTitle: "Select Applicants?",
    confirmDescription: (n) =>
      `Are you sure you want to mark ${n} applicant(s) as selected? They will receive a congratulatory email.`,
  },
  REJECTED: {
    label: "Reject Selected",
    icon: XCircle,
    className: "bg-error/10 text-error border-error/30 hover:bg-error/20",
    confirmTitle: "Reject Applicants?",
    confirmDescription: (n) =>
      `Are you sure you want to reject ${n} applicant(s)? They will be notified via email. This action cannot be undone.`,
  },
};

export function StatusUpdateBar({
  selectedApplicants,
  onUpdateStatus,
  isPending,
  onClearSelection,
}: StatusUpdateBarProps) {
  const [confirmAction, setConfirmAction] = useState<ApplicationStatus | null>(
    null
  );

  const validTargets = getValidTargets(selectedApplicants);
  const count = selectedApplicants.length;

  if (count === 0) return null;

  const handleConfirm = () => {
    if (confirmAction) {
      onUpdateStatus(confirmAction);
      setConfirmAction(null);
    }
  };

  return (
    <>
      {/* Floating action bar */}
      <div className="sticky bottom-6 z-40 mx-auto max-w-3xl animate-in slide-in-from-bottom-4 fade-in duration-300">
        <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 shadow-modal dark:shadow-modal">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary font-heading font-bold text-sm">
              {count}
            </div>
            <span className="text-sm font-medium text-foreground">
              {count === 1 ? "applicant" : "applicants"} selected
            </span>
          </div>

          <div className="flex items-center gap-2">
            {validTargets.map((target) => {
              const config = ACTION_CONFIG[target];
              if (!config) return null;
              const Icon = config.icon;
              return (
                <Button
                  key={target}
                  variant="outline"
                  size="sm"
                  className={cn("gap-1.5 font-medium", config.className)}
                  disabled={isPending}
                  onClick={() => setConfirmAction(target)}
                >
                  {isPending ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Icon className="size-3.5" />
                  )}
                  {config.label}
                </Button>
              );
            })}

            {validTargets.length === 0 && (
              <p className="text-xs text-muted-foreground italic">
                No valid transitions for this selection
              </p>
            )}

            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              onClick={onClearSelection}
              disabled={isPending}
            >
              Clear
            </Button>
          </div>
        </div>
      </div>

      {/* Confirmation dialog */}
      <Dialog
        open={!!confirmAction}
        onOpenChange={(open) => !open && setConfirmAction(null)}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-warning/10 mb-4">
              <AlertTriangle className="h-6 w-6 text-warning" />
            </div>
            <DialogTitle className="text-center">
              {confirmAction && ACTION_CONFIG[confirmAction]?.confirmTitle}
            </DialogTitle>
            <DialogDescription className="text-center">
              {confirmAction &&
                ACTION_CONFIG[confirmAction]?.confirmDescription(count)}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center gap-2 mt-4">
            <Button
              variant="ghost"
              onClick={() => setConfirmAction(null)}
              disabled={isPending}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isPending}
              className="flex-1"
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
