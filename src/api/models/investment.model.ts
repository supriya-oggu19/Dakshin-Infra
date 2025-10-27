/** --- Portfolio Models --- */
export interface PortfolioResponse {
  portfolio: InvestmentUnit[];
}

export interface InvestmentUnit {
  unit_id: string;
  unit_number: string;
  total_investment: number;
  payment_status: "completed" | "pending" | "overdue";
  project: Project;
  scheme: Scheme;
}

export interface Project {
  project_id: string;
  project_name: string;
  location?: string;
}

export interface Scheme {
  scheme_id: string;
  scheme_name: string;
  monthly_installment_amount: number;
  duration_months?: number;
}

/** --- Payment Models --- */
export interface PaymentListResponse {
  payments: Payment[];
  total_payments: number;
  next_installment?: NextInstallment;
}

export interface Payment {
  payment_id: string;
  receipt_id: string;
  amount: number;
  payment_date: string;
  payment_status: "completed" | "pending" | "overdue";
  payment_method: string;
  transaction_type: "advance" | "installment" | "penalty" | "rebate";
  installment_number?: number;
  rebate_amount?: number;
  penalty_amount?: number;
  due_date?: string;
}

export interface NextInstallment {
  installment_number: number;
  due_date: string;
  amount: number;
  status: "pending" | "overdue";
}