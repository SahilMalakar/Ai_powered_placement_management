import React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface DashboardApp {
  id: number;
  title: string;
  company: string;
  status: string;
  appliedDate: string;
}

export interface RecentApplicationsProps {
  applications: DashboardApp[];
}

export function RecentApplications({ applications }: RecentApplicationsProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground font-heading">
          Recent Applications
        </h2>
        <Link 
          href="/applications" 
          className="text-xs text-indigo-400 hover:text-[#c084fc] transition-colors"
        >
          View history
        </Link>
      </div>

      <div className="flex flex-col gap-4">
        {applications.map((app) => (
          <Card 
            key={app.id} 
            className="bg-card border border-border p-4 rounded-xl shadow-card flex justify-between items-start dark:bg-[#141414] dark:border-[#202020] hover:border-slate-800 transition-all"
          >
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-foreground font-heading leading-snug">
                {app.title}
              </h4>
              <p className="text-xs text-muted-foreground font-body">
                {app.company}
              </p>
              <p className="text-[10px] text-muted-foreground font-mono pt-3">
                {app.appliedDate}
              </p>
            </div>

            <Badge 
              variant={
                app.status === "SELECTED" ? "success" : 
                app.status === "SHORTLISTED" ? "warning" : 
                "applied"
              }
              className="rounded-full text-[9px] font-bold tracking-wider uppercase font-mono px-2 py-0.5 shrink-0"
            >
              {app.status}
            </Badge>
          </Card>
        ))}
      </div>
    </div>
  );
}
