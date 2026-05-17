export interface AdminTeamMember {
  id: number;
  email: string;
  role: 'ADMIN' | 'SUPER_ADMIN';
  createdAt: string;
  deletedAt: string | null;
}

export interface AdminTeamResponse {
  success: boolean;
  message: string;
  data: AdminTeamMember[];
}

export interface CreateAdminPayload {
  email: string;
  password?: string;
  role: 'ADMIN' | 'SUPER_ADMIN';
}

export interface ReactivateAdminPayload {
  password?: string;
  role?: 'ADMIN' | 'SUPER_ADMIN';
}

export interface UpdateAdminRolePayload {
  role: 'ADMIN' | 'SUPER_ADMIN';
}
