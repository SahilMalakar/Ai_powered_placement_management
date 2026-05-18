'use client';

import { 
  GraduationCap, 
  ExternalLink, 
  Trash2, 
  MoreHorizontal,
  UserCheck,
  UserX,
  AlertCircle,
  BookOpen,
  Mail
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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
import { cn } from "@/lib/utils";

// ─── Status Styling ──────────────────────────────────────────────────
const VERIFICATION_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  VERIFIED: { 
    bg: "bg-success/10 border-success/20", 
    text: "text-success", 
    dot: "bg-success" 
  },
  PROCESSING: { 
    bg: "bg-warning/10 border-warning/20", 
    text: "text-warning", 
    dot: "bg-warning animate-pulse" 
  },
  NOT_VERIFIED: { 
    bg: "bg-muted/40 border-border dark:bg-muted/30 dark:border-border", 
    text: "text-muted-foreground dark:text-muted-foreground", 
    dot: "bg-muted-foreground dark:bg-muted-foreground" 
  },
  FAILED: { 
    bg: "bg-error/10 border-error/20", 
    text: "text-error", 
    dot: "bg-error" 
  },
};

// ─── Avatar Color Generator ─────────────────────────────────────────
const AVATAR_COLORS = [
  "from-brand-blue to-brand-indigo",
  "from-brand-mid to-brand-indigo",
  "from-brand-blue to-brand-mid",
  "from-brand-indigo to-brand-blue",
  "from-brand-mid to-brand-blue",
  "from-brand-indigo to-brand-mid",
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

// ─── CGPA Bar ────────────────────────────────────────────────────────
function CgpaBar({ cgpa }: { cgpa: number | null }) {
  const value = cgpa ?? 0;
  const percentage = Math.min((value / 10) * 100, 100);
  const color = value >= 8 ? "bg-success" : value >= 6.5 ? "bg-primary" : value >= 5 ? "bg-warning" : "bg-error";
  
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline gap-1.5">
        <span className="text-base font-bold text-foreground tabular-nums">{value.toFixed(2)}</span>
        <span className="text-[10px] text-muted-foreground/60 font-medium">/ 10</span>
      </div>
      <div className="w-20 h-1.5 bg-muted/50 rounded-full overflow-hidden">
        <div 
          className={cn("h-full rounded-full transition-all duration-700 ease-out", color)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

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
    <TooltipProvider>
      <div className="bg-card rounded-2xl shadow-heavy overflow-hidden border border-border/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/20 dark:bg-muted/10">
                <th className="px-6 py-4 text-[10px] font-heading font-bold uppercase tracking-[0.15em] text-mist dark:text-muted-foreground/50">Student</th>
                <th className="px-6 py-4 text-[10px] font-heading font-bold uppercase tracking-[0.15em] text-mist dark:text-muted-foreground/50">Branch & Roll</th>
                <th className="px-6 py-4 text-[10px] font-heading font-bold uppercase tracking-[0.15em] text-mist dark:text-muted-foreground/50">Academic</th>
                <th className="px-6 py-4 text-[10px] font-heading font-bold uppercase tracking-[0.15em] text-mist dark:text-muted-foreground/50">Status</th>
                <th className="px-6 py-4 text-[10px] font-heading font-bold uppercase tracking-[0.15em] text-mist dark:text-muted-foreground/50 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, index) => {
                const statusStyle = VERIFICATION_STYLES[student.profile.verificationStatus] || VERIFICATION_STYLES.NOT_VERIFIED;
                const avatarGradient = getAvatarColor(student.profile.fullName);
                const isBanned = student.deletedAt !== null;

                return (
                  <tr 
                    key={student.id} 
                    className={cn(
                      "border-b border-border/30 last:border-b-0 transition-all duration-200 group",
                      isBanned 
                        ? "bg-error/[0.02] hover:bg-error/[0.04]" 
                        : "hover:bg-accent/40 dark:hover:bg-muted/20"
                    )}
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    {/* ─── Student Info ─── */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3.5">
                        <div className="relative">
                          <Avatar className="size-10 ring-2 ring-border/50 group-hover:ring-primary/20 transition-all duration-200">
                            <AvatarFallback className={cn("bg-gradient-to-br text-white text-xs font-bold", avatarGradient)}>
                              {student.profile.fullName.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          {/* Online/status dot */}
                          <div className={cn(
                            "absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-card",
                            statusStyle.dot
                          )} />
                        </div>
                        <div className="min-w-0">
                          <p className={cn(
                            "font-bold text-sm truncate max-w-[180px]",
                            isBanned ? "text-error/70 line-through" : "text-foreground"
                          )}>
                            {student.profile.fullName}
                          </p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <Mail className="size-2.5 text-muted-foreground/40" />
                            <p className="text-[10px] text-muted-foreground/60 font-mono truncate max-w-[160px]">
                              {student.email}
                            </p>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* ─── Branch & Roll ─── */}
                    <td className="px-6 py-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5">
                          <div className="flex items-center justify-center size-5 rounded-md bg-primary/5 dark:bg-primary/10">
                            <GraduationCap className="size-3 text-primary" />
                          </div>
                          <span className="text-xs font-bold text-foreground">{student.profile.branch}</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground/50 font-mono pl-[26px]">
                          {student.profile.rollNo || `ID: #${student.id}`}
                        </p>
                      </div>
                    </td>

                    {/* ─── Academic ─── */}
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <CgpaBar cgpa={student.profile.cgpa} />
                        <div className="flex items-center gap-1 pl-0.5">
                          <BookOpen className="size-2.5 text-muted-foreground/30" />
                          <span className={cn(
                            "text-[10px] font-medium",
                            student.profile.backlog ? "text-error/80" : "text-success/80"
                          )}>
                            {student.profile.backlog ? "Has Backlogs" : "No Backlogs"}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* ─── Status ─── */}
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Badge 
                          variant="outline"
                          className={cn(
                            "px-2.5 py-0.5 h-6 text-[10px] font-bold uppercase tracking-wider border rounded-md",
                            statusStyle.bg, statusStyle.text
                          )}
                        >
                          <span className={cn("size-1.5 rounded-full mr-1", statusStyle.dot)} />
                          {student.profile.verificationStatus.replace("_", " ")}
                        </Badge>
                        {isBanned && (
                          <Badge 
                            variant="destructive" 
                            className="px-2 py-0.5 h-6 text-[10px] font-bold uppercase tracking-wider rounded-md"
                          >
                            Banned
                          </Badge>
                        )}
                      </div>
                    </td>

                    {/* ─── Actions ─── */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Tooltip>
                          <TooltipTrigger render={
                            <Link href={`/admin/students/${student.id}`}>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 px-3 text-primary hover:text-primary hover:bg-primary/5 font-bold text-xs gap-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200"
                              >
                                Profile <ExternalLink className="size-3" />
                              </Button>
                            </Link>
                          } />
                          <TooltipContent side="top" className="text-[10px]">
                            View full student profile
                          </TooltipContent>
                        </Tooltip>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={
                              <Button 
                                variant="ghost" 
                                size="icon-sm" 
                                className="h-8 w-8 text-muted-foreground/50 hover:text-foreground hover:bg-accent rounded-lg transition-all duration-200"
                              >
                                <MoreHorizontal className="size-4" />
                              </Button>
                            }
                          />
                          <DropdownMenuContent align="end" className="w-52">
                            <DropdownMenuItem className="text-xs font-medium cursor-pointer gap-2 py-2">
                              <UserCheck className="size-3.5 text-success" /> Mark as Verified
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-xs font-medium cursor-pointer gap-2 py-2">
                              <UserX className="size-3.5 text-error" /> Reject Verification
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-xs font-medium text-error focus:text-error cursor-pointer gap-2 py-2"
                              onClick={() => setDeleteId(student.id)}
                            >
                              <Trash2 className="size-3.5" /> Deactivate Account
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                );
              })}
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
    </TooltipProvider>
  );
}
