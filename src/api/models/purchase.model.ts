export enum SchemeType {
  SINGLE_PAYMENT = "single_payment",
  INSTALLMENT = "installment",
}

export interface Scheme {
  id: string;
  project_id: string;
  scheme_type: SchemeType;
  scheme_name: string;
  area_sqft: number;
  booking_advance: number;
  balance_payment_days: number | null;
  total_installments: number | null;
  monthly_installment_amount: number | null;
  rental_start_month: number | null;
  start_date: string;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface SchemeListRequest {
  project_id: string;
  page?: number;
  limit?: number;
}

export interface SchemeListResponse {
  message: string;
  page: number;
  limit: number;
  total_pages: number;
  is_previous: boolean;
  is_next: boolean;
  total_schemes: number;
  total_investment_amount: number;
  schemes: Scheme[];
}

export interface PurchaseUnitRequest {
  project_id: string;
  scheme_id: string;
  is_joint_ownership: boolean;
  number_of_units: number;
  user_profile_id: string;
  payment_amount: number;
}

export interface PurchaseUnitResponse {
  message: string;
  purchase_id: string;
  payment_url?: string;
}

export type PurchaseStep = "plan-selection" | "user-info" | "kyc" | "payment" | "confirmation";

export interface PlanSelection {
  type: "single" | "installment";
  planId: string;
  area: number;
  price: number;
  monthlyAmount?: number;
  installments?: number;
  rentalStart?: string;
  monthlyRental: number;
  units: number;
  paymentAmount?: number;
}