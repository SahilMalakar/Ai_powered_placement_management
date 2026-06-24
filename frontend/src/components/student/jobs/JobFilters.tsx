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
import { useState, useEffect } from "react";

import { JobFilters as IJobFilters } from "@/types/student/job";

const ALL_BRANCHES = [
  "CSE", "ETE", "EE", "ME", "IE", "CE", "CHE", "IPE", "MCA",
] as const;

interface JobFiltersProps {
  filters: IJobFilters;
  onFilterChange: (newFilters: Partial<IJobFilters>) => void;
}

export function JobFilters({ filters, onFilterChange }: JobFiltersProps) {
  const [localSearch, setLocalSearch] = useState(filters.search || "");
  const selectedBranches = filters.branches || [];

  // Sync local search with external filter changes (e.g. "Clear All")
  useEffect(() => {
    setLocalSearch(filters.search || "");
  }, [filters.search]);

  // Debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== (filters.search || "")) {
        onFilterChange({ search: localSearch || undefined, page: 1 });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [localSearch, onFilterChange, filters.search]);

  const toggleBranch = (branch: string) => {
    const updated = selectedBranches.includes(branch)
      ? selectedBranches.filter((b) => b !== branch)
      : [...selectedBranches, branch];
    onFilterChange({ branches: updated.length > 0 ? updated : undefined, page: 1 });
  };

  const clearBranches = () => {
    onFilterChange({ branches: undefined, page: 1 });
  };

  const hasActiveFilters = selectedBranches.length > 0 || filters.backlogAllowed !== undefined;

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
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          {/* Multi-select Branch Popover */}
          <Popover>
            <PopoverTrigger
              render={
                <Button
                  variant="outline"
                  className={cn(
                    "h-10 w-full sm:w-48 shrink-0 justify-between gap-2 bg-card border-border shadow-sm font-normal text-sm transition-all hover:bg-accent/50",
                    selectedBranches.length > 0 && "border-primary/40 bg-primary/5 ring-1 ring-primary/10"
                  )}
                />
              }
            >
              <div className="flex items-center gap-2 truncate">
                <GitBranch className="size-4 text-mist shrink-0" />
                {selectedBranches.length === 0 ? (
                  <span className="text-muted-foreground truncate">Branches</span>
                ) : (
                  <span className="text-foreground truncate">
                    {selectedBranches.length} selected
                  </span>
                )}
              </div>
              <ChevronDown className="size-3.5 text-muted-foreground shrink-0" />
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
            value={filters.backlogAllowed === undefined ? "all" : filters.backlogAllowed ? "yes" : "no"}
            onValueChange={(val) =>
              onFilterChange({
                backlogAllowed: val === "all" ? undefined : val === "yes",
                page: 1,
              })
            }
          >
            <SelectTrigger
              className={cn(
                "w-full sm:w-48 shrink-0 h-10 bg-card border-border shadow-sm font-normal text-sm transition-all hover:bg-accent/50 justify-between",
                filters.backlogAllowed !== undefined && "border-primary/40 bg-primary/5 ring-1 ring-primary/10"
              )}
            >
              <div className="flex items-center gap-2 truncate">
                <ShieldCheck className="size-4 text-mist shrink-0" />
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

          {filters.backlogAllowed !== undefined && (
            <Badge
              variant="outline"
              className={cn(
                "gap-1 px-2.5 h-7 rounded-md font-medium",
                filters.backlogAllowed
                  ? "bg-success/10 border-success/20 text-success"
                  : "bg-warning/10 border-warning/20 text-warning"
              )}
            >
              {filters.backlogAllowed ? 'Backlog Allowed' : 'No Backlog'}
              <X
                className="size-3 cursor-pointer hover:text-error transition-colors"
                onClick={() => onFilterChange({ backlogAllowed: undefined, page: 1 })}
              />
            </Badge>
          )}

          <button
            onClick={() => onFilterChange({ branches: undefined, backlogAllowed: undefined, page: 1 })}
            className="text-xs text-muted-foreground hover:text-error font-medium ml-1 transition-colors"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
