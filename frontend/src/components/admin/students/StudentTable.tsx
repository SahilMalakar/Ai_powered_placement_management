'use client';

import { 
  GraduationCap, 
  ExternalLink, 
  Trash2, 
  MoreHorizontal,
  UserCheck,
  UserX,
  AlertCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Student } from "@/types/admin/student";
import Link from "next/link";
import { useSoftDeleteStudent } from "@/hooks/admin/useStudents";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

interface StudentTableProps {
  students: Student[];
}

export function StudentTable({ students }: StudentTableProps) {
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const { mutate: deleteStudent, isPending: isDeleting } = useSoftDeleteStudent();

  const handleDelete = () => {
    if (deleteId) {
      deleteStudent(deleteId, {
        onSuccess: () => setDeleteId(null)
      });
    }
  };

  return (
    <div className="bg-card rounded-xl shadow-heavy overflow-hidden border border-border/50">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-muted/30 border-b border-border/50">
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Student</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Branch & Roll</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Academic</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {students.map((student) => (
              <tr key={student.id} className="hover:bg-muted/20 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-9 border-2 border-primary/10">
                      <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">
                        {student.profile.fullName.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-bold text-foreground text-sm">{student.profile.fullName}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">{student.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    <p className="text-xs font-medium flex items-center gap-1.5 text-foreground">
                      <GraduationCap className="size-3.5 text-primary" /> {student.profile.branch}
                    </p>
                    <p className="text-[10px] text-muted-foreground pl-5 font-mono">
                      {student.profile.rollNo || `ID: #${student.id}`}
                    </p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold text-foreground">{student.profile.cgpa} CGPA</p>
                    <p className={`text-[10px] font-medium ${student.profile.backlog ? 'text-error' : 'text-success'}`}>
                      {student.profile.backlog ? 'Has Backlogs' : 'No Backlogs'}
                    </p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Badge 
                    variant={
                      student.profile.verificationStatus === "VERIFIED" ? "success" : 
                      student.profile.verificationStatus === "FAILED" ? "error" : "warning" as any
                    } 
                    className="px-2 py-0 h-5 text-[10px] font-bold uppercase tracking-tight"
                  >
                    {student.profile.verificationStatus.replace("_", " ")}
                  </Badge>
                  {student.deletedAt && (
                    <Badge variant="destructive" className="ml-2 px-2 py-0 h-5 text-[10px] font-bold uppercase">
                      Banned
                    </Badge>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/admin/students/${student.id}`}>
                      <Button variant="ghost" size="sm" className="h-8 px-2 text-primary hover:text-primary hover:bg-primary/5 font-bold text-xs gap-1.5">
                        Profile <ExternalLink className="size-3" />
                      </Button>
                    </Link>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button variant="ghost" size="icon-sm" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        }
                      />
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem className="text-xs font-medium cursor-pointer">
                          <UserCheck className="size-3.5 mr-2" /> Mark as Verified
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-xs font-medium cursor-pointer">
                          <UserX className="size-3.5 mr-2 text-error" /> Reject Verification
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-xs font-medium text-error focus:text-error cursor-pointer"
                          onClick={() => setDeleteId(student.id)}
                        >
                          <Trash2 className="size-3.5 mr-2" /> Deactivate Account
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-error">
              <AlertCircle className="size-5" /> Deactivate Student Account?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will soft-delete the student account, profile, documents, and all active job applications. The student will no longer be able to log in.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-error hover:bg-error/90 text-white"
              disabled={isDeleting}
            >
              {isDeleting ? "Deactivating..." : "Confirm Deactivation"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
