'use client';

import { useResumes, useGenerateResume, useExportResume, useDeleteResume } from "@/hooks/student/use-resume";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Download, Edit2, FileText, Loader2, AlertCircle, RefreshCw, Trash2 } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { Resume } from "@/types/student/resume";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function ResumeList() {
  const { data: resumes, isLoading, isError, refetch } = useResumes();
  const { mutate: generateResume, isPending: isGenerating } = useGenerateResume();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-48 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-card rounded-xl border shadow-sm">
        <AlertCircle className="h-12 w-12 text-error mb-4" />
        <h3 className="text-xl font-semibold mb-2">Failed to load resumes</h3>
        <p className="text-muted-foreground mb-6">There was an error fetching your resumes. Please try again.</p>
        <Button onClick={() => refetch()} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-navy dark:text-foreground">Your Resumes</h2>
          <p className="text-muted-foreground">Manage your AI-generated resumes and exports.</p>
        </div>
        <Button 
          onClick={() => generateResume()} 
          disabled={isGenerating || resumes?.some(r => r.status === 'GENERATING')}
          className="bg-gradient-to-r from-[#818cf8] to-[#c084fc] hover:opacity-90 text-white shadow-button"
        >
          {isGenerating ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Plus className="mr-2 h-4 w-4" />
          )}
          Generate New Resume
        </Button>
      </div>

      {resumes && resumes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resumes.map((resume) => (
            <ResumeCard key={resume.id} resume={resume} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-16 text-center bg-white dark:bg-card rounded-xl border border-dashed shadow-sm">
          <div className="h-16 w-16 bg-pale dark:bg-muted rounded-full flex items-center justify-center mb-4">
            <FileText className="h-8 w-8 text-steel" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No resumes yet</h3>
          <p className="text-muted-foreground max-w-sm mb-6">
            You haven't generated any resumes yet. Complete your profile and click the button above to get started.
          </p>
        </div>
      )}
    </div>
  );
}

function ResumeCard({ resume }: { resume: Resume }) {
  const { mutate: exportPdf, isPending: isExporting } = useExportResume();
  const deleteMutation = useDeleteResume();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'GENERATING':
        return <Badge variant="secondary" className="bg-warning/10 text-warning animate-pulse">GENERATING</Badge>;
      case 'COMPLETED':
        return <Badge variant="secondary" className="bg-success/10 text-success">COMPLETED</Badge>;
      case 'FAILED':
        return <Badge variant="destructive" className="bg-error/10 text-error">FAILED</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card className="overflow-hidden border shadow-card hover:shadow-card-hover transition-all duration-300 dark:bg-card">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle className="text-lg font-bold text-navy dark:text-foreground">
              {resume.jsonData?.targetRole || `Resume v${resume.version}`}
            </CardTitle>
            <CardDescription className="text-xs">
              Generated on {format(new Date(resume.createdAt), 'PPP')}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(resume.status)}
            
            <AlertDialog>
              <AlertDialogTrigger
                render={
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 text-muted-foreground hover:text-error hover:bg-error/10 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                }
              />
              <AlertDialogContent className="bg-card border-border shadow-modal">
                <AlertDialogHeader>
                  <AlertDialogTitle className="font-heading">Delete Resume?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete this resume and its associated PDF.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-secondary text-secondary-foreground border-border hover:bg-secondary/80">Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => deleteMutation.mutate(resume.id)}
                    className="bg-error text-white hover:bg-error/90"
                    disabled={deleteMutation.isPending}
                  >
                    {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <p className="text-sm text-muted-foreground line-clamp-2 italic">
          "{resume.jsonData?.summary || 'No summary available'}"
        </p>
      </CardContent>
      <CardFooter className="pt-2 flex gap-2 border-t bg-slate-50/50 dark:bg-white/5">
        <Link href={`/resume/${resume.id}`} className="flex-1">
          <Button variant="outline" size="sm" className="w-full" disabled={resume.status !== 'COMPLETED'}>
            <Edit2 className="mr-2 h-3 w-3" />
            Edit
          </Button>
        </Link>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1"
          onClick={() => exportPdf(resume.id)}
          disabled={resume.status !== 'COMPLETED' || isExporting}
        >
          {isExporting ? (
            <Loader2 className="mr-2 h-3 w-3 animate-spin" />
          ) : (
            <Download className="mr-2 h-3 w-3" />
          )}
          {resume.pdfUrl ? 'Re-export' : 'Export PDF'}
        </Button>
      </CardFooter>
      {resume.pdfUrl && (
        <div className="px-6 py-2 bg-success/5 border-t">
          <a 
            href={resume.pdfUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-[10px] font-medium text-success flex items-center hover:underline"
          >
            <FileText className="mr-1 h-3 w-3" />
            View Exported PDF
          </a>
        </div>
      )}
    </Card>
  );
}
