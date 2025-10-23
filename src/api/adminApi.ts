import axiosClient from "./axiosClient";
import { ENDPOINTS } from "./endpoints";

export const adminApi = {
  login: (data: { email: string; password: string }) =>
    axiosClient.post(ENDPOINTS.ADMIN.LOGIN, data),

  create: (data: { name: string; email: string; password: string }) =>
    axiosClient.post(ENDPOINTS.ADMIN.CREATE, data),

  update: (id: string, data: { name?: string; email?: string; password?: string }) =>
    axiosClient.put(ENDPOINTS.ADMIN.UPDATE(id), data),

  delete: (id: string) => axiosClient.delete(ENDPOINTS.ADMIN.DELETE(id)),

  list: () => axiosClient.get(ENDPOINTS.ADMIN.LIST),
};
