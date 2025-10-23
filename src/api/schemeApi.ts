import axiosClient from "./axiosClient";
import { ENDPOINTS } from "./endpoints";

export const schemeApi = {
  create: (data: any) => axiosClient.post(ENDPOINTS.SCHEMES.CREATE, data),
  update: (id: string, data: any) => axiosClient.put(ENDPOINTS.SCHEMES.UPDATE(id), data),
};
