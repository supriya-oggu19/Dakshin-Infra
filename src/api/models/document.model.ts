/** --- Request Models --- */
export interface VerifyPanRequest {
  pan_number: string;
  full_name: string;
}

export interface VerifyAadhaarRequest {
  verification_id: string;
  image: File;
}

export interface VerifyGSTINRequest {
  GSTIN: string;
  business_name: string;
}

export interface VerifyPassportRequest {
  verification_id: string;
  file_number: string;
  dob: string;
  name: string;
}

/** --- Response Models --- */
export interface DocumentVerificationResponse {
  status: "VALID" | "INVALID" | "ERROR";
  message?: string;
  detail?: string;
  valid?: boolean;
}

export interface PanVerificationResponse {
  detail: string;
  status?: string;
}

export interface AadhaarVerificationResponse {
  status: "VALID" | "INVALID" | "ERROR";
  message?: string;
}

export interface GSTINVerificationResponse {
  valid: boolean;
  message?: string;
  detail?: string;
}

export interface PassportVerificationResponse {
  status: "VALID" | "INVALID" | "ERROR";
  message?: string;
  detail?: string;
}