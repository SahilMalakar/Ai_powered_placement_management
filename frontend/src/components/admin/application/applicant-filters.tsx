"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, X, Filter, GitBranch } from "lucide-react";
import { cn } from "@/lib/utils";

const ALL_BRANCHES = [
  "CSE", "ETE", "EE", "ME", "IE", "CE", "CHE", "IPE", "MCA",
] as const;

const STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "APPLIED", label: "Applied" },
  { value: "SHORTLISTED", label: "Shortlisted" },
  { value: "SELECTED", label: "Selected" },
  { value: "REJECTED", label: "Rejected" },
] as const;

const VERIFICATION_OPTIONS = [
  { value: "all", label: "All" },
  { value: "VERIFIED", label: "Verified" },
  { value: "NOT_VERIFIED", label: "Not Verified" },
  { value: "PROCESSING", label: "Processing" },
] as const;

export interface ApplicantFilters {
  search: string;
  status: string;
  branch: string;
  verification: string;
}

interface ApplicantFiltersProps {
  filters: ApplicantFilters;
  onFilterChange: (newFilters: Partial<ApplicantFilters>) => void;
}

export function ApplicantFiltersBar({
  filters,
  onFilterChange,
}: ApplicantFiltersProps) {
  const hasActiveFilters =
    !!filters.search ||
    (filters.status !== "all" && !!filters.status) ||
    (filters.branch !== "all" && !!filters.branch) ||
    (filters.verification !== "all" && !!filters.verification);

  return (
    <div className="space-y-3">
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-mist" />
          <Input
            placeholder="Search by name, email, or roll no..."
            className="pl-10 h-10 bg-card border-border shadow-sm focus-visible:ring-primary"
            value={filters.search}
            onChange={(e) => onFilterChange({ search: e.target.value })}
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {/* Status */}
          <Select
            value={filters.status || "all"}
            onValueChange={(val) => onFilterChange({ status: val ?? undefined })}
          >
            <SelectTrigger
              className={cn(
                "w-[145px] h-10 bg-card border-border shadow-sm",
                filters.status !== "all" &&
                  filters.status &&
                  "border-primary/40 bg-primary/5"
              )}
            >
              <div className="flex items-center gap-2">
                <Filter className="size-4 text-mist" />
                <SelectValue placeholder="Status" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Branch */}
          <Select
            value={filters.branch || "all"}
            onValueChange={(val) => onFilterChange({ branch: val ?? undefined })}
          >
            <SelectTrigger
              className={cn(
                "w-[140px] h-10 bg-card border-border shadow-sm",
                filters.branch !== "all" &&
                  filters.branch &&
                  "border-primary/40 bg-primary/5"
              )}
            >
              <div className="flex items-center gap-2">
                <GitBranch className="size-4 text-mist" />
                <SelectValue placeholder="Branch" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Branches</SelectItem>
              {ALL_BRANCHES.map((branch) => (
                <SelectItem key={branch} value={branch}>
                  {branch}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Verification */}
          <Select
            value={filters.verification || "all"}
            onValueChange={(val) => onFilterChange({ verification: val ?? undefined })}
          >
            <SelectTrigger
              className={cn(
                "w-[155px] h-10 bg-card border-border shadow-sm",
                filters.verification !== "all" &&
                  filters.verification &&
                  "border-primary/40 bg-primary/5"
              )}
            >
              <SelectValue placeholder="Verification" />
            </SelectTrigger>
            <SelectContent>
              {VERIFICATION_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active filters strip */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mr-1">
            <Filter className="size-3" />
            <span>Active filters:</span>
          </div>

          {filters.status !== "all" && filters.status && (
            <Badge
              variant="outline"
              className="gap-1 px-2.5 h-7 rounded-md bg-primary/5 border-primary/20 text-primary font-medium"
            >
              {filters.status}
              <X
                className="size-3 cursor-pointer hover:text-error transition-colors"
                onClick={() => onFilterChange({ status: "all" })}
              />
            </Badge>
          )}

          {filters.branch !== "all" && filters.branch && (
            <Badge
              variant="outline"
              className="gap-1 px-2.5 h-7 rounded-md bg-primary/5 border-primary/20 text-primary font-medium"
            >
              {filters.branch}
              <X
                className="size-3 cursor-pointer hover:text-error transition-colors"
                onClick={() => onFilterChange({ branch: "all" })}
              />
            </Badge>
          )}

          {filters.verification !== "all" && filters.verification && (
            <Badge
              variant="outline"
              className="gap-1 px-2.5 h-7 rounded-md bg-primary/5 border-primary/20 text-primary font-medium"
            >
              {filters.verification}
              <X
                className="size-3 cursor-pointer hover:text-error transition-colors"
                onClick={() => onFilterChange({ verification: "all" })}
              />
            </Badge>
          )}

          <button
            onClick={() =>
              onFilterChange({
                search: "",
                status: "all",
                branch: "all",
                verification: "all",
              })
            }
            className="text-xs text-muted-foreground hover:text-error font-medium ml-1 transition-colors"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
