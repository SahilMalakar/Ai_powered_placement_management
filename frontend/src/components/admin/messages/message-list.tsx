"use client";

import * as React from "react";
import {
  Calendar,
  User,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Inbox,
  Clock,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
  FileText,
  FileDown,
  Layers,
} from "lucide-react";
import { NotificationMessage } from "@/types/admin/message";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Client-side helper mirroring the backend's context-sensitive link label resolver
const getButtonLabelForLink = (url?: string | null): string => {
  if (!url) return "View Details";
  const lowerUrl = url.toLowerCase();
  const cleanUrlPath = (lowerUrl.split("?")[0] || "").split("#")[0] || "";

  if (
    lowerUrl.includes("docs.google.com/spreadsheets") ||
    lowerUrl.includes("sheets.new") ||
    cleanUrlPath.endsWith(".csv") ||
    cleanUrlPath.endsWith(".xlsx") ||
    cleanUrlPath.endsWith(".xls")
  ) {
    return "Open Spreadsheet";
  }

  if (
    lowerUrl.includes("docs.google.com/forms") ||
    lowerUrl.includes("forms.gle")
  ) {
    return "Open Google Form";
  }

  if (
    lowerUrl.includes("docs.google.com/document") ||
    lowerUrl.includes("docs.new") ||
    cleanUrlPath.endsWith(".docx") ||
    cleanUrlPath.endsWith(".doc")
  ) {
    return "Open Google Doc";
  }

  if (
    lowerUrl.includes("docs.google.com/presentation") ||
    lowerUrl.includes("slides.new") ||
    cleanUrlPath.endsWith(".pptx") ||
    cleanUrlPath.endsWith(".ppt")
  ) {
    return "Open Presentation";
  }

  if (
    lowerUrl.includes("drive.google.com") ||
    lowerUrl.includes("shared-drive")
  ) {
    return "Access Google Drive";
  }

  if (cleanUrlPath.endsWith(".pdf")) {
    return "View PDF Document";
  }

  return "View Details";
};

// Client-side helper to return the matching icon for a CTA url
const getLinkIcon = (url?: string | null) => {
  if (!url) return ExternalLink;
  const label = getButtonLabelForLink(url);
  if (label.includes("Spreadsheet")) return FileSpreadsheet;
  if (label.includes("Form") || label.includes("Doc")) return FileText;
  if (label.includes("PDF")) return FileDown;
  return ExternalLink;
};

interface MessageListProps {
  messages: NotificationMessage[];
  isLoading: boolean;
  page: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
}

