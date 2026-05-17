import { z } from "zod";

export const BranchEnum = [
  "CSE", "ETE", "EE", "ME", "IE", "CE", "CHE", "IPE", "MCA"
] as const;

export type Branch = typeof BranchEnum[number];

export type NotificationStatus = "QUEUED" | "COMPLETED" | "FAILED";

export interface NotificationMessage {
  id: number;
  message: string;
  link: string | null;
  branches: Branch[];
  status: NotificationStatus;
  createdAt: string;
  updatedAt: string;
  createdById: number;
  createdBy: {
    id: number;
    email: string;
    profile: {
      fullName: string;
    } | null;
  };
}

export interface AdminMessagesHistoryResponse {
  success: boolean;
  message: string;
  data: {
    messages: NotificationMessage[];
    pagination: {
      totalCount: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export interface SendMessageResponse {
  success: boolean;
  message: string;
  data: {
    message: NotificationMessage;
    recipientCount: number;
  };
}

// Zod schema matching backend exactly
export const createAdminMessageSchema = z.object({
  message: z.string().min(10, "Message must be at least 10 characters long"),
  link: z.string().optional().transform((val) => {
    if (!val) return undefined;
    const trimmed = val.trim();
    if (trimmed === "") return undefined;
    
    // If the URL doesn't have a protocol, prepend https://
    if (!/^https?:\/\//i.test(trimmed)) {
      return `https://${trimmed}`;
    }
    return trimmed;
  }),
  branches: z.array(z.enum(BranchEnum)).min(1, "At least one branch must be selected"),
});

export type CreateAdminMessageInput = z.infer<typeof createAdminMessageSchema>;

export const getAdminMessagesHistoryQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export type GetAdminMessagesHistoryQueryInput = z.infer<typeof getAdminMessagesHistoryQuerySchema>;
