// models/schemeModels.ts

export enum SchemeType {
  SINGLE_PAYMENT = "single_payment",
  INSTALLMENT = "installment",
}

export interface InvestmentSchemeData {
  id: string;
  project_id: string;
  scheme_type: SchemeType;
  scheme_name: string;
  area_sqft: number;
  base_price: number;
  
  // Booking advance for all scheme types
  booking_advance: number | null;
  
  // Single payment specific fields
  balance_payment_days: number | null;
  
  // Installment specific fields
  total_installments: number | null;
  monthly_installment_amount: number | null;
  monthly_rental_income: number | null;
  
  // Rental-specific fields (only for commercial properties)
  rental_start_month: number | null;
  
  // Date range for scheme availability
  start_date: string;
  end_date: string | null;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface InvestmentSchemeListRequest {
  project_id: string;
  page?: number;
  limit?: number;
}

export interface InvestmentSchemeListResponse {
  message: string;
  page: number;
  limit: number;
  total_pages: number;
  is_previous: boolean;
  is_next: boolean;
  total_schemes: number;
  schemes: InvestmentSchemeData[];
}

export interface InvestmentSchemeResponse {
  message: string;
  scheme: InvestmentSchemeData;
}