"use client";

import React from "react";
import { useStudentAnnouncements } from "@/hooks/student/useStudentAnnouncements";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Bell, Loader2, RefreshCw } from "lucide-react";
import { AnnouncementsList } from "./announcements-list";

export function AnnouncementsDashboard() {
  const [page, setPage] = React.useState(1);
  const limit = 5;

  const {
    data: response,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useStudentAnnouncements({ page, limit });

  const result = response?.data;
  const messages = result?.messages || [];
  const pagination = result?.pagination;

  const handlePrevPage = () => {
    if (page > 1) {
      setPage((p) => p - 1);
    }
  };

  const handleNextPage = () => {
    if (pagination && page < pagination.totalPages) {
      setPage((p) => p + 1);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto px-4 md:px-0">
      {/* ── 1. HEADER SECTION ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-[#141414] border border-border/80 dark:border-[#202020] rounded-2xl p-6 shadow-card relative overflow-hidden">
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="h-12 w-12 rounded-md bg-gradient-to-tr from-brand-blue to-brand-indigo flex items-center justify-center text-white shadow-button">
            <Bell className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground font-heading">
              Announcements
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Targeted broadcasts, placement alerts, and guidelines for your branch
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 relative z-10">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading || isFetching}
            className="flex items-center gap-1.5 h-9"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin text-primary" : ""}`} />
            <span>Reload</span>
          </Button>
        </div>
      </div>

      {/* ── 2. MAIN FEED LIST ── */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-[#141414] border border-border/80 dark:border-[#202020] rounded-2xl shadow-card">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
          <p className="text-sm font-medium text-slate-400 font-mono">Syncing Announcements...</p>
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-[#141414] border border-border/80 dark:border-[#202020] rounded-2xl shadow-card">
          <div className="h-12 w-12 bg-error/10 text-error rounded-full flex items-center justify-center mb-4">
            <Bell className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-foreground font-heading">
            Failed to sync announcements
          </h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm mb-6">
            Make sure your basic profile details are complete or check your internet connection.
          </p>
          <Button onClick={() => refetch()} className="btn-primary">
            Retry Sync
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <AnnouncementsList messages={messages} />

          {/* ── 3. PAGINATION BAR ── */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border border-border/80 dark:border-[#202020] bg-white dark:bg-[#141414] px-4 py-3 rounded-xl shadow-card">
              <div className="flex flex-1 items-center justify-between sm:hidden">
                <Button
                  variant="outline"
                  onClick={handlePrevPage}
                  disabled={page === 1}
                  size="sm"
                >
                  Previous
                </Button>
                <span className="text-xs font-mono text-muted-foreground font-medium">
                  Page {page} of {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={handleNextPage}
                  disabled={page === pagination.totalPages}
                  size="sm"
                >
                  Next
                </Button>
              </div>

              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">
                    Showing <span className="font-semibold text-foreground">{(page - 1) * limit + 1}</span> to{" "}
                    <span className="font-semibold text-foreground">
                      {Math.min(page * limit, pagination.totalCount)}
                    </span>{" "}
                    of <span className="font-semibold text-foreground">{pagination.totalCount}</span> announcements
                  </p>
                </div>
                <div>
                  <nav className="isolate inline-flex -space-x-px rounded-md gap-1" aria-label="Pagination">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handlePrevPage}
                      disabled={page === 1}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <div className="flex items-center justify-center px-3 h-8 bg-muted dark:bg-[#1a1a1a] border border-border/80 dark:border-[#202020] rounded-md">
                      <span className="text-xs font-mono font-bold text-foreground">
                        {page} / {pagination.totalPages}
                      </span>
                    </div>

                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleNextPage}
                      disabled={page === pagination.totalPages}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
