/** --- Request Models --- */
export interface PurchaseUnitRequest {
  project_id: string;
  scheme_id: string;
  user_profile_id: string;
  is_joint_ownership: boolean;
  number_of_units: number;
  payment_amount: number;
}

export interface InvestmentSchemeRequest {
  project_id: string;
  page?: number;
  limit?: number;
}

/** --- Response Models --- */
export interface InvestmentSchemeResponse {
  status: "success" | "error";
  message: string;
  schemes?: Scheme[];
  total?: number;
  page?: number;
  limit?: number;
}

export interface PurchaseUnitResponse {
  status: "success" | "error";
  message: string;
  purchase_id?: string;
  transaction_id?: string;
  payment_status?: string;
}

export interface Scheme {
  id: string;
  project_id: string;
  scheme_type: "single_payment" | "installment";
  scheme_name: string;
  area_sqft: number;
  booking_advance: number;
  balance_payment_days: number | null;
  total_installments: number | null;
  monthly_installment_amount: number | null;
  rental_start_month: number | null;
  start_date: string;
  end_date: string | null;
}