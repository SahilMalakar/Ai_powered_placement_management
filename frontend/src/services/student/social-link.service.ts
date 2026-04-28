import api from "@/services/api";
import { SocialLinkInput, UpdateSocialLinkInput, SocialLink } from "@/types/profile";

export const getSocialLinks = async (): Promise<SocialLink[]> => {
  return api.get("/students/links").then((r) => r.data.data);
};

export const addSocialLink = async (data: SocialLinkInput) => {
  return api.post("/students/links", data).then((r) => r.data.data);
};

export const updateSocialLink = async ({ id, data }: { id: number; data: UpdateSocialLinkInput }) => {
  return api.patch(`/students/links/${id}`, data).then((r) => r.data.data);
};

export const deleteSocialLink = async (id: number) => {
  return api.delete(`/students/links/${id}`).then((r) => r.data.data);
};
