import { useQuery } from "@tanstack/react-query";
import { adminDashboardService } from "@/services/admin/dashboard.service";
import { QUERY_KEYS } from "@/constants/query-keys";

export const ADMIN_DASHBOARD_KEYS = {
  stats: [QUERY_KEYS.ADMIN_DASHBOARD_STATS] as const,
};

export const useAdminDashboardStats = () => {
  return useQuery({
    queryKey: ADMIN_DASHBOARD_KEYS.stats,
    queryFn: () => adminDashboardService.getStats(),
    staleTime: 1000 * 60 * 2, // 2 minutes — matches backend cache TTL
    refetchOnWindowFocus: true,
  });
};
