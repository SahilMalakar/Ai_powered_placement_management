'use client';

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, X, GitBranch, ShieldCheck, Filter, UserCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { GetAllStudentsQueryInput, VerificationStatusEnum } from "@/types/admin/student";
import { BranchEnum } from "@/types/admin/job";

interface StudentFiltersProps {
  filters: GetAllStudentsQueryInput;
  onFilterChange: (newFilters: Partial<GetAllStudentsQueryInput>) => void;
}

export function StudentFilters({ filters, onFilterChange }: StudentFiltersProps) {
  const hasActiveFilters = !!(filters.search || filters.branch || filters.verificationStatus || filters.backlogAllowed !== undefined);

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-mist" />
          <Input
            placeholder="Search by name or roll number..."
            className="pl-10 h-10 bg-card border-border shadow-sm focus-visible:ring-primary"
            value={filters.search || ""}
            onChange={(e) => onFilterChange({ search: e.target.value, page: 1 })}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Select
            value={filters.branch || "all"}
            onValueChange={(val) =>
              onFilterChange({
                branch: val === "all" ? undefined : (val as any),
                page: 1,
              })
            }
          >
            <SelectTrigger
              className={cn(
                "w-[140px] h-10 bg-card border-border shadow-sm",
                filters.branch && "border-primary/40 bg-primary/5"
              )}
            >
              <div className="flex items-center gap-2">
                <GitBranch className="size-4 text-mist" />
                <SelectValue placeholder="Branch" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Branches</SelectItem>
              {BranchEnum.map((branch) => (
                <SelectItem key={branch} value={branch}>
                  {branch}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.verificationStatus || "all"}
            onValueChange={(val) =>
              onFilterChange({
                verificationStatus: val === "all" ? undefined : (val as any),
                page: 1,
              })
            }
          >
            <SelectTrigger
              className={cn(
                "w-[160px] h-10 bg-card border-border shadow-sm",
                filters.verificationStatus && "border-primary/40 bg-primary/5"
              )}
            >
              <div className="flex items-center gap-2">
                <UserCheck className="size-4 text-mist" />
                <SelectValue placeholder="Status" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {VerificationStatusEnum.map((status) => (
                <SelectItem key={status} value={status}>
                  {status.replace("_", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.backlogAllowed === undefined ? "all" : String(filters.backlogAllowed)}
            onValueChange={(val) =>
              onFilterChange({
                backlogAllowed: val === "all" ? undefined : val === "true",
                page: 1,
              })
            }
          >
            <SelectTrigger
              className={cn(
                "w-[140px] h-10 bg-card border-border shadow-sm",
                filters.backlogAllowed !== undefined && "border-primary/40 bg-primary/5"
              )}
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-mist" />
                <SelectValue placeholder="Backlog" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any Backlog</SelectItem>
              <SelectItem value="true">Allowed</SelectItem>
              <SelectItem value="false">No Backlog</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mr-1">
            <Filter className="size-3" />
            <span>Active filters:</span>
          </div>

          {filters.search && (
            <Badge variant="outline" className="gap-1 px-2.5 h-7 rounded-md bg-primary/5 border-primary/20 text-primary">
              Search: {filters.search}
              <X className="size-3 cursor-pointer" onClick={() => onFilterChange({ search: undefined })} />
            </Badge>
          )}

          {filters.branch && (
            <Badge variant="outline" className="gap-1 px-2.5 h-7 rounded-md bg-primary/5 border-primary/20 text-primary">
              {filters.branch}
              <X className="size-3 cursor-pointer" onClick={() => onFilterChange({ branch: undefined })} />
            </Badge>
          )}

          {filters.verificationStatus && (
            <Badge variant="outline" className="gap-1 px-2.5 h-7 rounded-md bg-primary/5 border-primary/20 text-primary">
              {filters.verificationStatus.replace("_", " ")}
              <X className="size-3 cursor-pointer" onClick={() => onFilterChange({ verificationStatus: undefined })} />
            </Badge>
          )}

          {filters.backlogAllowed !== undefined && (
            <Badge variant="outline" className="gap-1 px-2.5 h-7 rounded-md bg-primary/5 border-primary/20 text-primary">
              {filters.backlogAllowed ? "Backlog Allowed" : "No Backlog"}
              <X className="size-3 cursor-pointer" onClick={() => onFilterChange({ backlogAllowed: undefined })} />
            </Badge>
          )}

          <button
            onClick={() => onFilterChange({ search: undefined, branch: undefined, verificationStatus: undefined, backlogAllowed: undefined, page: 1 })}
            className="text-xs text-muted-foreground hover:text-error font-medium ml-1 transition-colors"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
