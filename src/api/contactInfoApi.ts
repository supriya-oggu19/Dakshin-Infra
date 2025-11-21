import { mainAxiosClient ,getAxiosClient } from "./axiosClient";
import { ENDPOINTS } from "./endpoints";
import { ContactInfo } from "./models/contactInfo.model";

export const contactInfoApi = {
  getAll: () => getAxiosClient.get<ContactInfo[]>(ENDPOINTS.CONTACT_INFO.ALL, {
    cache: {
      ttl: 1000 * 60 * 10, // 10 minutes cache
    },
  }),
};