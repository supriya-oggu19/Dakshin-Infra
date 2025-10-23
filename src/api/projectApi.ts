import axiosClient from "./axiosClient";
import { ENDPOINTS } from "./endpoints";

export const projectApi = {
  create: (formData: FormData) =>
    axiosClient.post(ENDPOINTS.PROJECTS.CREATE, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  update: (id: string, formData: FormData) =>
    axiosClient.put(ENDPOINTS.PROJECTS.UPDATE(id), formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  delete: (id: string) => axiosClient.delete(ENDPOINTS.PROJECTS.DELETE(id)),
};
