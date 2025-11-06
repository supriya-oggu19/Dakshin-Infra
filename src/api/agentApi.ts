// src/api/agentApi.ts
import { mainAxiosClient } from "./axiosClient";
import { ENDPOINTS } from "./endpoints";
import {
  CreateAgentRequest,
  CreateAgentResponse,
  Agent,
} from "./models/agent.model";

/** API for Agent Operations */
export const agentApi = {
  /** Create a new agent with form data (multipart) */
  create: (formData: FormData) =>
    mainAxiosClient.post<CreateAgentResponse>(ENDPOINTS.AGENTS.CREATE, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  /** Update agent status (e.g., approved, rejected) */
  updateStatus: (id: string, data: { status: string }) =>
    mainAxiosClient.put(ENDPOINTS.AGENTS.UPDATE_STATUS(id), data),

  /** Get agent by ID */
  getById: (id: string) =>
    mainAxiosClient.get<Agent>(ENDPOINTS.AGENTS.GET_BY_ID(id)),

  /** List all agents */
  listAll: () =>
    mainAxiosClient.get<Agent[]>(ENDPOINTS.AGENTS.LIST_ALL),
};