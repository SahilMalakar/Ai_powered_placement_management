"use client";

import {
  MoreVertical,
  Calendar,
  Building2,
  Users,
  Power,
  PowerOff,
  Edit3,
  Trash2,
  Loader2
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface JobCardProps {
  job: any;
  onEdit: (job: any) => void;
  onDelete: (job: any) => void;
  onToggleStatus: (params: { id: string; currentStatus: string }) => void;
  isToggling: boolean;
}

export function JobCard({
  job,
  onEdit,
  onDelete,
  onToggleStatus,
  isToggling
}: JobCardProps) {
  return (
    <Card className="border-none shadow-heavy hover:shadow-xl transition-all duration-300 group">
      <CardContent className="p-0">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between p-6 gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary/5 rounded-xl group-hover:bg-primary/10 transition-colors">
              <Building2 className="size-6 text-primary" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{job.title}</h3>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Building2 className="size-3.5" /> {job.company}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="size-3.5" />
                  {format(new Date(job.deadline), "dd MMM, yyyy")}
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="size-3.5" />
                  {job._count?.applications || 0} Applicants
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between lg:justify-end gap-6 border-t lg:border-none pt-4 lg:pt-0">
            <Badge
              variant={job.status === "ACTIVE" ? "success" : job.status === "DRAFT" ? "warning" : "steel" as any}
              className={cn(
                "px-3 py-1 transition-colors",
                job.status === "DEACTIVE" && "opacity-60"
              )}
            >
              {job.status}
            </Badge>
            <div className="flex items-center gap-2">
              <Link href={`/admin/jobs/${job.id}`}>
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger render={
                  <button className="inline-flex items-center justify-center h-8 w-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <MoreVertical className="size-4" />
                  </button>
                } />
                <DropdownMenuContent align="end" className="w-48 shadow-modal">
                  <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="gap-2 cursor-pointer"
                    onClick={() => onEdit(job)}
                  >
                    <Edit3 className="size-4" /> Edit Details
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="gap-2 cursor-pointer"
                    onClick={() => onToggleStatus({ id: job.id, currentStatus: job.status })}
                    disabled={isToggling}
                  >
                    {isToggling ? (
                      <Loader2 className="size-4 animate-spin text-muted-foreground" />
                    ) : job.status === "ACTIVE" ? (
                      <>
                        <PowerOff className="size-4 text-error" />
                        <span className="text-error font-medium">Deactivate Job</span>
                      </>
                    ) : (
                      <>
                        <Power className="size-4 text-success" />
                        <span className="text-success font-medium">Activate Job</span>
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="gap-2 cursor-pointer text-error focus:text-error focus:bg-error/10"
                    onClick={() => onDelete(job)}
                  >
                    <Trash2 className="size-4" /> Delete Posting
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
