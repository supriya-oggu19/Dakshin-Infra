/** --- Request Models --- */
// No specific request models needed for GET requests

/** --- Response Models --- */
export interface PortfolioResponse {
  data: PortfolioItem[];
  portfolio: PortfolioItem[];
}

export interface InvestmentSummaryResponse {
  total_units: number;
  total_invested: number;
  total_paid: number;
  total_balance: number;
}

export interface PortfolioItem {
  unit_id: string;
  unit_number: string;
  total_investment: number;
  user_paid: number;
  balance_amount: number;
  payment_status: "none" | "advance_paid" | "partially_paid" | "fully_paid";
  unit_status: "none" | "active" | "inactive";
  purchase_date: string;
  total_area_sqft: number;
  monthly_rental: number;
  rental_start_date: string;
  project: Project;
  scheme: Scheme;
}

export interface Project {
  project_name: string;
  project_code: string;
  floor_number: number;
}

export interface Scheme {
  scheme_name: string;
  scheme_type: "single_payment" | "installment";
  booking_advance: number;
  total_installments?: number;
  monthly_installment_amount?: number;
}