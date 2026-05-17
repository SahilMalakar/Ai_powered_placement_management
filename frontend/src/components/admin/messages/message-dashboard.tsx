"use client";

import * as React from "react";
import { MessageSquare, RefreshCw } from "lucide-react";
import { useAdminMessagesHistory } from "@/hooks/admin/useAdminMessages";
import { MessageStats } from "./message-stats";
import { MessageList } from "./message-list";
import { CreateMessageDrawer } from "./create-message-drawer";
import { Button } from "@/components/ui/button";

export function MessageDashboard() {
  const [page, setPage] = React.useState(1);
  const limit = 5; // Clean sizing for high readability and fast page offsets

  const { data, isLoading, isError, refetch, isFetching } = useAdminMessagesHistory({
    page,
    limit,
  });

  const messages = data?.data?.messages || [];
  const pagination = data?.data?.pagination || {
    totalCount: 0,
    totalPages: 1,
  };

  return (
    <div className="space-y-8">
      {/* Dynamic Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-border dark:border-[#202020]">
        <div className="space-y-1">
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <MessageSquare className="size-6 text-primary shrink-0" />
            <span>Admin Announcements</span>
          </h1>
          <p className="text-sm text-muted-foreground font-medium">
            Broadcast text announcements and resources to targeted student branches via high-throughput background queues.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading || isFetching}
            className="text-xs h-9 border-border dark:border-[#202020] hover:bg-accent font-semibold flex items-center gap-1.5"
            aria-label="Refresh Data"
          >
            <RefreshCw className={`size-3.5 ${isFetching ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>

          {/* Composition slide panel */}
          <CreateMessageDrawer />
        </div>
      </div>

      {/* Overview stats */}
      <MessageStats messages={messages} totalCount={pagination.totalCount} />

      {/* Announcement Timeline History */}
      <div className="bg-card border border-border dark:border-[#202020] shadow-card rounded-xl p-6">
        {isError ? (
          <div className="text-center p-8 space-y-3">
            <p className="text-sm text-error font-medium">Failed to retrieve broadcast log history.</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="text-xs font-semibold"
            >
              Retry Connection
            </Button>
          </div>
        ) : (
          <MessageList
            messages={messages}
            isLoading={isLoading}
            page={page}
            totalPages={pagination.totalPages}
            totalCount={pagination.totalCount}
            onPageChange={(p) => setPage(p)}
          />
        )}
      </div>
    </div>
  );
}
