"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Applicant, ApplicationStatus, PaginationData } from "@/types/admin/jobApplication";

// ─── Status badge config (design system) ──────────────────────────
const APP_STATUS_STYLES: Record<
  ApplicationStatus,
  { className: string; label: string }
> = {
  APPLIED: {
    className: "bg-pale text-steel border-pale dark:bg-muted dark:text-muted-foreground dark:border-border",
    label: "Applied",
  },
  SHORTLISTED: {
    className: "bg-warning/10 text-warning border-warning/20",
    label: "Shortlisted",
  },
  SELECTED: {
    className: "bg-success/10 text-success border-success/20",
    label: "Selected",
  },
  REJECTED: {
    className: "bg-error/10 text-error border-error/20",
    label: "Rejected",
  },
};

const VERIFICATION_STYLES: Record<string, string> = {
  VERIFIED: "bg-success/10 text-success border-success/20",
  NOT_VERIFIED: "bg-pale text-steel border-pale dark:bg-muted dark:text-muted-foreground dark:border-border",
  PROCESSING: "bg-warning/10 text-warning border-warning/20",
  FAILED: "bg-error/10 text-error border-error/20",
};

interface ApplicantTableProps {
  applicants: Applicant[];
  pagination?: PaginationData;
  isLoading?: boolean;
  selectedIds: Set<number>;
  onToggleSelect: (id: number) => void;
  onToggleAll: () => void;
  onRowClick: (applicant: Applicant) => void;
  onPageChange?: (page: number) => void;
}

export function ApplicantTable({
  applicants,
  pagination,
  isLoading,
  selectedIds,
  onToggleSelect,
  onToggleAll,
  onRowClick,
  onPageChange,
}: ApplicantTableProps) {
  const allSelected =
    applicants.length > 0 && applicants.every((a) => selectedIds.has(a.id));
  const someSelected = applicants.some((a) => selectedIds.has(a.id));

  return (
    <div className="rounded-xl border border-border overflow-hidden bg-card shadow-heavy dark:shadow-heavy">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30 dark:bg-muted/10">
              <th className="w-12 px-4 py-3 text-left">
                <Checkbox
                  checked={allSelected}
                  indeterminate={someSelected && !allSelected}
                  onCheckedChange={onToggleAll}
                />
              </th>
              <th className="px-4 py-3 text-left font-heading font-semibold text-foreground/80 text-xs uppercase tracking-wider">
                Applicant
              </th>
              <th className="px-4 py-3 text-left font-heading font-semibold text-foreground/80 text-xs uppercase tracking-wider">
                Branch
              </th>
              <th className="px-4 py-3 text-left font-heading font-semibold text-foreground/80 text-xs uppercase tracking-wider">
                CGPA
              </th>
              <th className="px-4 py-3 text-left font-heading font-semibold text-foreground/80 text-xs uppercase tracking-wider">
                Verification
              </th>
              <th className="px-4 py-3 text-left font-heading font-semibold text-foreground/80 text-xs uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left font-heading font-semibold text-foreground/80 text-xs uppercase tracking-wider">
                Applied On
              </th>
            </tr>
          </thead>
          <tbody>
            {applicants.map((applicant) => {
              const isSelected = selectedIds.has(applicant.id);
              const profile = applicant.user.profile;
              const statusStyle =
                APP_STATUS_STYLES[applicant.status] ||
                APP_STATUS_STYLES.APPLIED;
              const verificationStyle =
                VERIFICATION_STYLES[
                profile?.verificationStatus || "NOT_VERIFIED"
                ] || VERIFICATION_STYLES.NOT_VERIFIED;

              return (
                <tr
                  key={applicant.id}
                  className={cn(
                    "border-b border-border/50 transition-colors hover:bg-accent/50 cursor-pointer group/row",
                    isSelected && "bg-primary/5 hover:bg-primary/8"
                  )}
                  onClick={() => onRowClick(applicant)}
                >
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => onToggleSelect(applicant.id)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-pale font-heading text-sm font-bold text-deep-blue dark:bg-muted dark:text-foreground">
                        {(profile?.fullName || "?").charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-foreground truncate group-hover/row:text-primary transition-colors">
                          {profile?.fullName || "Unknown"}
                        </p>
                        <p className="text-xs text-mist dark:text-muted-foreground/60 truncate font-mono">
                          {profile?.rollNo || applicant.user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium text-foreground/80">
                      {profile?.branch || "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono font-medium text-foreground/80">
                      {profile?.cgpa != null ? profile.cgpa.toFixed(2) : "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] font-bold uppercase tracking-wider h-5",
                        verificationStyle
                      )}
                    >
                      {(profile?.verificationStatus || "NOT_VERIFIED").replace(
                        "_",
                        " "
                      )}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs font-semibold",
                        statusStyle.className
                      )}
                    >
                      {statusStyle.label}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-mist dark:text-muted-foreground/60 text-xs font-medium">
                    {format(new Date(applicant.createdAt), "d MMM yyyy")}
                  </td>
                </tr>
              );
            })}
            
            {!isLoading && applicants.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-20 text-center text-mist">
                  No applicants found matching the filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {pagination && onPageChange && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-card/50">
          <div className="text-xs text-mist font-medium">
            Showing <span className="text-foreground">{(pagination.page - 1) * pagination.limit + 1}</span> to{" "}
            <span className="text-foreground">
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </span>{" "}
            of <span className="text-foreground">{pagination.total}</span> results
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1 || isLoading}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <div className="text-xs font-bold text-foreground min-w-16 text-center">
              Page {pagination.page} of {pagination.totalPages}
            </div>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages || isLoading}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-background/40 backdrop-blur-[1px] flex items-center justify-center z-10">
          <Loader2 className="size-8 text-primary animate-spin" />
        </div>
      )}
    </div>
  );
}
