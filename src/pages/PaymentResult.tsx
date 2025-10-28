import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CheckCircle, XCircle, Clock } from "lucide-react";

interface PaymentDetails {
  order_id?: string;
  status?: string;
  amount?: number;
  cf_order_id?: string;
  cf_payment_id?: string;
  payment_status?: string;
  payment_method?: string;
  message?: string;
}

export default function PaymentResult(): JSX.Element {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState<boolean>(true);
  const [result, setResult] = useState<PaymentDetails | null>(null);
  const orderId = searchParams.get("order_id");

  useEffect(() => {
    async function verifyPayment() {
      if (!orderId) return;
      try {
        const response = await fetch(
          `http://localhost:8000/api/payments/verify-order/${orderId}`
        );

        if (!response.ok) {
          throw new Error("Failed to verify payment");
        }

        const data: PaymentDetails = await response.json();
        setResult(data);
      } catch (error) {
        console.error("Payment verification failed:", error);
        setResult({ status: "FAILED", message: "Verification failed" });
      } finally {
        setLoading(false);
      }
    }

    verifyPayment();
  }, [orderId]);

  const getStatusIcon = (status?: string): JSX.Element => {
    switch (status?.toUpperCase()) {
      case "PAID":
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

  const status = result?.status?.toUpperCase() || "UNKNOWN";
  const isSuccess = status === "PAID";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md text-center">
        <div className="mb-4">{getStatusIcon(status)}</div>

        <h2 className="text-2xl font-semibold mb-2">
          {isSuccess ? "Payment Successful" : `Payment Status: ${status}`}
        </h2>

        <p className="text-gray-600 mb-6">
          {isSuccess ? "Thank you for your payment!" : "We couldn’t confirm your payment."}
        </p>

        <div className="border-t border-gray-200 pt-4 text-left text-sm space-y-1">
          <p><strong>Order ID:</strong> {result?.order_id || "N/A"}</p>
          <p><strong>Amount:</strong> ₹{result?.amount ?? "N/A"}</p>
          <p><strong>Transaction ID:</strong> {result?.cf_payment_id || "N/A"}</p>
          <p><strong>Payment Method:</strong> {result?.payment_method || "N/A"}</p>
        </div>

        <div className="mt-8">
          <a
            href={isSuccess ? "/dashboard" : "/projects"}
            className={`inline-block px-6 py-2 rounded-lg text-white font-medium ${
              isSuccess
                ? "bg-green-600 hover:bg-green-700"
                : "bg-gray-500 hover:bg-gray-600"
            }`}
          >
            {isSuccess ? "Go to Dashboard" : "Try Again"}
          </a>
        </div>
      </div>
    </div>
  );
}
