import {mainAxiosClient,getAxiosClient} from "./axiosClient";
import { ENDPOINTS } from "./endpoints";

export const profileApi = {
  create: (formData: FormData) =>
    mainAxiosClient.post(ENDPOINTS.USER_PROFILE.CREATE, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  update: (id: string, formData: FormData) =>
    mainAxiosClient.put(ENDPOINTS.USER_PROFILE.UPDATE(id), formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  delete: (id: string) => mainAxiosClient.delete(ENDPOINTS.USER_PROFILE.DELETE(id)),
};
