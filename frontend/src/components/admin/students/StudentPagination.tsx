'use client';

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface StudentPaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function StudentPagination({ page, totalPages, onPageChange }: StudentPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 py-8">
      <Button 
        variant="outline" 
        size="icon"
        className="h-9 w-9 rounded-lg bg-card border-border shadow-sm disabled:opacity-50"
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeft className="size-4 text-muted-foreground" />
      </Button>
      
      <div className="flex items-center gap-1.5">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
          // Logic for showing limited page numbers if totalPages is large
          if (
            totalPages > 7 && 
            p !== 1 && 
            p !== totalPages && 
            (p < page - 1 || p > page + 1)
          ) {
            if (p === 2 || p === totalPages - 1) {
                return <span key={p} className="text-mist px-1">...</span>;
            }
            return null;
          }

          return (
            <Button
              key={p}
              variant={p === page ? "default" : "outline"}
              className={cn(
                "h-9 min-w-[36px] rounded-lg text-sm font-medium transition-all",
                p === page 
                  ? "bg-primary text-white shadow-button hover:bg-primary/90" 
                  : "bg-card border-border text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
              onClick={() => onPageChange(p)}
            >
              {p}
            </Button>
          );
        })}
      </div>

      <Button 
        variant="outline" 
        size="icon"
        className="h-9 w-9 rounded-lg bg-card border-border shadow-sm disabled:opacity-50"
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        <ChevronRight className="size-4 text-muted-foreground" />
      </Button>
    </div>
  );
}
