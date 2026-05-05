import { useApplications } from "@/hooks/student/useApplications";
import { ApplicationStatus } from "@/types/application";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Building2, Calendar, CheckCircle2, Clock } from "lucide-react";

const StatusBadge = ({ status }: { status: ApplicationStatus }) => {
  switch (status) {
    case "APPLIED":
      return <Badge variant="applied" className="gap-1"><CheckCircle2 className="w-3 h-3" /> Applied</Badge>;
    case "SHORTLISTED":
      return <Badge variant="warning" className="gap-1"><Clock className="w-3 h-3" /> Shortlisted</Badge>;
    case "SELECTED":
      return <Badge variant="success" className="gap-1"><CheckCircle2 className="w-3 h-3" /> Selected</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

import { useRouter } from "next/navigation";

export function ApplicationList() {
  const router = useRouter();
  const { data: applications, isLoading, isError } = useApplications();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden border-border/50">
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              <Skeleton className="h-5 w-1/2" />
              <div className="pt-4 border-t border-border/50 flex justify-between">
                <Skeleton className="h-4 w-1/3" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-center bg-card rounded-xl border border-destructive/20">
        <p className="text-destructive font-medium">Failed to load applications. Please try again later.</p>
      </div>
    );
  }

  if (!applications || applications.length === 0) {
    return (
      <div className="py-16 text-center bg-card rounded-2xl border border-dashed border-border/60 shadow-card">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
          <Building2 className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-heading font-semibold text-foreground mb-2">No Applications Yet</h3>
        <p className="text-muted-foreground max-w-sm mx-auto">
          You haven't applied to any jobs yet. Browse the job board to find opportunities.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {applications.map((app) => (
        <Card 
          key={app.id} 
          className="group overflow-hidden border-border/50 hover:border-primary/20 transition-all shadow-card hover:shadow-lg cursor-pointer hover:translate-y-[-2px]"
          onClick={() => router.push(`/jobs/${app.jobId}`)}
        >
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4 gap-4">
              <div>
                <h3 className="font-heading font-semibold text-lg text-foreground group-hover:text-primary transition-colors" title={app.job.title}>
                  {app.job.title}
                </h3>
                <div className="flex items-center text-muted-foreground text-sm mt-1 gap-1">
                  <Building2 className="w-4 h-4 shrink-0" />
                  <span>{app.job.company}</span>
                </div>
              </div>
              <StatusBadge status={app.status} />
            </div>

            <div className="pt-4 border-t border-border/50 flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                <span>Applied {format(new Date(app.createdAt), "MMM d, yyyy")}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

