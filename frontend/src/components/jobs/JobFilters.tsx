'use client';

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, X, ChevronDown, GitBranch, ShieldCheck, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

import { JobFilters as IJobFilters } from "@/types/job";

const ALL_BRANCHES = [
  "CSE", "ETE", "EE", "ME", "IE", "CE", "CHE", "IPE", "MCA",
] as const;

interface JobFiltersProps {
  filters: IJobFilters;
  onFilterChange: (newFilters: Partial<IJobFilters>) => void;
}

export function JobFilters({ filters, onFilterChange }: JobFiltersProps) {
  const selectedBranches = filters.branches || [];

  const toggleBranch = (branch: string) => {
    const updated = selectedBranches.includes(branch)
      ? selectedBranches.filter((b) => b !== branch)
      : [...selectedBranches, branch];
    onFilterChange({ branches: updated.length > 0 ? updated : undefined, page: 1 });
  };

  const clearBranches = () => {
    onFilterChange({ branches: undefined, page: 1 });
  };

  const hasActiveFilters = selectedBranches.length > 0 || (filters.backlog && filters.backlog !== 'all');

  return (
    <div className="space-y-4">
      {/* Search + Filter Controls Row */}
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-mist" />
          <Input
            placeholder="Search by role or company..."
            className="pl-10 h-10 bg-card border-border shadow-sm focus-visible:ring-primary"
            value={filters.search || ""}
            onChange={(e) => onFilterChange({ search: e.target.value, page: 1 })}
          />
        </div>

        <div className="flex gap-2">
          {/* Multi-select Branch Popover */}
          <Popover>
            <PopoverTrigger
              render={
                <Button
                  variant="outline"
                  className={cn(
                    "h-10 min-w-[160px] justify-between gap-2 bg-card border-border shadow-sm font-normal text-sm",
                    selectedBranches.length > 0 && "border-primary/40 bg-primary/5"
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
              <ChevronDown className="size-3.5 text-muted-foreground" />
            </PopoverTrigger>
            <PopoverContent align="start" sideOffset={6} className="w-56 p-0">
              {/* Header */}
              <div className="flex items-center justify-between px-3 py-2.5 border-b border-border/50">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Select Branches
                </span>
                {selectedBranches.length > 0 && (
                  <button
                    onClick={clearBranches}
                    className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
                  >
                    Clear all
                  </button>
                )}
              </div>
              {/* Branch list */}
              <div className="p-1.5 max-h-[240px] overflow-y-auto">
                {ALL_BRANCHES.map((branch) => {
                  const isChecked = selectedBranches.includes(branch);
                  return (
                    <label
                      key={branch}
                      className={cn(
                        "flex items-center gap-2.5 px-2.5 py-2 rounded-md cursor-pointer transition-colors text-sm",
                        isChecked
                          ? "bg-primary/8 text-foreground"
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
              {/* Footer count */}
              {selectedBranches.length > 0 && (
                <div className="px-3 py-2 border-t border-border/50 bg-muted/30">
                  <p className="text-xs text-muted-foreground">
                    {selectedBranches.length} of {ALL_BRANCHES.length} branches selected
                  </p>
                </div>
              )}
            </PopoverContent>
          </Popover>

          {/* Backlog Filter */}
          <Select
            value={filters.backlog || "all"}
            onValueChange={(val) =>
              onFilterChange({
                backlog: val === "all" ? undefined : (val as 'yes' | 'no'),
                page: 1,
              })
            }
          >
            <SelectTrigger
              className={cn(
                "w-[160px] h-10 bg-card border-border shadow-sm",
                filters.backlog && filters.backlog !== 'all' && "border-primary/40 bg-primary/5"
              )}
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-mist" />
                <SelectValue placeholder="Backlog" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Jobs</SelectItem>
              <SelectItem value="yes">Backlog Allowed</SelectItem>
              <SelectItem value="no">No Backlog</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mr-1">
            <Filter className="size-3" />
            <span>Active filters:</span>
          </div>

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

          {filters.backlog && filters.backlog !== 'all' && (
            <Badge
              variant="outline"
              className={cn(
                "gap-1 px-2.5 h-7 rounded-md font-medium",
                filters.backlog === 'yes'
                  ? "bg-success/10 border-success/20 text-success"
                  : "bg-warning/10 border-warning/20 text-warning"
              )}
            >
              {filters.backlog === 'yes' ? 'Backlog OK' : 'No Backlog'}
              <X
                className="size-3 cursor-pointer hover:text-error transition-colors"
                onClick={() => onFilterChange({ backlog: undefined, page: 1 })}
              />
            </Badge>
          )}

          <button
            onClick={() => onFilterChange({ branches: undefined, backlog: undefined, page: 1 })}
            className="text-xs text-muted-foreground hover:text-error font-medium ml-1 transition-colors"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
