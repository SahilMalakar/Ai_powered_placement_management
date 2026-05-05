'use client';

import { useParams, useRouter } from "next/navigation";
import { useResume, useDeleteResume } from "@/hooks/student/use-resume";
import { ResumeEditor } from "@/components/resume/resume-editor";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Loader2, AlertCircle, Trash2 } from "lucide-react";
import Link from "next/link";
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

export default function ResumeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const resumeId = parseInt(params.resumeId as string);
  const { data: resume, isLoading, isError } = useResume(resumeId);
  const deleteMutation = useDeleteResume();

  const handleDelete = () => {
    deleteMutation.mutate(resumeId, {
      onSuccess: () => {
        router.push("/resume");
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground animate-pulse">Loading resume data...</p>
      </div>
    );
  }

  if (isError || !resume) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="h-16 w-16 bg-error/10 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="h-8 w-8 text-error" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Resume not found</h2>
        <p className="text-muted-foreground mb-6">The resume you're looking for doesn't exist or you don't have access.</p>
        <Link href="/resume">
          <Button variant="outline">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Resumes
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto pt-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/resume">
          <Button variant="ghost" size="sm" className="pl-0 text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to List
          </Button>
        </Link>

        <AlertDialog>
          <AlertDialogTrigger
            render={
              <Button variant="ghost" size="sm" className="text-error hover:text-error hover:bg-error/10 transition-colors">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Resume
              </Button>
            }
          />
          <AlertDialogContent className="bg-card border-border shadow-modal">
            <AlertDialogHeader>
              <AlertDialogTitle className="font-heading">Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your resume
                and remove the exported PDF from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-secondary text-secondary-foreground border-border hover:bg-secondary/80">Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDelete}
                className="bg-error text-white hover:bg-error/90"
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete Permanently'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      
      <ResumeEditor resume={resume} />
    </div>
  );
}
