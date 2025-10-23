import axiosClient from "./axiosClient";
import { ENDPOINTS } from "./endpoints";

export const contactApi = {
  add: (data: any) => axiosClient.post(ENDPOINTS.CONTACT_INFO.ADD, data),
  update: (id: string, data: any) => axiosClient.put(ENDPOINTS.CONTACT_INFO.UPDATE(id), data),
  delete: (id: string) => axiosClient.delete(ENDPOINTS.CONTACT_INFO.DELETE(id)),
};
