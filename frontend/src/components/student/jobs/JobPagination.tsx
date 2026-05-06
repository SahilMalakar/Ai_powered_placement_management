'use client';

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface JobPaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function JobPagination({ page, totalPages, onPageChange }: JobPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 py-8">
      <Button 
        variant="outline" 
        size="icon-sm"
        className="rounded-lg"
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeft className="size-4" />
      </Button>
      
      <div className="flex items-center gap-1">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <Button
            key={p}
            variant={p === page ? "default" : "outline"}
            size="icon-sm"
            className={cn(
              "size-8 rounded-lg",
              p === page ? "shadow-button" : "bg-card border-border"
            )}
            onClick={() => onPageChange(p)}
          >
            {p}
          </Button>
        ))}
        <span className="px-2 text-sm text-mist">of {totalPages}</span>
      </div>

      <Button 
        variant="outline" 
        size="icon-sm"
        className="rounded-lg bg-card border-border shadow-sm"
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        <ChevronRight className="size-4" />
      </Button>
    </div>
  );
}
