import { AxiosResponse } from "axios";
import { mainAxiosClient, getAxiosClient } from "./axiosClient";
import { ENDPOINTS } from "./endpoints";
import { 
  ListProjectsRequest, 
  ListProjectResponse,
  ProjectResponse 
} from "./models/projectModels";

export const projectApi = {
  list: (params?: ListProjectsRequest) =>
    getAxiosClient.get(ENDPOINTS.PROJECTS.LIST, {
      params,
      cache: {
        ttl: 1000 * 60 * 10, // 10 minutes cache
      },
    }),

  getById: (id: string) =>
    getAxiosClient.get(ENDPOINTS.PROJECTS.GET_BY_ID(id), {
      cache: {
        ttl: 1000 * 60 * 10, // 10 minutes cache
      },
    }),
};