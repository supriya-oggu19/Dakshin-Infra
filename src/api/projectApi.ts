import { AxiosResponse } from "axios";
import { mainAxiosClient, getAxiosClient } from "./axiosClient";
import { ENDPOINTS } from "./endpoints";
import { 
  ListProjectsRequest, 
  ListProjectResponse,
  ProjectResponse 
} from "./models/projectModels";

export const projectApi = {
  // GET operations using getAxiosClient
  list: (params?: ListProjectsRequest): Promise<AxiosResponse<ListProjectResponse>> =>
    getAxiosClient.get(ENDPOINTS.PROJECTS.LIST, { params }),

  getById: (id: string): Promise<AxiosResponse<ProjectResponse>> =>
    getAxiosClient.get(ENDPOINTS.PROJECTS.GET_BY_ID(id)),

};