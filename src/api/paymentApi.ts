import axiosClient from "./axiosClient";
import { ENDPOINTS } from "./endpoints";

export const paymentApi = {
  createOrder: (data: any) => axiosClient.post(ENDPOINTS.PAYMENTS.CREATE_ORDER, data),
};
