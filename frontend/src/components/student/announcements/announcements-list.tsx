"use client";

import React from "react";
import { StudentAnnouncement } from "@/types/student/announcement";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { 
  BellOff, 
  ExternalLink, 
  FileSpreadsheet, 
  FileText, 
  FileDown, 
  Presentation, 
  FolderOpen,
  Calendar,
  UserCheck
} from "lucide-react";

interface AnnouncementsListProps {
  messages: StudentAnnouncement[];
}

/**
 * Smart URL parser to deduce the custom button label and Lucide icon.
 */
const getCTADetailsForLink = (url?: string | null) => {
  if (!url) return null;
  
  const lowerUrl = url.toLowerCase();
  
  // Strip query parameters (?) and hashes (#) to match files by suffix
  const cleanUrlPath = (lowerUrl.split('?')[0] || '').split('#')[0] || '';
  
  // 1. Google Sheets, Excel spreadsheets, or CSV downloads
  if (
    lowerUrl.includes('docs.google.com/spreadsheets') || 
    lowerUrl.includes('sheets.new') || 
    cleanUrlPath.endsWith('.csv') ||
    cleanUrlPath.endsWith('.xlsx') ||
    cleanUrlPath.endsWith('.xls')
  ) {
    return { label: 'Open Spreadsheet', icon: FileSpreadsheet };
  }
  
  // 2. Google Forms Surveys
  if (
    lowerUrl.includes('docs.google.com/forms') || 
    lowerUrl.includes('forms.gle')
  ) {
    return { label: 'Open Google Form', icon: FileText };
  }
  
  // 3. Google Docs (Word Documents)
  if (
    lowerUrl.includes('docs.google.com/document') || 
    lowerUrl.includes('docs.new') || 
    cleanUrlPath.endsWith('.docx') ||
    cleanUrlPath.endsWith('.doc')
  ) {
    return { label: 'Open Google Doc', icon: FileText };
  }
  
  // 4. Google Slides (Presentations)
  if (
    lowerUrl.includes('docs.google.com/presentation') || 
    lowerUrl.includes('slides.new') || 
    cleanUrlPath.endsWith('.pptx') ||
    cleanUrlPath.endsWith('.ppt')
  ) {
    return { label: 'Open Presentation', icon: Presentation };
  }
  
  // 5. Google Drive Shared Files or Folders
  if (
    lowerUrl.includes('drive.google.com') || 
    lowerUrl.includes('shared-drive')
  ) {
    return { label: 'Access Google Drive', icon: FolderOpen };
  }
  
  // 6. PDF Documents
  if (cleanUrlPath.endsWith('.pdf')) {
    return { label: 'View PDF Document', icon: FileDown };
  }
  
  return { label: 'View Details', icon: ExternalLink };
};

export function AnnouncementsList({ messages }: AnnouncementsListProps) {
  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-center bg-white dark:bg-[#141414] border border-border/80 dark:border-[#202020] rounded-2xl shadow-card">
        <div className="h-16 w-16 bg-slate-50 dark:bg-[#1a1a1a] rounded-full flex items-center justify-center mb-4 border border-border/40">
          <BellOff className="h-8 w-8 text-steel dark:text-muted-foreground" />
        </div>
        <h3 className="text-xl font-bold text-navy dark:text-foreground font-heading">
          All quiet here
        </h3>
        <p className="text-sm text-steel dark:text-muted-foreground mt-2 max-w-sm">
          No active placement announcements or broadcasts have been registered for your branch yet. Keep checking!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {messages.map((announcement) => {
        const cta = getCTADetailsForLink(announcement.link);
        const IconCTA = cta ? cta.icon : ExternalLink;

        return (
          <Card 
            key={announcement.id} 
            className="overflow-hidden border border-border/80 dark:border-[#202020] bg-white dark:bg-[#141414] shadow-card hover:shadow-card-hover transition-all duration-300 dark:shadow-[0_12px_36px_rgba(0,0,0,0.65)] dark:hover:shadow-[0_12px_48px_rgba(0,0,0,0.85)] relative"
            style={{
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)"
            }}
          >
            <CardContent className="p-6 space-y-4">
              {/* ── HEADER ── */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 dark:border-[#202020]/60 pb-3">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <UserCheck className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-xs font-semibold text-navy dark:text-foreground font-sans">
                    {announcement.createdBy.profile?.fullName || "Placement Cell Officer"}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-steel dark:text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  <span className="font-mono">
                    {formatDistanceToNow(new Date(announcement.createdAt), { addSuffix: true })}
                  </span>
                </div>
              </div>

              {/* ── BROADCAST CONTENT ── */}
              <div className="text-sm font-body text-navy/90 dark:text-foreground/90 leading-relaxed whitespace-pre-line bg-slate-50/50 dark:bg-[#1a1a1a]/20 p-4 rounded-xl border border-border/40 dark:border-[#252525]/40">
                {announcement.message}
              </div>

              {/* ── COHORTS TARGET & CTA LINK ── */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] uppercase font-bold text-steel dark:text-muted-foreground tracking-wider">
                    Targeted Branch:
                  </span>
                  {announcement.branches.map((b: string) => (
                    <Badge
                      key={b}
                      variant="outline"
                      className="font-mono bg-muted dark:bg-[#1a1a1a] text-[9px] font-bold border-border/60 hover:bg-muted dark:hover:bg-[#1a1a1a] cursor-default"
                    >
                      {b}
                    </Badge>
                  ))}
                </div>

                {cta && announcement.link && (
                  <a
                    href={announcement.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonVariants({ variant: "outline", size: "sm" }) + " flex items-center gap-1.5 border-border/80 text-xs font-medium font-sans h-8 px-4 self-end sm:self-auto"}
                  >
                    <IconCTA className="h-3.5 w-3.5 text-primary" />
                    <span>{cta.label}</span>
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
