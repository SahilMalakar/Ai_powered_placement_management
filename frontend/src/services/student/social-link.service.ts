import api from "@/services/api";
import { SocialLinkInput, UpdateSocialLinkInput, SocialLink } from "@/types/profile";

export const getSocialLinks = async (): Promise<SocialLink[]> => {
  return api.get("/students/profile/socialLink").then((r) => r.data.data);
};

export const addSocialLink = async (data: SocialLinkInput) => {
  return api.post("/students/profile/socialLink", data).then((r) => r.data.data);
};

export const updateSocialLink = async ({ id, data }: { id: number; data: UpdateSocialLinkInput }) => {
  return api.patch(`/students/profile/socialLink/${id}`, data).then((r) => r.data.data);
};

export const deleteSocialLink = async (id: number) => {
  return api.delete(`/students/profile/socialLink/${id}`).then((r) => r.data.data);
};
