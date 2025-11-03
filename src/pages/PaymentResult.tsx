import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CheckCircle, XCircle, Clock } from "lucide-react";

interface PaymentResponse {
  order_info?: {
    cf_order_id?: string;
    order_id?: string;
    order_status?: string;
    order_amount?: number;
  };
  customer_info?: {
    customer_id?: string;
    customer_name?: string;
    customer_email?: string;
    customer_phone?: string;
    customer_uid?: string | null;
  };
  transaction_info?: {
    cf_payment_id?: string;
    payment_status?: string;
    payment_method?: string;
    payment_amount?: number;
    bank_reference?: string;
    payment_time?: string;
    payment_message?: string;
  };
}

export default function PaymentResult(): JSX.Element {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PaymentResponse | null>(null);
  const orderId = searchParams.get("order_id");

  useEffect(() => {
    async function verifyPayment() {
      if (!orderId) return;
      try {
        const response = await fetch(
          `https://backend-api.ramyaconstructions.com/api/payments/verify-order/${orderId}`
        );

        if (!response.ok) throw new Error("Failed to verify payment");

        const result: PaymentResponse = await response.json();
        setData(result);
      } catch (error) {
        console.error("Payment verification failed:", error);
        setData(null);
      } finally {
        setLoading(false);
      }
    }

    verifyPayment();
  }, [orderId]);

  const getStatusIcon = (status?: string): JSX.Element => {
    switch (status?.toUpperCase()) {
      case "PAID":
      case "SUCCESS":
        return <CheckCircle className="text-green-600 w-14 h-14" />;
      case "FAILED":
      case "CANCELLED":
        return <XCircle className="text-red-600 w-14 h-14" />;
      default:
        return <Clock className="text-yellow-500 w-14 h-14" />;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <p className="text-gray-500 text-lg">Verifying your payment...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <XCircle className="text-red-600 w-14 h-14 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Payment Verification Failed</h2>
        <p className="text-gray-600 mb-6">
          We couldn’t verify your payment. Please try again later.
        </p>
        <a
          href="/projects"
          className="px-6 py-2 rounded-lg bg-gray-500 hover:bg-gray-600 text-white font-medium"
        >
          Go Back
        </a>
      </div>
    );
  }

  const orderStatus = data?.order_info?.order_status?.toUpperCase() || "UNKNOWN";
  const isSuccess = orderStatus === "PAID" || data?.transaction_info?.payment_status === "SUCCESS";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md text-center">
        <div className="mb-4">{getStatusIcon(orderStatus)}</div>

        <h2 className="text-2xl font-semibold mb-2">
          {isSuccess ? "Payment Successful" : `Payment Status: ${orderStatus}`}
        </h2>

        <p className="text-gray-600 mb-6">
          {isSuccess
            ? "Thank you for your payment!"
            : "We couldn’t confirm your payment."}
        </p>

        {/* ✅ ORDER DETAILS */}
        <div className="border-t border-gray-200 pt-4 text-left text-sm space-y-1">
          <h3 className="font-semibold text-gray-800 mb-2">Order Details</h3>
          <p><strong>Unit Number:</strong> {data?.order_info?.order_id || "N/A"}</p>
          <p><strong>CF Order ID:</strong> {data?.order_info?.cf_order_id || "N/A"}</p>
          <p><strong>Amount:</strong> ₹{data?.order_info?.order_amount ?? "N/A"}</p>
          <p><strong>Status:</strong> {data?.order_info?.order_status || "N/A"}</p>
        </div>

        {/* ✅ CUSTOMER DETAILS */}
        <div className="border-t border-gray-200 pt-4 mt-4 text-left text-sm space-y-1">
          <h3 className="font-semibold text-gray-800 mb-2">Customer Details</h3>
          <p><strong>Name:</strong> {data?.customer_info?.customer_name || "N/A"}</p>
          <p><strong>Email:</strong> {data?.customer_info?.customer_email || "N/A"}</p>
          <p><strong>Phone:</strong> {data?.customer_info?.customer_phone || "N/A"}</p>
        </div>

        {/* ✅ TRANSACTION DETAILS */}
        <div className="border-t border-gray-200 pt-4 mt-4 text-left text-sm space-y-1">
          <h3 className="font-semibold text-gray-800 mb-2">Transaction Details</h3>
          <p><strong>Payment ID:</strong> {data?.transaction_info?.cf_payment_id || "N/A"}</p>
          <p><strong>Payment Method:</strong> {data?.transaction_info?.payment_method || "N/A"}</p>
          {/* <p><strong>Bank Reference:</strong> {data?.transaction_info?.bank_reference || "N/A"}</p> */}
          <p><strong>Payment Time:</strong>{" "}
            {data?.transaction_info?.payment_time
              ? new Date(data.transaction_info.payment_time).toLocaleString()
              : "N/A"}
          </p>
          {/* <p><strong>Message:</strong> {data?.transaction_info?.payment_message || "N/A"}</p> */}
        </div>

        <div className="mt-8">
          <a
            href={isSuccess ? "/my-units" : "/my-units"}
            className={`inline-block px-6 py-2 rounded-lg text-white font-medium ${
              isSuccess
                ? "bg-green-600 hover:bg-green-700"
                : "bg-gray-500 hover:bg-gray-600"
            }`}
          >
            {isSuccess ? "Go to Portfolio" : "Try Again"}
          </a>
        </div>
      </div>
    </div>
  );
}
