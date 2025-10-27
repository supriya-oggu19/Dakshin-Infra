import { getAxiosClient } from "./axiosClient";
import { ENDPOINTS } from "./endpoints";
import { PaymentListResponse } from "./models/investment.model";

export const investmentApi = {
  getPayments: (unitNumber: string, token: string) =>
    getAxiosClient.get<PaymentListResponse>(ENDPOINTS.PAYMENTS.LIST, {
      params: { unit_number: unitNumber },
      headers: { Authorization: `Bearer ${token}` },
    }),
};
