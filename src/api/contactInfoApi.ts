import { mainAxiosClient ,getAxiosClient } from "./axiosClient";
import { ENDPOINTS } from "./endpoints";
import { ContactInfo } from "./models/contactInfo.model";

export const contactInfoApi = {
  getAll: () => getAxiosClient.get<ContactInfo[]>(ENDPOINTS.CONTACT_INFO.ALL),
};