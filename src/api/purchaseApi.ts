import axiosClient from "./axiosClient";
import { ENDPOINTS } from "./endpoints";
import {
  PurchaseUnitRequest,
  PurchaseUnitResponse,
  InvestmentSchemeRequest,
  InvestmentSchemeResponse,
} from "./models/purchase.model";

export const purchaseApi = {
  // Get investment schemes for a project
  getInvestmentSchemes: (params: InvestmentSchemeRequest) =>
    axiosClient.get<InvestmentSchemeResponse>(ENDPOINTS.PURCHASE.INVESTMENT_SCHEMES, { params }),

  // Purchase units
  purchaseUnits: (data: PurchaseUnitRequest) =>
    axiosClient.post<PurchaseUnitResponse>(ENDPOINTS.PURCHASE.PURCHASE_UNITS, data),

  // Download agreement
  downloadAgreement: (projectId: string, schemeId: string) =>
    axiosClient.get(`/agreements/${projectId}/${schemeId}`, {
      responseType: 'blob'
    }),

  // Get project documents
  getProjectDocuments: (projectId: string) =>
    axiosClient.get(`/projects/${projectId}/documents`),
};