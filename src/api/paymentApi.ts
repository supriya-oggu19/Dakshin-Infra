// src/api/paymentApi.ts
import { mainAxiosClient ,getAxiosClient } from "./axiosClient"; // FIX: Use mainAxiosClient
import { ENDPOINTS } from "./endpoints";

export const paymentApi = {
  createOrder: (data: any) => mainAxiosClient.post(ENDPOINTS.PAYMENTS.CREATE_ORDER, data), // FIX: Use mainAxiosClient
};