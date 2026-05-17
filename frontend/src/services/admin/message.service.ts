import api from "@/services/api";
import {
  AdminMessagesHistoryResponse,
  CreateAdminMessageInput,
  GetAdminMessagesHistoryQueryInput,
  SendMessageResponse,
} from "@/types/admin/message";

export const adminMessageService = {
  getMessagesHistory: async (
    params: GetAdminMessagesHistoryQueryInput
  ): Promise<AdminMessagesHistoryResponse> => {
    const response = await api.get("/admin/messages", { params });
    return response.data;
  },

  sendMessage: async (
    payload: CreateAdminMessageInput
  ): Promise<SendMessageResponse> => {
    const response = await api.post("/admin/messages", payload);
    return response.data;
  },
};
