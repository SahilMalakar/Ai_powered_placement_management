'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useExportLogsQuery, useDeleteExportLogMutation } from "@/hooks/admin/useExport";
import { useAppStore } from "@/store/useAppStore";
import { Download, Trash2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ExportHistoryPanel() {
  const [page, setPage] = useState(1);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { exportStatus } = useAppStore();
  const { data, isLoading } = useExportLogsQuery(page, exportStatus === 'processing');
  const deleteMutation = useDeleteExportLogMutation();

  const logs = data?.data?.logs || [];
  const totalPages = data?.data?.totalPages || 1;

  const handleDelete = (id: number) => {
    setDeletingId(id);
    deleteMutation.mutate(id, {
      onSettled: () => {
        setDeletingId(null);
      },
    });
  };

  const formatDateTime = (dateStr: string) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${day} ${month} ${year}, ${hours}:${minutes}`;
  };

  const formatFilters = (filters: Record<string, any>) => {
    if (!filters || typeof filters !== 'object') return '—';
    const entries = Object.entries(filters)
      .filter(([_, v]) => v !== null && v !== undefined && v !== '' && v !== 'all' && v !== false)
      .map(([k, v]) => {
        if (k === 'backlogAllowed') return `backlog: Yes`;
        return `${k}: ${v}`;
      });
    return entries.length > 0 ? entries.join(', ') : '—';
  };

  return (
    <Card className="border-none shadow-heavy bg-card">
      <CardHeader className="border-b border-border/50 pb-6">
        <CardTitle className="text-xl font-heading font-bold text-foreground">
          Export History
        </CardTitle>
        <CardDescription>
          Recent CSV exports. Links expire after 1 hour.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/20 dark:bg-muted/10 border-b border-border/50">
                <th className="px-6 py-4 text-[10px] font-heading font-bold uppercase tracking-[0.15em] text-mist dark:text-muted-foreground/50">Type</th>
                <th className="px-6 py-4 text-[10px] font-heading font-bold uppercase tracking-[0.15em] text-mist dark:text-muted-foreground/50">Filters Applied</th>
                <th className="px-6 py-4 text-[10px] font-heading font-bold uppercase tracking-[0.15em] text-mist dark:text-muted-foreground/50">Records</th>
                <th className="px-6 py-4 text-[10px] font-heading font-bold uppercase tracking-[0.15em] text-mist dark:text-muted-foreground/50">Exported By</th>
                <th className="px-6 py-4 text-[10px] font-heading font-bold uppercase tracking-[0.15em] text-mist dark:text-muted-foreground/50">Date</th>
                <th className="px-6 py-4 text-[10px] font-heading font-bold uppercase tracking-[0.15em] text-mist dark:text-muted-foreground/50 text-center">Download</th>
                <th className="px-6 py-4 text-[10px] font-heading font-bold uppercase tracking-[0.15em] text-mist dark:text-muted-foreground/50 text-center">Delete</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, idx) => (
                  <tr key={idx} className="border-b border-border/30 last:border-b-0">
                    <td className="px-6 py-4"><Skeleton className="h-4 w-16" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-40" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-12" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-28" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                    <td className="px-6 py-4 text-center"><Skeleton className="h-8 w-8 rounded-md mx-auto" /></td>
                    <td className="px-6 py-4 text-center"><Skeleton className="h-8 w-8 rounded-md mx-auto" /></td>
                  </tr>
                ))
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-muted-foreground text-sm">
                    No exports yet.
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const isDeletingRow = deletingId === log.id;
                  return (
                    <tr
                      key={log.id}
                      className="border-b border-border/30 last:border-b-0 hover:bg-accent/40 dark:hover:bg-muted/20 transition-all duration-200"
                    >
                      <td className="px-6 py-4">
                        {log.type === 'students' ? (
                          <Badge variant="secondary" className="capitalize">
                            Students
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="capitalize">
                            Applications
                          </Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 max-w-[240px] truncate">
                        <span className="text-xs text-muted-foreground font-mono" title={formatFilters(log.filters)}>
                          {formatFilters(log.filters)}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-sm text-foreground">
                        {log.recordCount}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-muted-foreground truncate max-w-[140px] block" title={log.admin.email}>
                          {log.admin.email}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-foreground">
                        {formatDateTime(log.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-primary hover:bg-primary/10"
                          onClick={() => window.open(log.fileUrl, '_blank')}
                        >
                          <Download className="size-4" />
                        </Button>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-[#E24B4A] hover:bg-[#E24B4A]/10 transition-colors"
                          onClick={() => handleDelete(log.id)}
                          disabled={isDeletingRow}
                        >
                          {isDeletingRow ? (
                            <Loader2 className="size-4 animate-spin text-[#E24B4A]" />
                          ) : (
                            <Trash2 className="size-4" />
                          )}
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination Row */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-border/50">
            <span className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
