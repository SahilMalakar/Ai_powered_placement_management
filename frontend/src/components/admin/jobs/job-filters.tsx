"use client";

import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface JobFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: string | undefined;
  onStatusChange: (status: string | undefined) => void;
}

export function JobFilters({ 
  searchQuery, 
  onSearchChange, 
  statusFilter, 
  onStatusChange 
}: JobFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input 
          placeholder="Search by job title or company..." 
          className="pl-10 h-11 border-none shadow-subtle bg-card" 
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      
      <DropdownMenu>
        <DropdownMenuTrigger render={
          <Button variant="secondary" className="h-11 shadow-subtle">
            <Filter className="size-4 mr-2" /> 
            {statusFilter ? `Status: ${statusFilter}` : "Filters"}
          </Button>
        } />
        <DropdownMenuContent align="end" className="w-48 shadow-modal">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem 
              checked={statusFilter === undefined}
              onCheckedChange={() => onStatusChange(undefined)}
            >
              All Statuses
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem 
              checked={statusFilter === "ACTIVE"}
              onCheckedChange={() => onStatusChange("ACTIVE")}
            >
              Active
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem 
              checked={statusFilter === "DEACTIVE"}
              onCheckedChange={() => onStatusChange("DEACTIVE")}
            >
              Deactive
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem 
              checked={statusFilter === "DRAFT"}
              onCheckedChange={() => onStatusChange("DRAFT")}
            >
              Draft
            </DropdownMenuCheckboxItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
