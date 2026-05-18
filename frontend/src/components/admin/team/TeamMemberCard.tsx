import { AdminTeamMember } from "@/types/admin/team";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, RefreshCw, ShieldCheck, Trash2 } from "lucide-react";

interface TeamMemberCardProps {
  member: AdminTeamMember;
  isSuperAdmin: boolean;
  isSelf: boolean;
  onSwapRole: (id: number, role: "ADMIN" | "SUPER_ADMIN") => void;
  onOpenReactivate: (id: number, email: string, role: "ADMIN" | "SUPER_ADMIN") => void;
  onOpenDeactivate: (id: number, email: string) => void;
  isRolePending: boolean;
}

export function TeamMemberCard({
  member,
  isSuperAdmin,
  isSelf,
  onSwapRole,
  onOpenReactivate,
  onOpenDeactivate,
  isRolePending,
}: TeamMemberCardProps) {
  const isDeleted = member.deletedAt !== null;
  
  // Generate clean initial avatar letters
  const initialLetter = member.email.substring(0, 2).toUpperCase();

  return (
    <div
      className={`bg-card rounded-xl border border-border/50 p-6 flex flex-col justify-between gap-6 shadow-heavy dark:shadow-[0_12px_36px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl relative overflow-hidden animate-in fade-in duration-500 ${
        isDeleted ? "opacity-75" : ""
      }`}
    >
      {/* Deactivated Color Rim */}
      {isDeleted && <div className="absolute top-0 right-0 left-0 h-1 bg-error" />}

      <div>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-4">
            
            {/* Geometric Letter Avatar */}
            <div
              className={`size-12 rounded-full flex items-center justify-center font-bold text-sm select-none ${
                isDeleted
                  ? "bg-muted/80 text-muted-foreground"
                  : member.role === "SUPER_ADMIN"
                  ? "bg-gradient-to-br from-brand-blue to-brand-indigo text-white"
                  : "bg-brand-blue/10 text-brand-blue border border-brand-blue/20"
              }`}
            >
              {initialLetter}
            </div>

            <div>
              {/* Email ID */}
              <h2
                className="font-mono text-sm font-semibold tracking-tight text-foreground break-all max-w-[150px] sm:max-w-[200px]"
                title={member.email}
              >
                {member.email}
              </h2>

              {/* Status Badges */}
              <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                <Badge variant={member.role === "SUPER_ADMIN" ? "default" : "secondary"}>
                  {member.role === "SUPER_ADMIN" ? "Super Admin" : "Admin"}
                </Badge>

                {isSelf && (
                  <Badge variant="ghost" className="bg-primary/5 text-primary">
                    You
                  </Badge>
                )}

                {isDeleted ? (
                  <Badge variant="destructive">Deactivated</Badge>
                ) : (
                  <Badge variant="success">Active</Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Date details */}
        <div className="mt-6 space-y-2 border-t border-border/30 pt-4 text-xs text-muted-foreground font-body">
          <div className="flex items-center gap-2">
            <Calendar className="size-3.5 text-steel opacity-60" />
            <span>
              Joined: <span className="font-mono text-foreground">{new Date(member.createdAt).toLocaleDateString()}</span>
            </span>
          </div>
          {isDeleted && (
            <div className="flex items-center gap-2 text-error/80">
              <Clock className="size-3.5 opacity-60" />
              <span>
                Removed: <span className="font-mono">{new Date(member.deletedAt!).toLocaleDateString()}</span>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Operations (Super Admin permissions required) */}
      {isSuperAdmin && !isSelf && (
        <div className="flex gap-2 pt-2 border-t border-border/30 mt-auto">
          {isDeleted ? (
            <Button
              variant="outline"
              onClick={() => onOpenReactivate(member.id, member.email, member.role)}
              className="w-full h-9 text-xs font-bold rounded-md bg-success/10 text-success border border-success/20 hover:bg-success hover:text-white cursor-pointer"
            >
              <RefreshCw className="size-3.5 mr-1.5 animate-spin-hover" /> Reactivate
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => onSwapRole(member.id, member.role)}
                className="flex-1 h-9 text-xs font-bold rounded-md border border-input text-foreground hover:bg-accent/50 cursor-pointer"
                disabled={isRolePending}
              >
                <ShieldCheck className="size-3.5 mr-1.5" />
                {member.role === "SUPER_ADMIN" ? "Demote" : "Promote"}
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={() => onOpenDeactivate(member.id, member.email)}
                className="h-9 w-9 rounded-md bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive hover:text-white cursor-pointer shrink-0"
                title="Deactivate Account"
              >
                <Trash2 className="size-4" />
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
