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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Search,
  X,
  GitBranch,
  Filter,
  ArrowUpDown,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ─────────────────────────────────────────────────────────
export interface AdminJobFilters {
  search?: string;
  status?: string;
  branches?: string[];
  sort?: "latest" | "deadline";
  page: number;
  limit: number;
}

const ALL_BRANCHES = [
  "CSE", "ETE", "EE", "ME", "IE", "CE", "CHE", "IPE", "MCA",
] as const;

const STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "ACTIVE", label: "Active" },
  { value: "DRAFT", label: "Draft" },
  { value: "DEACTIVE", label: "Deactive" },
] as const;

interface AdminJobFiltersProps {
  filters: AdminJobFilters;
  onFilterChange: (newFilters: Partial<AdminJobFilters>) => void;
}

export function AdminJobFiltersBar({
  filters,
  onFilterChange,
}: AdminJobFiltersProps) {
  const selectedBranches = filters.branches || [];

  const toggleBranch = (branch: string) => {
    const updated = selectedBranches.includes(branch)
      ? selectedBranches.filter((b) => b !== branch)
      : [...selectedBranches, branch];
    onFilterChange({
      branches: updated.length > 0 ? updated : undefined,
      page: 1,
    });
  };

  const hasActiveFilters =
    selectedBranches.length > 0 ||
    (!!filters.status && filters.status !== "all") ||
    (!!filters.sort && filters.sort !== "latest");

  return (
    <div className="space-y-4">
      {/* Main filter row */}
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-mist" />
          <Input
            placeholder="Search by job title, company or keyword..."
            className="pl-10 h-10 bg-card border-border shadow-sm focus-visible:ring-primary"
            value={filters.search || ""}
            onChange={(e) =>
              onFilterChange({ search: e.target.value, page: 1 })
            }
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {/* Status filter */}
          <Select
            value={filters.status || "all"}
            onValueChange={(val) =>
              onFilterChange({
                status: (val === "all" ? undefined : val) ?? undefined,
                page: 1,
              })
            }
          >
            <SelectTrigger
              className={cn(
                "w-[155px] h-10 bg-card border-border shadow-sm",
                filters.status &&
                filters.status !== "all" &&
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

          {/* Multi-select Branch filter */}
          <Popover>
            <PopoverTrigger
              render={
                <Button
                  variant="outline"
                  className={cn(
                    "h-10 min-w-[150px] justify-between gap-2 bg-card border-border shadow-sm font-normal text-sm",
                    selectedBranches.length > 0 &&
                    "border-primary/40 bg-primary/5"
                  )}
                />
              }
            >
              <div className="flex items-center gap-2">
                <GitBranch className="size-4 text-mist" />
                {selectedBranches.length === 0 ? (
                  <span className="text-muted-foreground">Branches</span>
                ) : (
                  <span className="text-foreground">
                    {selectedBranches.length} selected
                  </span>
                )}
              </div>
              <ChevronDown className="size-3.5 text-muted-foreground ml-auto" />
            </PopoverTrigger>
            <PopoverContent align="start" sideOffset={6} className="w-56 p-0">
              <div className="flex items-center justify-between px-3 py-2.5 border-b border-border/50">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Select Branches
                </span>
                {selectedBranches.length > 0 && (
                  <button
                    onClick={() =>
                      onFilterChange({ branches: undefined, page: 1 })
                    }
                    className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="p-1.5 max-h-[240px] overflow-y-auto">
                {ALL_BRANCHES.map((branch) => {
                  const isChecked = selectedBranches.includes(branch);
                  return (
                    <label
                      key={branch}
                      className={cn(
                        "flex items-center gap-2.5 px-2.5 py-2 rounded-md cursor-pointer transition-colors text-sm",
                        isChecked
                          ? "bg-primary/5 text-foreground"
                          : "hover:bg-accent text-foreground/80"
                      )}
                    >
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={() => toggleBranch(branch)}
                      />
                      <span className="font-medium">{branch}</span>
                    </label>
                  );
                })}
              </div>
            </PopoverContent>
          </Popover>

          {/* Sort */}
          <Select
            value={filters.sort || "latest"}
            onValueChange={(val) =>
              onFilterChange({
                sort: val as "latest" | "deadline",
                page: 1,
              })
            }
          >
            <SelectTrigger className="w-[145px] h-10 bg-card border-border shadow-sm">
              <div className="flex items-center gap-2">
                <ArrowUpDown className="size-4 text-mist" />
                <SelectValue placeholder="Sort by" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">Latest</SelectItem>
              <SelectItem value="deadline">Deadline</SelectItem>
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

          {filters.status && filters.status !== "all" && (
            <Badge
              variant="outline"
              className="gap-1 px-2.5 h-7 rounded-md bg-primary/5 border-primary/20 text-primary font-medium"
            >
              Status: {filters.status}
              <X
                className="size-3 cursor-pointer hover:text-error transition-colors"
                onClick={() => onFilterChange({ status: undefined, page: 1 })}
              />
            </Badge>
          )}

          {selectedBranches.map((branch) => (
            <Badge
              key={branch}
              variant="outline"
              className="gap-1 px-2.5 h-7 rounded-md bg-primary/5 border-primary/20 text-primary font-medium"
            >
              {branch}
              <X
                className="size-3 cursor-pointer hover:text-error transition-colors"
                onClick={() => toggleBranch(branch)}
              />
            </Badge>
          ))}

          <button
            onClick={() =>
              onFilterChange({
                status: undefined,
                branches: undefined,
                sort: "latest",
                page: 1,
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
