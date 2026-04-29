import api from "@/services/api";
import { AdditionalDetailInput, UpdateAdditionalDetailInput, AdditionalDetail } from "@/types/profile";

export const getAdditionalDetails = async (): Promise<AdditionalDetail[]> => {
  return api.get("/students/profile/additionalDetail").then((r) => r.data.data);
};

export const addAdditionalDetail = async (data: AdditionalDetailInput) => {
  return api.post("/students/profile/additionalDetail", data).then((r) => r.data.data);
};

export const updateAdditionalDetail = async ({ id, data }: { id: number; data: UpdateAdditionalDetailInput }) => {
  return api.patch(`/students/profile/additionalDetail/${id}`, data).then((r) => r.data.data);
};

export const deleteAdditionalDetail = async (id: number) => {
  return api.delete(`/students/profile/additionalDetail/${id}`).then((r) => r.data.data);
};