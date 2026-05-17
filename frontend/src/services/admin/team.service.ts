import api from "@/services/api";
import { 
  AdminTeamResponse, 
  CreateAdminPayload, 
  UpdateAdminRolePayload, 
  ReactivateAdminPayload 
} from "@/types/admin/team";

export const adminTeamService = {
  getAllTeamMembers: async (): Promise<AdminTeamResponse> => {
    const response = await api.get("/admin/team");
    return response.data;
  },

  createTeamMember: async (payload: CreateAdminPayload): Promise<any> => {
    const response = await api.post("/admin/team", payload);
    return response.data;
  },

  updateTeamMemberRole: async (id: number, payload: UpdateAdminRolePayload): Promise<any> => {
    const response = await api.patch(`/admin/team/${id}/role`, payload);
    return response.data;
  },

  deactivateTeamMember: async (id: number): Promise<any> => {
    const response = await api.delete(`/admin/team/${id}`);
    return response.data;
  },

  reactivateTeamMember: async (id: number, payload: ReactivateAdminPayload): Promise<any> => {
    const response = await api.post(`/admin/team/${id}/reactivate`, payload);
    return response.data;
  },
};
