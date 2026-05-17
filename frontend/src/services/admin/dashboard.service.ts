import type { DashboardStatsResponse } from "@/types/admin/dashboard";
import api from "@/services/api";

export const adminDashboardService = {
  getStats: async (): Promise<DashboardStatsResponse> => {
    const response = await api.get("/admin/dashboard/stats");
    return response.data;
  },
};
