import {getAxiosClient} from "./axiosClient";
import { ENDPOINTS } from "./endpoints";
import { AxiosResponse } from "axios";
import {LegalAgreementsRequest,LegalAgreementsResponse} from "@/api/models/legalAgreement.model"

export const legalAgreementApi = {
  list: (params?: LegalAgreementsRequest): Promise<AxiosResponse<LegalAgreementsResponse>> => 
    getAxiosClient.get(ENDPOINTS.AGREEMENTS.FETCH_ALL),
};