import api from "@/services/api";
import { AdditionalDetailInput, UpdateAdditionalDetailInput, AdditionalDetail } from "@/types/profile";

export const getAdditionalDetails = async (): Promise<AdditionalDetail[]> => {
  return api.get("/students/additionals").then((r) => r.data.data);
};

export const addAdditionalDetail = async (data: AdditionalDetailInput) => {
  return api.post("/students/additionals", data).then((r) => r.data.data);
};

export const updateAdditionalDetail = async ({ id, data }: { id: number; data: UpdateAdditionalDetailInput }) => {
  return api.patch(`/students/additionals/${id}`, data).then((r) => r.data.data);
};

export const deleteAdditionalDetail = async (id: number) => {
  return api.delete(`/students/additionals/${id}`).then((r) => r.data.data);
};
