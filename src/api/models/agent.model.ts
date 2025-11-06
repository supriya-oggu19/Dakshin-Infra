// src/models/agent.model.ts

/** --- Request Models --- */
export interface CreateAgentRequest {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  pan_number: string;
  aadhar_number?: string | null;
  rera_id?: string | null;
  specialization?: string | null;
  about_text: string;
  commission_rate?: number | null;
}

/** --- Response Models --- */
export interface CreateAgentResponse {
  agent_id: string;
  message: string;
  first_name?: string;
  last_name?: string;
}

export interface Agent {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  pan_number: string;
  aadhar_number?: string;
  rera_id?: string;
  specialization?: string;
  about_text: string;
  commission_rate?: number;
  status: string;
  created_at: string;
}