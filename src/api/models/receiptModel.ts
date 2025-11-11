export interface ReceiptData {
  receipt_id: string;
  receipt_date: string; // YYYY-MM-DD format
  customer_info: {
    name: string;
    email: string;
    phone: string;
  };
  property: {
    investor_id: string;
    transaction_type: string;
    installment_number: number | null;
  };
  financials: {
    amount: number;
    platform_fees: {
      total_fees: number;
      service_tax: number;
      service_charge: number;
    };
    rebate_amount: number;
    penalty_amount: number;
    is_early_payment: boolean;
    is_late_payment: boolean;
  };
  payment_method: {
    mode: 'upi' | 'card' | 'net_banking' | string;
    group: string;
    details: {
      card_number?: string;
      card_network?: string;
      card_bank_name?: string;
      upi_id?: string;
      netbanking_bank_name?: string;
    };
    payment_time: string;
  };
  references: {
    payment_id: string;
    bank_reference: string;
  };
}