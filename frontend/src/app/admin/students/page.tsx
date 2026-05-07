'use client';

import { useState } from "react";
import { useAdminStudents } from "@/hooks/admin/useStudents";
import { GetAllStudentsQueryInput } from "@/types/admin/student";
import { StudentFilters } from "@/components/admin/students/StudentFilters";
import { StudentTable } from "@/components/admin/students/StudentTable";
import { StudentPagination } from "@/components/admin/students/StudentPagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminStudentsPage() {
  const [filters, setFilters] = useState<GetAllStudentsQueryInput>({
    page: 1,
    limit: 10,
  });

  const { data, isLoading, isError, error } = useAdminStudents(filters);

  const handleFilterChange = (newFilters: Partial<GetAllStudentsQueryInput>) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: newFilters.page ?? 1 }));
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground flex items-center gap-3">
            <Users className="size-8 text-primary" /> Student Directory
          </h1>
          <p className="text-muted-foreground mt-1">Manage, verify, and monitor student academic profiles.</p>
        </div>
        <Button variant="outline" className="h-10 bg-card shadow-subtle font-bold text-xs gap-2">
          <FileDown className="size-4" /> Export Data
        </Button>
      </div>

      <StudentFilters filters={filters} onFilterChange={handleFilterChange} />

      {isLoading ? (
        <div className="bg-card rounded-xl shadow-heavy border border-border/50 p-6 space-y-4">
          <div className="flex gap-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : isError ? (
        <div className="py-12 text-center space-y-4 bg-error/5 rounded-xl border border-error/20">
          <p className="text-error font-bold">Failed to load student records</p>
          <p className="text-sm text-muted-foreground">{(error as any)?.response?.data?.message || "Internal Server Error"}</p>
        </div>
      ) : data?.data.students.length === 0 ? (
        <div className="py-20 text-center space-y-4 bg-card rounded-xl border border-dashed border-border/60 shadow-heavy">
          <div className="size-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="size-8 text-muted-foreground opacity-20" />
          </div>
          <p className="text-steel dark:text-muted-foreground font-bold text-xl">No students found</p>
          <p className="text-sm text-mist max-w-xs mx-auto">Try adjusting your search criteria or clearing filters to find more students.</p>
          <Button 
            variant="ghost" 
            className="text-primary hover:bg-primary/5 font-bold"
            onClick={() => handleFilterChange({ search: undefined, branch: undefined, verificationStatus: undefined, backlogAllowed: undefined })}
          >
            Clear all filters
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <StudentTable students={data?.data.students || []} />
          
          <StudentPagination 
            page={filters.page || 1} 
            totalPages={data?.data.pagination.totalPages || 0} 
            onPageChange={(page) => handleFilterChange({ page })} 
          />
        </div>
      )}
    </div>
  );
}
