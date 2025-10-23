import axiosClient from "./axiosClient";
import { ENDPOINTS } from "./endpoints";

export const agentApi = {
  create: (formData: FormData) =>
    axiosClient.post(ENDPOINTS.AGENTS.CREATE, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  updateStatus: (id: string, data: { status: string }) =>
    axiosClient.put(ENDPOINTS.AGENTS.UPDATE_STATUS(id), data),

  getById: (id: string) => axiosClient.get(ENDPOINTS.AGENTS.GET_BY_ID(id)),

  listAll: () => axiosClient.get(ENDPOINTS.AGENTS.LIST_ALL),
};
