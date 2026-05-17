import api from "@/services/api";
import { StudentAnnouncementsResponse } from "@/types/student/announcement";

/**
 * Service to fetch active, targeted broadcasts assigned to the authenticated student.
 */
export const getStudentAnnouncements = async (params: {
  page: number;
  limit: number;
}): Promise<StudentAnnouncementsResponse> => {
  return api
    .get("/students/announcements", { params })
    .then((res) => res.data);
};
