// api/purchaseApi.ts
import { getAxiosClient, mainAxiosClient } from "./axiosClient";
import { ENDPOINTS } from "./endpoints";
import { 
  SchemeListRequest, 
  SchemeListResponse,
  PurchaseUnitRequest,
  PurchaseUnitResponse 
} from "@/api/models/purchase.model";

export const purchaseApi = {
  // GET operations using getAxiosClient
  getInvestmentSchemes: (params: SchemeListRequest): Promise<SchemeListResponse> =>
    getAxiosClient.get(ENDPOINTS.SCHEMES.LIST_BY_PROJECT, { params })
      .then(response => response.data),

  // POST operations using mainAxiosClient
  purchaseUnit: (data: PurchaseUnitRequest): Promise<PurchaseUnitResponse> =>
    mainAxiosClient.post(ENDPOINTS.PURCHASE.CREATE, data),
};