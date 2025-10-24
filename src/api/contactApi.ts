import { mainAxiosClient } from "./axiosClient";
import { ENDPOINTS } from "./endpoints";
import {
  ContactInquiryRequest,
  ContactInquiryResponse,
} from "./models/contact.model";

export const contactApi = {
  createInquiry: (data: ContactInquiryRequest) =>
    mainAxiosClient.post<ContactInquiryResponse>(ENDPOINTS.CONTACT.CREATE, data),
};