import api from "@/services/api";
import { 
  AdminStudentsResponse, 
  GetAllStudentsQueryInput, 
  SingleStudentResponse 
} from "@/types/admin/student";

export const adminStudentService = {
  getAllStudents: async (params: GetAllStudentsQueryInput): Promise<AdminStudentsResponse> => {
    const response = await api.get("/admin/students", { params });
    return response.data;
  },

  getStudentById: async (id: number): Promise<SingleStudentResponse> => {
    const response = await api.get(`/admin/students/${id}`);
    return response.data;
  },

  softDeleteStudent: async (id: number): Promise<SingleStudentResponse> => {
    const response = await api.delete(`/admin/students/${id}`);
    return response.data;
  },
};
