import {mainAxiosClient,getAxiosClient} from "./axiosClient";
import { ENDPOINTS } from "./endpoints";

export const adminApi = {
  login: (data: { email: string; password: string }) =>
    mainAxiosClient.post(ENDPOINTS.ADMIN.LOGIN, data),

  create: (data: { name: string; email: string; password: string }) =>
    mainAxiosClient.post(ENDPOINTS.ADMIN.CREATE, data),

  update: (id: string, data: { name?: string; email?: string; password?: string }) =>
    mainAxiosClient.put(ENDPOINTS.ADMIN.UPDATE(id), data),

  delete: (id: string) => mainAxiosClient.delete(ENDPOINTS.ADMIN.DELETE(id)),

  list: () => getAxiosClient.get(ENDPOINTS.ADMIN.LIST),
};
