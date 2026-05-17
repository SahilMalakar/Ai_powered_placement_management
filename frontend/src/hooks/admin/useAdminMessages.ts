import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminMessageService } from "@/services/admin/message.service";
import { QUERY_KEYS } from "@/constants/query-keys";
import { toast } from "sonner";
import {
  CreateAdminMessageInput,
  GetAdminMessagesHistoryQueryInput,
} from "@/types/admin/message";

export const ADMIN_MESSAGE_KEYS = {
  all: [QUERY_KEYS.ADMIN_MESSAGES] as const,
  list: (params: GetAdminMessagesHistoryQueryInput) =>
    [QUERY_KEYS.ADMIN_MESSAGES, "list", params] as const,
};

export const useAdminMessagesHistory = (
  params: GetAdminMessagesHistoryQueryInput
) => {
  return useQuery({
    queryKey: ADMIN_MESSAGE_KEYS.list(params),
    queryFn: () => adminMessageService.getMessagesHistory(params),
    staleTime: 1000 * 60, // 1 minute
  });
};

export const useSendAdminMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateAdminMessageInput) =>
      adminMessageService.sendMessage(payload),
    onSuccess: (response) => {
      // Invalidate message history queries
      queryClient.invalidateQueries({
        queryKey: ADMIN_MESSAGE_KEYS.all,
      });
      toast.success(response.message || "Announcement broadcasted successfully.");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Failed to broadcast announcement.";
      toast.error(message);
    },
  });
};
