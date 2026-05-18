"use client";

import { useState, useMemo } from "react";
import { 
  useAdminTeam, 
  useCreateAdmin, 
  useUpdateAdminRole, 
  useDeactivateAdmin, 
  useReactivateAdmin 
} from "@/hooks/admin/useAdminTeam";
import { useAppStore } from "@/store/useAppStore";
import { TeamStats } from "@/components/admin/team/TeamStats";
import { TeamFilters } from "@/components/admin/team/TeamFilters";
import { TeamMemberCard } from "@/components/admin/team/TeamMemberCard";
import { AddMemberDialog } from "@/components/admin/team/AddMemberDialog";
import { ReactivateMemberDialog } from "@/components/admin/team/ReactivateMemberDialog";
import { ConfirmDeactivateDialog } from "@/components/admin/team/ConfirmDeactivateDialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Shield, ShieldAlert, UserPlus, AlertTriangle } from "lucide-react";

export default function AdminTeamPage() {
  // Global auth user details
  const currentUser = useAppStore((state) => state.user);
  const isSuperAdmin = currentUser?.role === "SUPER_ADMIN";

  // Data fetching hook
  const { data, isLoading, isError, error } = useAdminTeam();

  // Mutations
  const createMutation = useCreateAdmin();
  const updateRoleMutation = useUpdateAdminRole();
  const deactivateMutation = useDeactivateAdmin();
  const reactivateMutation = useReactivateAdmin();

  // Filter and Toggle States
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | "ADMIN" | "SUPER_ADMIN">("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "DEACTIVATED">("ACTIVE");

  // Dialog States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isReactivateOpen, setIsReactivateOpen] = useState(false);
  const [isConfirmDeactivateOpen, setIsConfirmDeactivateOpen] = useState(false);

  // Focus Member details
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
  const [selectedMemberEmail, setSelectedMemberEmail] = useState("");
  const [selectedMemberRole, setSelectedMemberRole] = useState<"ADMIN" | "SUPER_ADMIN">("ADMIN");

  // Handlers
  const handleCreateSubmit = (values: any) => {
    createMutation.mutate(values, {
      onSuccess: () => {
        setIsAddOpen(false);
      },
    });
  };

  const handleOpenReactivate = (id: number, email: string, role: "ADMIN" | "SUPER_ADMIN") => {
    setSelectedMemberId(id);
    setSelectedMemberEmail(email);
    setSelectedMemberRole(role);
    setIsReactivateOpen(true);
  };

  const handleReactivateSubmit = (values: any) => {
    if (selectedMemberId === null) return;
    const payload = {
      role: values.role,
      password: values.password || undefined,
    };
    reactivateMutation.mutate(
      { id: selectedMemberId, payload },
      {
        onSuccess: () => {
          setIsReactivateOpen(false);
          setSelectedMemberId(null);
        },
      }
    );
  };

  const handleOpenDeactivate = (id: number, email: string) => {
    setSelectedMemberId(id);
    setSelectedMemberEmail(email);
    setIsConfirmDeactivateOpen(true);
  };

  const handleDeactivateConfirm = () => {
    if (selectedMemberId === null) return;
    deactivateMutation.mutate(selectedMemberId, {
      onSuccess: () => {
        setIsConfirmDeactivateOpen(false);
        setSelectedMemberId(null);
      },
    });
  };

  const handleSwapRole = (id: number, currentRole: "ADMIN" | "SUPER_ADMIN") => {
    const newRole = currentRole === "SUPER_ADMIN" ? "ADMIN" : "SUPER_ADMIN";
    updateRoleMutation.mutate({ id, payload: { role: newRole } });
  };

  // Filtered members list
  const filteredMembers = useMemo(() => {
    if (!data?.data) return [];
    return data.data.filter((member) => {
      const matchesSearch = member.email.toLowerCase().includes(search.toLowerCase());
      const matchesRole = roleFilter === "ALL" || member.role === roleFilter;
      
      const isActive = member.deletedAt === null;
      const matchesStatus = 
        statusFilter === "ALL" || 
        (statusFilter === "ACTIVE" && isActive) || 
        (statusFilter === "DEACTIVATED" && !isActive);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [data, search, roleFilter, statusFilter]);

  // Statistics calculation
  const stats = useMemo(() => {
    const defaultStats = { total: 0, activeSuper: 0, activeAdmin: 0, deactivated: 0 };
    if (!data?.data) return defaultStats;
    
    return data.data.reduce((acc, curr) => {
      acc.total += 1;
      if (curr.deletedAt !== null) {
        acc.deactivated += 1;
      } else if (curr.role === "SUPER_ADMIN") {
        acc.activeSuper += 1;
      } else {
        acc.activeAdmin += 1;
      }
      return acc;
    }, defaultStats);
  }, [data]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground flex items-center gap-3">
            <Shield className="size-8 text-primary animate-pulse" /> Team Directory
          </h1>
          <p className="text-muted-foreground mt-1">Assign roles, register new administrators, and manage administrative permissions.</p>
        </div>
        {isSuperAdmin && (
          <Button 
            onClick={() => setIsAddOpen(true)}
            className="h-10 bg-gradient-to-r from-brand-blue to-brand-indigo text-white shadow-button hover:opacity-90 font-semibold text-xs gap-2 rounded-md transition-all border-none cursor-pointer"
          >
            <UserPlus className="size-4" /> Add Team Member
          </Button>
        )}
      </div>

      {/* Statistics Cards */}
      <TeamStats isLoading={isLoading} stats={stats} />

      {/* Filters Toolbar */}
      <TeamFilters 
        search={search} 
        setSearch={setSearch} 
        roleFilter={roleFilter} 
        setRoleFilter={setRoleFilter} 
        statusFilter={statusFilter} 
        setStatusFilter={setStatusFilter} 
      />

      {/* Grid Team Members list */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-card rounded-xl border border-border/50 p-6 space-y-4 shadow-heavy">
              <div className="flex items-center gap-4">
                <Skeleton className="size-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <Skeleton className="h-6 w-full rounded-md" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-full rounded-md" />
                <Skeleton className="h-8 w-full rounded-md" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="py-12 text-center space-y-4 bg-error/5 rounded-xl border border-error/20 max-w-xl mx-auto">
          <AlertTriangle className="size-12 text-error mx-auto opacity-80" />
          <p className="text-error font-bold text-lg font-sans">Failed to load administrative team records</p>
          <p className="text-sm text-muted-foreground font-body">{(error as any)?.response?.data?.message || "Internal Server Error"}</p>
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="py-20 text-center space-y-4 bg-card rounded-xl border border-dashed border-border/60 shadow-heavy max-w-xl mx-auto">
          <div className="size-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="size-8 text-muted-foreground opacity-20" />
          </div>
          <p className="text-steel dark:text-muted-foreground font-bold text-xl font-sans">No team members found</p>
          <p className="text-sm text-mist max-w-xs mx-auto font-body">Try refining your search, changing the filter categories, or checking deactivated members.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map((member) => (
            <TeamMemberCard 
              key={member.id}
              member={member}
              isSuperAdmin={isSuperAdmin}
              isSelf={currentUser?.id === member.id}
              onSwapRole={handleSwapRole}
              onOpenReactivate={handleOpenReactivate}
              onOpenDeactivate={handleOpenDeactivate}
              isRolePending={updateRoleMutation.isPending}
            />
          ))}
        </div>
      )}

      {/* dialog 1: Add Administrator */}
      <AddMemberDialog 
        isOpen={isAddOpen}
        onOpenChange={setIsAddOpen}
        onSubmit={handleCreateSubmit}
        isPending={createMutation.isPending}
      />

      {/* dialog 2: Reactivate Administrator */}
      <ReactivateMemberDialog 
        isOpen={isReactivateOpen}
        onOpenChange={setIsReactivateOpen}
        onSubmit={handleReactivateSubmit}
        isPending={reactivateMutation.isPending}
        memberEmail={selectedMemberEmail}
        memberRole={selectedMemberRole}
      />

      {/* dialog 3: Confirm Deactivation */}
      <ConfirmDeactivateDialog 
        isOpen={isConfirmDeactivateOpen}
        onOpenChange={setIsConfirmDeactivateOpen}
        onConfirm={handleDeactivateConfirm}
        isPending={deactivateMutation.isPending}
        memberEmail={selectedMemberEmail}
      />

    </div>
  );
}
