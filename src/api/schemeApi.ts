import { getAxiosClient } from "./axiosClient";
import { ENDPOINTS } from "./endpoints";
import { AxiosResponse } from "axios";
import { 
  InvestmentSchemeListRequest, 
  InvestmentSchemeListResponse,
  InvestmentSchemeResponse 
} from "@/api/models/schemeModels";

export const schemeApi = {
  // GET operations using getAxiosClient
  listByProject: (params: InvestmentSchemeListRequest): Promise<AxiosResponse<InvestmentSchemeListResponse>> =>
    getAxiosClient.get(ENDPOINTS.SCHEMES.LIST_BY_PROJECT, { params }),
};