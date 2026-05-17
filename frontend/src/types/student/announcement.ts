export interface StudentAnnouncement {
  id: number;
  message: string;
  link: string | null;
  branches: string[];
  status: string;
  createdAt: string;
  createdBy: {
    id: number;
    email: string;
    profile: {
      fullName: string;
    } | null;
  };
}

export interface StudentAnnouncementsResponse {
  success: boolean;
  message: string;
  data: {
    messages: StudentAnnouncement[];
    pagination: {
      totalCount: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}
