'use client';

import { useState, useMemo, useEffect, useCallback } from "react";
import { useAdminStudents } from "@/hooks/admin/useStudents";
import { GetAllStudentsQueryInput } from "@/types/admin/student";
import { StudentFilters } from "@/components/admin/students/StudentFilters";
import { StudentTable } from "@/components/admin/students/StudentTable";
import { StudentPagination } from "@/components/admin/students/StudentPagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Users, FileDown, ShieldCheck, Clock, UserX, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdminExport } from "@/hooks/admin/useExport";
import { cn } from "@/lib/utils";

export default function AdminStudentsPage() {
  // ─── Local search text (updates instantly on keystroke) ──────
  const [searchInput, setSearchInput] = useState("");
  // ─── Debounced search value (propagated to API after delay) ──
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [filters, setFilters] = useState<Omit<GetAllStudentsQueryInput, "search">>({
    page: 1,
    limit: 10,
  });

  // Debounce: only push searchInput → debouncedSearch after 400ms idle
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Reset to page 1 whenever debounced search changes
  useEffect(() => {
    setFilters((prev) => ({ ...prev, page: 1 }));
  }, [debouncedSearch]);

  // Build the actual query params sent to the API
  const queryFilters: GetAllStudentsQueryInput = useMemo(() => ({
    ...filters,
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
  }), [filters, debouncedSearch]);

  const { data, isLoading, isFetching, isError, error } = useAdminStudents(queryFilters);
  const { exportData, isExporting } = useAdminExport();

  const handleFilterChange = useCallback((newFilters: Partial<GetAllStudentsQueryInput>) => {
    // If search changed, route it to the local input state (debounce handles the rest)
    if ("search" in newFilters) {
      setSearchInput(newFilters.search ?? "");
      // Don't merge search into filters — it lives in its own debounced channel
      const { search, ...rest } = newFilters;
      if (Object.keys(rest).length > 0) {
        setFilters((prev) => ({ ...prev, ...rest, page: rest.page ?? 1 }));
      }
      return;
    }
    setFilters((prev) => ({ ...prev, ...newFilters, page: newFilters.page ?? 1 }));
  }, []);

  const handleExport = () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { page, limit, ...exportFilters } = filters;
    exportData({
      type: "students",
      ...exportFilters,
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
    });
  };

  // Derive stats from current page data
  const stats = useMemo(() => {
    const students = data?.data?.students || [];
    const total = data?.data?.pagination?.totalCount || 0;
    const verified = students.filter((s) => s.profile.verificationStatus === "VERIFIED").length;
    const pending = students.filter((s) => s.profile.verificationStatus === "PROCESSING" || s.profile.verificationStatus === "NOT_VERIFIED").length;
    const banned = students.filter((s) => s.deletedAt !== null).length;
    return { total, verified, pending, banned };
  }, [data]);

  // We reconstruct filters for the StudentFilters component so it sees search as part of the object
  const filtersForUI: GetAllStudentsQueryInput = useMemo(() => ({
    ...filters,
    search: searchInput,
  }), [filters, searchInput]);

  // Whether the table is background-refetching (used for smooth opacity fade)
  const isRefetching = isFetching && !isLoading;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* ─── Header ───────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-heading font-bold text-foreground tracking-tight">
            Student Directory
          </h1>
          <p className="text-sm text-mist dark:text-muted-foreground/60">
            Manage, verify, and monitor student academic profiles across all branches.
          </p>
        </div>
        <Button 
          className="h-10 px-5 bg-gradient-to-r from-brand-blue to-brand-indigo hover:opacity-90 transition-all text-white font-semibold text-xs gap-2 rounded-md shadow-button border-none shrink-0 group"
          onClick={handleExport}
          disabled={isExporting}
        >
          <FileDown className={cn("size-4 transition-transform duration-300", isExporting ? "animate-bounce" : "group-hover:translate-y-0.5")} /> 
          {isExporting ? "Exporting..." : "Export Data"}
        </Button>
      </div>

      {/* ─── Stats Cards ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Students"
          value={stats.total}
          icon={Users}
          color="text-primary"
          bg="bg-primary/5"
          isLoading={isLoading}
        />
        <StatCard
          label="Verified"
          value={stats.verified}
          icon={ShieldCheck}
          color="text-success"
          bg="bg-success/5"
          isLoading={isLoading}
          suffix="on this page"
        />
        <StatCard
          label="Pending Review"
          value={stats.pending}
          icon={Clock}
          color="text-warning"
          bg="bg-warning/5"
          isLoading={isLoading}
          suffix="on this page"
        />
        <StatCard
          label="Deactivated"
          value={stats.banned}
          icon={UserX}
          color="text-error"
          bg="bg-error/5"
          isLoading={isLoading}
          suffix="on this page"
        />
      </div>

      {/* ─── Filters ──────────────────────────────────────────────── */}
      <StudentFilters filters={filtersForUI} onFilterChange={handleFilterChange} />

      {/* ─── Content ──────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="bg-card rounded-2xl shadow-heavy border border-border/50 p-6 space-y-4">
          <div className="flex gap-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <div className="py-12 text-center space-y-4 bg-error/5 rounded-2xl border border-error/20">
          <p className="text-error font-bold">Failed to load student records</p>
          <p className="text-sm text-muted-foreground">{(error as any)?.response?.data?.message || "Internal Server Error"}</p>
        </div>
      ) : data?.data.students.length === 0 ? (
        <div className="py-20 text-center space-y-4 bg-card rounded-2xl border border-dashed border-border/60 shadow-heavy">
          <div className="size-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="size-8 text-muted-foreground opacity-20" />
          </div>
          <p className="text-steel dark:text-muted-foreground font-bold text-xl">No students found</p>
          <p className="text-sm text-mist max-w-xs mx-auto">Try adjusting your search criteria or clearing filters to find more students.</p>
          <Button 
            variant="ghost" 
            className="text-primary hover:bg-primary/5 font-bold"
            onClick={() => {
              setSearchInput("");
              setDebouncedSearch("");
              setFilters((prev) => ({ ...prev, branch: undefined, verificationStatus: undefined, backlogAllowed: undefined, page: 1 }));
            }}
          >
            Clear all filters
          </Button>
        </div>
      ) : (
        <div className="space-y-6 relative">
          {/* Refetch overlay — smooth fade instead of full skeleton jitter */}
          {isRefetching && (
            <div className="absolute inset-0 z-10 flex items-start justify-center pt-32 pointer-events-none">
              <div className="flex items-center gap-2 bg-card/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-heavy border border-border/50 animate-in fade-in duration-200">
                <Loader2 className="size-3.5 animate-spin text-primary" />
                <span className="text-xs font-medium text-muted-foreground">Updating...</span>
              </div>
            </div>
          )}

          {/* Result count */}
          <div className="flex items-center justify-between px-1">
            <p className="text-sm text-mist dark:text-muted-foreground/60 font-medium">
              Showing <span className="text-foreground font-bold">{data?.data.students.length}</span> of <span className="text-foreground font-bold">{data?.data.pagination.totalCount}</span> students
            </p>
          </div>

          <div className={cn(
            "transition-opacity duration-300 ease-in-out",
            isRefetching ? "opacity-50" : "opacity-100"
          )}>
            <StudentTable students={data?.data.students || []} />
          </div>
          
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

// ─── Stat Card Sub-Component ─────────────────────────────────────────
function StatCard({ 
  label, value, icon: Icon, color, bg, isLoading, suffix 
}: { 
  label: string; 
  value: number; 
  icon: any; 
  color: string; 
  bg: string; 
  isLoading: boolean;
  suffix?: string;
}) {
  return (
    <Card className="border-none shadow-heavy bg-card relative overflow-hidden group hover:shadow-modal transition-shadow duration-300">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-[10px] font-heading font-bold uppercase tracking-widest text-mist dark:text-muted-foreground/60">
              {label}
            </p>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <p className={cn("text-3xl font-bold tracking-tight", color)}>
                {value.toLocaleString()}
              </p>
            )}
            {suffix && !isLoading && (
              <p className="text-[9px] text-muted-foreground/50 font-medium">{suffix}</p>
            )}
          </div>
          <div className={cn("p-2.5 rounded-xl transition-all duration-300", bg, "group-hover:scale-110")}>
            <Icon className={cn("size-5", color)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
