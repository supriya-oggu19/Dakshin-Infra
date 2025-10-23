import axiosClient from "./axiosClient";
import { ENDPOINTS } from "./endpoints";

export const profileApi = {
  create: (formData: FormData) =>
    axiosClient.post(ENDPOINTS.USER_PROFILE.CREATE, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  update: (id: string, formData: FormData) =>
    axiosClient.put(ENDPOINTS.USER_PROFILE.UPDATE(id), formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  delete: (id: string) => axiosClient.delete(ENDPOINTS.USER_PROFILE.DELETE(id)),
};
