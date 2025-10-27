import {mainAxiosClient} from "./axiosClient";
import { ENDPOINTS } from "./endpoints";

export const paymentApi = {
  createOrder: (data: any) => mainAxiosClient.post(ENDPOINTS.PAYMENTS.CREATE_ORDER, data),
};