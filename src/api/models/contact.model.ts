/** --- Request Models --- */
export interface ContactInquiryRequest {
  full_name: string;
  email: string;
  phone: string;
  message: string;
}

/** --- Response Models --- */
export interface ContactInquiryResponse {
  status: "success" | "error";
  message: string;
}