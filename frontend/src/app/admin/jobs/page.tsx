"use client";

import { 
  Search, 
  Filter,
  MoreVertical,
  Calendar,
  Building2,
  Users,
  Loader2,
  Trash2,
  Power,
  PowerOff
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { useAdminJobs, useToggleJobStatus } from "@/hooks/admin/useAdminJobs"
import { CreateJobDialog } from "@/components/admin/jobs/create-job-dialog"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

export default function AdminJobsPage() {
  const { data: response, isLoading, isError } = useAdminJobs();
  const { mutate: toggleStatus, isPending: isToggling } = useToggleJobStatus();

  const jobs = response?.data?.jobs || [];

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground animate-pulse">Fetching recruitment drives...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-error font-medium">Failed to load jobs.</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Job Postings</h1>
          <p className="text-muted-foreground mt-1">Manage and track all campus recruitment opportunities.</p>
        </div>
        <CreateJobDialog />
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input placeholder="Search by job title or company..." className="pl-10 h-11 border-none shadow-subtle bg-card" />
        </div>
        <Button variant="secondary" className="h-11 shadow-subtle">
          <Filter className="size-4 mr-2" /> Filters
        </Button>
      </div>

      <div className="grid gap-4">
        {jobs.length === 0 ? (
          <Card className="border-dashed border-2 bg-transparent">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Building2 className="size-12 text-muted-foreground/20 mb-4" />
              <h3 className="text-lg font-semibold">No jobs posted yet</h3>
              <p className="text-muted-foreground max-w-xs mx-auto mt-1">
                Start by posting your first recruitment drive to see it here.
              </p>
            </CardContent>
          </Card>
        ) : (
          jobs.map((job) => (
            <Card key={job.id} className="border-none shadow-heavy hover:shadow-xl transition-all duration-300 group">
              <CardContent className="p-0">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between p-6 gap-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/5 rounded-xl group-hover:bg-primary/10 transition-colors">
                      <Building2 className="size-6 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{job.title}</h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5"><Building2 className="size-3.5" /> {job.company}</span>
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
                      variant={job.status === "ACTIVE" ? "success" : "steel" as any} 
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
                          <DropdownMenuItem className="gap-2 cursor-pointer">
                            <Building2 className="size-4" /> Edit Details
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="gap-2 cursor-pointer"
                            onClick={() => toggleStatus({ id: job.id, currentStatus: job.status })}
                            disabled={isToggling}
                          >
                            {job.status === "ACTIVE" ? (
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
                          <DropdownMenuItem className="gap-2 cursor-pointer text-error focus:text-error focus:bg-error/10">
                            <Trash2 className="size-4" /> Delete Posting
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