export function MessageList({
  messages,
  isLoading,
  page,
  totalPages,
  totalCount,
  onPageChange,
}: MessageListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse bg-card border border-border dark:border-[#202020]">
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex gap-2">
                  <div className="w-16 h-5 bg-muted dark:bg-[#1a1a1a] rounded" />
                  <div className="w-24 h-5 bg-muted dark:bg-[#1a1a1a] rounded" />
                </div>
                <div className="w-20 h-5 bg-muted dark:bg-[#1a1a1a] rounded" />
              </div>
              <div className="space-y-2">
                <div className="w-full h-4 bg-muted dark:bg-[#1a1a1a] rounded" />
                <div className="w-5/6 h-4 bg-muted dark:bg-[#1a1a1a] rounded" />
              </div>
              <div className="flex justify-between items-center pt-2">
                <div className="w-32 h-4 bg-muted dark:bg-[#1a1a1a] rounded" />
                <div className="w-24 h-8 bg-muted dark:bg-[#1a1a1a] rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <Card className="bg-card border border-border dark:border-[#202020] text-center p-12 shadow-card">
        <CardContent className="flex flex-col items-center justify-center space-y-4">
          <div className="p-4 bg-primary/10 rounded-full text-primary">
            <Inbox className="size-8" />
          </div>
          <div className="space-y-1">
            <h3 className="font-heading text-lg font-bold text-foreground">No Broadcasts Found</h3>
            <p className="text-muted-foreground text-sm max-w-sm">
              You haven't dispatched any announcements yet. Trigger a &quot;New Broadcast&quot; to reach your cohorts.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-base font-bold text-foreground flex items-center gap-2">
          <span>Sent Announcements</span>
          <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary">
            {totalCount} total
          </span>
        </h2>
      </div>

      <div className="space-y-4">
        {messages.map((message) => {
          const StatusIcon =
            message.status === "FAILED"
              ? XCircle
              : message.status === "QUEUED"
              ? Clock
              : CheckCircle2;

          const statusLabel =
            message.status === "FAILED"
              ? "FAILED"
              : message.status === "QUEUED"
              ? "QUEUED"
              : "COMPLETED";

          const LinkIcon = getLinkIcon(message.link);
          const ctaLabel = getButtonLabelForLink(message.link);

          return (
            <Card
              key={message.id}
              className={cn(
                "bg-card border border-border dark:border-[#202020] shadow-card hover:shadow-md transition-all duration-200 border-l-4 overflow-hidden",
                message.status === "FAILED"
                  ? "border-l-error"
                  : message.status === "QUEUED"
                  ? "border-l-warning"
                  : "border-l-success"
              )}
            >
              <CardContent className="p-6 space-y-4">
                {/* Header Row */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Status Badge */}
                    <span
                      className={cn(
                        "text-[10px] font-bold font-heading px-2 py-0.5 rounded-full flex items-center gap-1",
                        message.status === "FAILED"
                          ? "text-error bg-error/10"
                          : message.status === "QUEUED"
                          ? "text-warning bg-warning/10"
                          : "text-success bg-success/10"
                      )}
                    >
                      <StatusIcon className="size-3" />
                      <span>{statusLabel}</span>
                    </span>

                    {/* Target Cohort Badge List */}
                    <div className="flex flex-wrap items-center gap-1">
                      <span className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1 mr-1">
                        <Layers className="size-3 text-muted-foreground" />
                        <span>To:</span>
                      </span>
                      {message.branches.map((b) => (
                        <span
                          key={b}
                          className="text-[9px] font-bold font-mono tracking-wider px-1.5 py-0.5 rounded bg-muted dark:bg-[#1a1a1a] text-muted-foreground dark:text-foreground border border-border/40 dark:border-[#252525]"
                        >
                          {b}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Date Badge */}
                  <span className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                    <Calendar className="size-3.5 text-muted-foreground" />
                    <span>
                      {new Date(message.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <span className="text-[10px] text-muted-foreground/50">•</span>
                    <span>
                      {new Date(message.createdAt).toLocaleTimeString(undefined, {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </span>
                </div>

                {/* Announcement Message Body */}
                <p className="text-foreground text-sm leading-relaxed whitespace-pre-wrap select-text font-body">
                  {message.message}
                </p>

                {/* Footer Row */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-border/50 dark:border-[#202020]/60">
                  {/* Sender Profile */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                    <div className="size-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-[10px]">
                      <User className="size-3" />
                    </div>
                    <span>
                      {message.createdBy?.profile?.fullName || "Placement Cell Admin"}
                    </span>
                    <span className="text-[10px] text-muted-foreground/30">•</span>
                    <span className="font-mono text-[10px] text-muted-foreground/75 truncate max-w-[150px]">
                      {message.createdBy?.email}
                    </span>
                  </div>

                  {/* Smart CTA Button */}
                  {message.link && (
                    <a
                      href={message.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        buttonVariants({ variant: "outline", size: "sm" }),
                        "text-xs h-8 border-border dark:border-[#2a2a2a] hover:bg-accent hover:text-accent-foreground font-semibold flex items-center gap-1.5"
                      )}
                    >
                      <LinkIcon className="size-3.5" />
                      <span>{ctaLabel}</span>
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-border/40 dark:border-[#202020]/60">
          <p className="text-xs text-muted-foreground font-medium">
            Showing page <span className="font-bold text-foreground">{page}</span> of{" "}
            <span className="font-bold text-foreground">{totalPages}</span>
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
              className="size-8 p-0"
              aria-label="Previous Page"
            >
              <ChevronLeft className="size-4" />
            </Button>

            {/* Render Page Numbers */}
            {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((p) => (
              <Button
                key={p}
                variant={page === p ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(p)}
                className={cn(
                  "size-8 p-0 text-xs font-semibold",
                  page === p
                    ? "btn-primary hover:opacity-95"
                    : "border-border dark:border-[#2a2a2a] hover:bg-accent"
                )}
              >
                {p}
              </Button>
            ))}

            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page === totalPages}
              className="size-8 p-0"
              aria-label="Next Page"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
