"use client";

import * as React from "react";
import { Send, CheckCircle2, AlertTriangle, Users2, LucideIcon } from "lucide-react";
import { NotificationMessage } from "@/types/admin/message";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MessageStatsProps {
  messages: NotificationMessage[];
  totalCount: number;
}

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
  iconColor: string;
  bgColor: string;
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  iconColor,
  bgColor,
}: StatCardProps) {
  return (
    <Card className="bg-card border border-border dark:border-[#202020] shadow-card hover:-translate-y-0.5 transition-all duration-300">
      <CardContent className="p-6 flex items-center justify-between gap-4">
        <div className="space-y-1.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-sans">
            {title}
          </p>
          <h3 className="font-heading text-2xl font-bold tracking-tight text-foreground">
            {value}
          </h3>
          <p className="text-xs text-muted-foreground font-medium">
            {description}
          </p>
        </div>
        <div className={cn("p-3 rounded-xl shrink-0 transition-transform duration-300 hover:scale-105", bgColor)}>
          <Icon className={cn("size-6", iconColor)} />
        </div>
      </CardContent>
    </Card>
  );
}

export function MessageStats({ messages, totalCount }: MessageStatsProps) {
  const stats = React.useMemo(() => {
    const total = totalCount || 0;
    
    // Calculate dispatches state
    let success = 0;
    let failed = 0;
    let queued = 0;
    const distinctBranches = new Set<string>();

    messages.forEach((msg) => {
      if (msg.status === "FAILED") {
        failed++;
      } else if (msg.status === "QUEUED") {
        queued++;
      } else {
        success++;
      }
      
      msg.branches.forEach((b) => distinctBranches.add(b));
    });

    // Approximate overall success rate (percentage of non-failed over total)
    const successRate = total > 0 
      ? Math.round(((total - failed) / total) * 100)
      : 100;

    return {
      total,
      success,
      failed,
      queued,
      branchesCount: distinctBranches.size,
      successRate,
    };
  }, [messages, totalCount]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-300">
      <StatCard
        title="Total Broadcasts"
        value={stats.total}
        description="Asynchronous email alerts logged"
        icon={Send}
        iconColor="text-primary"
        bgColor="bg-primary/10"
      />

      <StatCard
        title="Delivery Success"
        value={`${stats.successRate}%`}
        description={`${stats.failed} dispatch failures registered`}
        icon={CheckCircle2}
        iconColor="text-success"
        bgColor="bg-success/10"
      />

      <StatCard
        title="Pending Queue"
        value={stats.queued}
        description="Broadcasts pending background dispatch"
        icon={AlertTriangle}
        iconColor="text-warning"
        bgColor="bg-warning/10"
      />

      <StatCard
        title="Target Outreach"
        value={`${stats.branchesCount}/9`}
        description="Active campus cohorts reached"
        icon={Users2}
        iconColor="text-teal-blue"
        bgColor="bg-teal-blue/10"
      />
    </div>
  );
}
