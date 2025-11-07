// src/types/LegalAgreement.ts

export type AgreementType =
  | "mou"
  | "agreement_of_sale"
  | "sale_deed"
  | "rental_agreement"
  | "allotment_letter"
  | "possession_letter";

export type AgreementStatus =
  | "draft"
  | "executed"
  | "signed"
  | "pending_signature";

export interface LegalAgreement {
  id: string;
  unit_id: string | null;
  unit_number: string | null;
  agreement_type: AgreementType;
  document_name: string;
  file_path: string;
  signatories: string[];
  agreement_date: string; // ISO date string (e.g. "2025-10-27")
  valid_until: string; // ISO date string (e.g. "2026-10-27")
  status: AgreementStatus;
  uploaded_at: string; // full timestamp
}

export interface LegalAgreementsResponse {
  success: boolean;
  message: string;
  total: number;
  data: LegalAgreement[];
}

export interface LegalAgreementsRequest {
  page?: number; // e.g. 1
  limit?: number; // e.g. 10
  unit_id?: string; // optional filter
  agreement_type?: AgreementType; // optional filter
  status?: AgreementStatus; // optional filter
}