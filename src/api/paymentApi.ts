// src/api/paymentApi.ts
import { mainAxiosClient } from "./axiosClient";
import { ENDPOINTS } from "./endpoints";

export const paymentApi = {
  // Create order for new unit purchase
  createOrder: (data: any) => mainAxiosClient.post(ENDPOINTS.PAYMENTS.CREATE_ORDER, data),
  
  // Make payment for existing unit
  makePayment: (data: {
    unit_number: string;
    order_amount: number;
    order_currency: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    payment_methods: string;
  }) => mainAxiosClient.post(ENDPOINTS.PAYMENTS.MAKE_PAYMENT, data),
  
  // Get customer info for a unit
  getCustomerInfo: (unitNumber: string) => 
    mainAxiosClient.get(`${ENDPOINTS.PAYMENTS.CUSTOMER_INFO}/${unitNumber}`),
  
  // Verify order status
  verifyOrder: (orderId: string) => 
    mainAxiosClient.get(`${ENDPOINTS.PAYMENTS.VERIFY_ORDER}/${orderId}`),
  
  // Get payment list for a unit
  getPaymentList: (unitNumber: string) => 
    mainAxiosClient.get(`${ENDPOINTS.PAYMENTS.LIST}?unit_number=${unitNumber}`),
};