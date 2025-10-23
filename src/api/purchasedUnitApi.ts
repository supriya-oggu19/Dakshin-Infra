import axiosClient from "./axiosClient";
import { ENDPOINTS } from "./endpoints";

export const purchasedUnitApi = {
  create: (data: any) => axiosClient.post(ENDPOINTS.PURCHASED_UNITS.CREATE, data),
};
