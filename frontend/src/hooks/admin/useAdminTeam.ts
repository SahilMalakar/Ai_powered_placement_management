import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminTeamService } from "@/services/admin/team.service";
import { toast } from "sonner";
import { QUERY_KEYS } from "@/constants/query-keys";
import { CreateAdminPayload, UpdateAdminRolePayload, ReactivateAdminPayload } from "@/types/admin/team";

export const ADMIN_TEAM_KEYS = {
  all: [QUERY_KEYS.ADMIN_TEAM] as const,
};

export const useAdminTeam = () => {
  return useQuery({
    queryKey: ADMIN_TEAM_KEYS.all,
    queryFn: () => adminTeamService.getAllTeamMembers(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useCreateAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateAdminPayload) => adminTeamService.createTeamMember(payload),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_TEAM_KEYS.all });
      toast.success(response.message || "Admin registered successfully.");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Failed to register admin.";
      toast.error(message);
    },
  });
};

export const useUpdateAdminRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateAdminRolePayload }) => 
      adminTeamService.updateTeamMemberRole(id, payload),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_TEAM_KEYS.all });
      toast.success(response.message || "Admin role updated successfully.");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Failed to update admin role.";
      toast.error(message);
    },
  });
};

export const useDeactivateAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => adminTeamService.deactivateTeamMember(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_TEAM_KEYS.all });
      toast.success(response.message || "Admin deactivated successfully.");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Failed to deactivate admin.";
      toast.error(message);
    },
  });
};

export const useReactivateAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ReactivateAdminPayload }) => 
      adminTeamService.reactivateTeamMember(id, payload),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_TEAM_KEYS.all });
      toast.success(response.message || "Admin reactivated successfully.");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Failed to reactivate admin.";
      toast.error(message);
    },
  });
};
