import {mainAxiosClient,getAxiosClient} from "./axiosClient";
import { ENDPOINTS } from "./endpoints";

export const purchasedUnitApi = {
  create: (data: any) => mainAxiosClient.post(ENDPOINTS.PURCHASED_UNITS.CREATE, data),
};
