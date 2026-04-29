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
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

import { JobFilters as IJobFilters } from "@/types/job";

interface JobFiltersProps {
  filters: IJobFilters;
  onFilterChange: (newFilters: Partial<IJobFilters>) => void;
}

export function JobFilters({ filters, onFilterChange }: JobFiltersProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-mist" />
          <Input 
            placeholder="Search by role, company or skill..." 
            className="pl-10 h-10 bg-card border-border shadow-sm focus-visible:ring-primary"
            value={filters.search || ""}
            onChange={(e) => onFilterChange({ search: e.target.value, page: 1 })}
          />
        </div>
        <div className="flex gap-2">
          <Select 
            value={filters.branch || "all"} 
            onValueChange={(val) => onFilterChange({ branch: (val === "all" || !val) ? undefined : val, page: 1 })}
          >
            <SelectTrigger className="w-[140px] h-10 bg-card border-border shadow-sm">
              <SelectValue placeholder="Branch" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Branches</SelectItem>
              <SelectItem value="CSE">CSE</SelectItem>
              <SelectItem value="ETE">ETE</SelectItem>
              <SelectItem value="EE">EE</SelectItem>
              <SelectItem value="ME">ME</SelectItem>
              <SelectItem value="IE">IE</SelectItem>
              <SelectItem value="CE">CE</SelectItem>
              <SelectItem value="CHE">CHE</SelectItem>
              <SelectItem value="IPE">IPE</SelectItem>
              <SelectItem value="MCA">MCA</SelectItem>
            </SelectContent>
          </Select>
          <Select 
            value={filters.cgpa || "0"} 
            onValueChange={(val) => onFilterChange({ cgpa: (val === "0" || !val) ? undefined : val, page: 1 })}
          >
            <SelectTrigger className="w-[140px] h-10 bg-card border-border shadow-sm">
              <SelectValue placeholder="Min CGPA" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Any CGPA</SelectItem>
              <SelectItem value="7">7.0+</SelectItem>
              <SelectItem value="8">8.0+</SelectItem>
              <SelectItem value="9">9.0+</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Badge 
          variant={!filters.branch && !filters.cgpa ? "secondary" : "outline"} 
          className={cn(
            "gap-1 px-2 h-7 rounded-md",
            !filters.branch && !filters.cgpa ? "bg-primary/10 text-primary border-primary/20" : "bg-card border-border text-steel"
          )}
          onClick={() => onFilterChange({ branch: undefined, cgpa: undefined, page: 1 })}
        >
          All
        </Badge>
        {filters.branch && (
          <Badge variant="outline" className="gap-1 px-2 h-7 rounded-md bg-card border-border text-steel">
            {filters.branch} <X className="size-3 cursor-pointer hover:text-error" onClick={() => onFilterChange({ branch: undefined, page: 1 })} />
          </Badge>
        )}
        {filters.cgpa && (
          <Badge variant="outline" className="gap-1 px-2 h-7 rounded-md bg-card border-border text-steel">
            CGPA ≥ {filters.cgpa} <X className="size-3 cursor-pointer hover:text-error" onClick={() => onFilterChange({ cgpa: undefined, page: 1 })} />
          </Badge>
        )}
      </div>
    </div>
  );
}
