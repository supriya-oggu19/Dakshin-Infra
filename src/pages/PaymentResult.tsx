import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate  } from "react-router-dom";
import { CheckCircle, XCircle, Clock, Download, Copy, Home, Receipt, Building, AlertCircle } from "lucide-react";
import { paymentApi } from "@/api/paymentApi";
import { useToast } from "@/hooks/use-toast";
import { pdf } from '@react-pdf/renderer';
import ReceiptDocument from '../forms/ReceiptDocument';
import { clearPurchaseAndBillingSession } from "@/utils/clearPurchaseBilling";

interface PaymentDetails {
  order_info?: {
    cf_order_id: string;
    unit_number: string;
    order_status: string;
    order_amount: number;
  };
  customer_info?: {
    customer_id: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
  };
  transaction_info?: {
    cf_payment_id: string;
    payment_status: string;
    payment_method: string | null;
    payment_amount: number;
    bank_reference: string;
    payment_time: string;
    payment_message: string;
  };
  project_details?: {
    project_title: string;
    scheme_name: string;
  };
}

export default function PaymentResult(): JSX.Element {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState<boolean>(true);
  const [result, setResult] = useState<PaymentDetails | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const orderId = searchParams.get("order_id");
  const navigate = useNavigate();

  const handleNavigation = () => {
    if (isSuccess) {
      sessionStorage.setItem("blockBackOnSIP", "1");

      sessionStorage.removeItem('currentProjectId');
      clearPurchaseAndBillingSession();
      
      navigate(`/sip?unit=${result?.order_info?.unit_number}`, { replace: true });
    } else {
      // Extract project ID from order data or use a different method
      const projectId = sessionStorage.getItem('currentProjectId') ||
        new URLSearchParams(window.location.search).get('project_id');
      
      if (projectId) {
        navigate(`/purchase/${projectId}/payment`);
      } else {
        navigate(`/sip?unit=${result?.order_info?.unit_number}`);
      }
    }
  };

  useEffect(() => {
    async function verifyPayment() {
      if (!orderId) return;
      try {
        const response = await paymentApi.verifyOrder(orderId);
        setResult(response.data);
      } catch (error) {
        console.error("Payment verification failed:", error);
        setResult({
          order_info: {
            unit_number: orderId,
            order_status: "FAILED",
            order_amount: 0,
            cf_order_id: "",
          },
          transaction_info: {
            payment_status: "FAILED",
            payment_message: "Verification failed",
            payment_method: null,
            payment_amount: 0,
            bank_reference: "",
            payment_time: "",
            cf_payment_id: "",
          },
        });
      } finally {
        setLoading(false);
      }
    }

    verifyPayment();
  }, [orderId]);

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const formatOnlyDate = (dateString: string): string => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "Asia/Kolkata",
    });
  };

  const formatOnlyTime = (dateString: string): string => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Time";
    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    });
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Kolkata",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusConfig = (status?: string) => {
    const statusUpper = status?.toUpperCase() || "UNKNOWN";

    switch (statusUpper) {
      case "SUCCESS":
        return {
          icon: <CheckCircle className="text-green-500 w-16 h-16" />,
          title: "Payment Successful!",
          message: "Your payment was completed successfully.",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
          textColor: "text-green-800"
        };

      case "PENDING":
        return {
          icon: <Clock className="text-yellow-500 w-16 h-16" />,
          title: "Payment Pending",
          message: "Your payment is being processed. Please wait a moment.",
          bgColor: "bg-yellow-50",
          borderColor: "border-yellow-200",
          textColor: "text-yellow-800"
        };

      case "USER_DROPPED":
        return {
          icon: <AlertCircle className="text-orange-500 w-16 h-16" />,
          title: "Payment Incomplete",
          message: "It seems you didn't finish the payment. You can retry anytime.",
          bgColor: "bg-orange-50",
          borderColor: "border-orange-200",
          textColor: "text-orange-800"
        };

      case "FAILED":
        return {
          icon: <XCircle className="text-red-500 w-16 h-16" />,
          title: "Payment Failed",
          message: "Your payment could not be processed. Please try again.",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          textColor: "text-red-800"
        };

      default:
        return {
          icon: <Clock className="text-gray-500 w-16 h-16" />,
          title: "Payment Status Unknown",
          message: "We're checking your payment status. Please refresh the page.",
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200",
          textColor: "text-gray-800"
        };
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadReceipt = async (receiptOrderId: string) => {
    try {
      // Fetch raw receipt data from backend
      const receiptData = await paymentApi.getReceipt(receiptOrderId);
      
      // Generate PDF blob
      const blob = await pdf(<ReceiptDocument data={receiptData} />).toBlob();
      
      // Download the file
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `receipt_${receiptData.receipt_id}.pdf`;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Receipt Downloaded",
        description: `Receipt ${receiptData.receipt_id} downloaded successfully.`,
        duration: 3000,
      });
    } catch (err) {
      console.error("Error generating receipt:", err);
      toast({
        title: "Download Failed",
        description: "Failed to generate receipt. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
          <div className="animate-pulse mb-6">
            <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-4"></div>
            <div className="h-6 bg-gray-300 rounded w-3/4 mx-auto mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
          </div>
          <p className="text-gray-600 text-lg font-medium">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(
    result?.transaction_info?.payment_status
  );
  const isSuccess = (result?.transaction_info?.payment_status)?.toUpperCase() === "PAID" || 
                   (result?.transaction_info?.payment_status?.toUpperCase() === "SUCCESS");

  return (
    <>
      {/* Print Styles */}
      <style>
        {`
          @media print {
            @page {
              margin: 0.5in;
              size: letter;
            }
            
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            
            .no-print {
              display: none !important;
            }
            
            .print-only {
              display: block !important;
            }
            
            .print-break {
              page-break-inside: avoid;
            }
            
            .print-section {
              margin-bottom: 20px;
              page-break-inside: avoid;
            }
            
            .bg-white {
              background: white !important;
            }
            
            .shadow-xl, .shadow-lg {
              box-shadow: none !important;
            }
            
            .rounded-2xl, .rounded-lg, .rounded {
              border-radius: 0 !important;
            }
            
            .border-2, .border {
              border: 1px solid #000 !important;
            }
            
            .text-green-500, .text-green-600, .text-green-800 {
              color: #000 !important;
            }
            
            .bg-green-50 {
              background: #f8f8f8 !important;
            }
            
            .grid {
              display: block !important;
            }
            
            .gap-4, .gap-6, .gap-8 {
              gap: 0 !important;
            }
            
            .p-8, .p-6, .p-4 {
              padding: 0 !important;
            }
            
            .mb-8, .mb-6, .mb-4 {
              margin-bottom: 15px !important;
            }
            
            .mt-6, .mt-8 {
              margin-top: 15px !important;
            }
            
            .space-y-4 > * + * {
              margin-top: 8px !important;
            }
            
            .space-y-3 > * + * {
              margin-top: 6px !important;
            }
          }
          
          .print-only {
            display: none;
          }
        `}
      </style>

      {/* Screen View */}
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-8 no-print">
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-2xl">
          {/* Status Header */}
          <div className={`flex items-center justify-center p-6 rounded-xl ${statusConfig.bgColor} ${statusConfig.borderColor} border-2 mb-8`}>
            <div className="text-center">
              <div className="flex justify-center mb-4">
                {statusConfig.icon}
              </div>
              <h1 className={`text-2xl font-bold ${statusConfig.textColor} mb-2`}>
                {statusConfig.title}
              </h1>
              <p className="text-gray-600 text-lg">
                {statusConfig.message}
              </p>
            </div>
          </div>

          {/* Project Details */}
          {result?.project_details && (
            <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Building className="w-6 h-6 text-blue-600" />
                Project Information
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Project</p>
                  <p className="text-lg font-semibold text-gray-900">{result.project_details.project_title}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Scheme</p>
                  <p className="text-lg font-semibold text-blue-600">{result.project_details.scheme_name}</p>
                </div>
              </div>
            </div>
          )}

          {/* Payment Details */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Order Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Receipt className="w-5 h-5" />
                Order Information
              </h3>
              <div className="space-y-3">
                <DetailItem 
                  label="Booking Id" 
                  value={result?.order_info?.unit_number} 
                  onCopy={() => copyToClipboard(result?.order_info?.unit_number || "", "unit_number")}
                  copied={copiedField === "unit_number"}
                />
                <DetailItem 
                  label="Order Amount" 
                  value={formatCurrency(result?.order_info?.order_amount || result?.transaction_info?.payment_amount || 0)}
                />
                <DetailItem 
                  label="Order Status" 
                  value={result?.order_info?.order_status}
                  status={result?.order_info?.order_status}
                />
              </div>
            </div>

            {/* Transaction Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Receipt className="w-5 h-5" />
                Transaction Details
              </h3>
              <div className="space-y-3">
                <DetailItem 
                  label="Transaction ID" 
                  value={result?.transaction_info?.cf_payment_id} 
                  onCopy={() => copyToClipboard(result?.transaction_info?.cf_payment_id || "", "transaction_id")}
                  copied={copiedField === "transaction_id"}
                />
                <DetailItem 
                  label="Payment Method" 
                  value={result?.transaction_info?.payment_method || "Online Payment"}
                />
                <DetailItem 
                  label="Payment Date" 
                  value={formatOnlyDate(result?.transaction_info?.payment_time || "")}
                />
                <DetailItem 
                  label="Payment Time" 
                  value={formatOnlyTime(result?.transaction_info?.payment_time || "")}
                />
                <DetailItem 
                  label="Bank Reference" 
                  value={result?.transaction_info?.bank_reference}
                  onCopy={() => copyToClipboard(result?.transaction_info?.bank_reference || "", "bank_reference")}
                  copied={copiedField === "bank_reference"}
                />
              </div>
            </div>
          </div>

          {/* Customer Information */}
          {result?.customer_info && (
            <div className="border-t pt-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Details</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <DetailItem 
                  label="Customer Name" 
                  value={result.customer_info.customer_name}
                />
                <DetailItem 
                  label="Email" 
                  value={result.customer_info.customer_email}
                  onCopy={() => copyToClipboard(result.customer_info.customer_email, "email")}
                  copied={copiedField === "email"}
                />
                <DetailItem 
                  label="Phone" 
                  value={result.customer_info.customer_phone}
                  onCopy={() => copyToClipboard(result.customer_info.customer_phone, "phone")}
                  copied={copiedField === "phone"}
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6 border-t no-print">
            {isSuccess ? (
              <button
                onClick={() => orderId && handleDownloadReceipt(orderId)}
                disabled={!orderId}
                className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-5 h-5" />
                Download Receipt
              </button>
            ) : (
              <button
                onClick={() => handlePrint()}
                disabled={!orderId}
                className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-5 h-5" />
                Download Receipt
              </button>
            )}

            {/* Navigation Button */}
            <button
              onClick={handleNavigation}
              className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-white font-medium transition-colors ${
                isSuccess
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              <Home className="w-5 h-5" />
              {isSuccess ? "Go to Dashboard" : "Back to Payment"}
            </button>
          </div>

          {/* Help Text */}
          <div className="text-center mt-6 no-print">
            <p className="text-sm text-gray-500">
              {isSuccess 
                ? "A confirmation email has been sent to your registered email address."
                : "If you have any issues, please contact our support team."
              }
            </p>
          </div>
        </div>

        {/* Additional Info Card */}
        {/* <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-2xl mt-6 no-print">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium text-gray-700">Customer Support</p>
              <p className="text-gray-600">support@ramyaconstructions.com</p>
              <p className="text-gray-600">+91-XXX-XXX-XXXX</p>
            </div>
            <div>
              <p className="font-medium text-gray-700">Business Hours</p>
              <p className="text-gray-600">Mon - Sun: 9:00 AM - 6:00 PM</p>
            </div>
          </div>
        </div> */}
      </div>

      {/* Print View */}
      <div className="print-only p-8">
        {/* Print Header */}
        <div className="text-center mb-8 border-b-2 border-gray-300 pb-2 print-section">
          <div className="flex items-center justify-center mb-2">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 font-playfair">RamyaConstructions</h1>
              <p className="text-lg text-gray-600 mt-2">Premium Real Estate Investments</p>
              <p className="text-md text-gray-500 mt-1">PAYMENT RECEIPT</p>
            </div>
          </div>
          <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-lg ${
            isSuccess ? 'bg-green-100' : 'bg-red-100'
          }`}>
            {statusConfig.icon}
            <span className={`text-xl font-bold ${
              isSuccess ? 'text-green-800' : 'text-red-800'
            }`}>
              {statusConfig.title}
            </span>
          </div>
        </div>

        {/* Project Details - Print */}
        {result?.project_details && (
          <div className="mb-6 p-4 border-2 border-gray-200 print-section">
            <h2 className=" p-2 text-xl font-bold text-gray-900 font-playfair">Project Details</h2>
            <div className="grid grid-cols-2 gap-4 p-2">
              <div>
                <p className="text-sm font-medium text-gray-500">Project Title</p>
                <p className="text-lg font-semibold text-gray-900">{result.project_details.project_title}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Scheme Name</p>
                <p className="text-lg font-semibold text-gray-900">{result.project_details.scheme_name}</p>
              </div>
            </div>
          </div>
        )}

        {/* Payment Details - Print */}
        <div className="grid grid-cols-2 gap-8 mb-6 print-break">
          {/* Order Information */}
          {/* <div className="print-section">
            <h3 className="text-lg font-bold text-gray-900 mb-3 border-b pb-2 font-playfair">Order Information</h3>
            <div className="space-y-2">
              <PrintDetailItem label="Unit Number" value={result?.order_info?.unit_number} />
              <PrintDetailItem label="Order Amount" value={formatCurrency(result?.order_info?.order_amount || 0)} />
              <PrintDetailItem label="Order Status" value={result?.order_info?.order_status} />
              <PrintDetailItem label="Order ID" value={result?.order_info?.cf_order_id} />
            </div>
          </div> */}

          {/* Transaction Information */}
          <div className="print-section">
            <h3 className="text-lg font-bold text-gray-900 mb-3 border-b font-playfair">Transaction Details</h3>
            <div className="space-y-2">
              <PrintDetailItem label="Booking Id" value={result?.order_info?.unit_number} />
              <PrintDetailItem label="Transaction ID" value={result?.transaction_info?.cf_payment_id} />
              <PrintDetailItem label="Payment Method" value={result?.transaction_info?.payment_method || "Online Payment"} />
              <PrintDetailItem label="Payment Time" value={formatDate(result?.transaction_info?.payment_time || "")} />
              {/* <PrintDetailItem label="Bank Reference" value={result?.transaction_info?.bank_reference} /> */}
              <PrintDetailItem label="Payment Amount" value={formatCurrency(result?.transaction_info?.payment_amount || 0)} />
            </div>
          </div>
        </div>

        {/* Customer Information - Print */}
        {result?.customer_info && (
          <div className="mb-6 print-section">
            <h3 className="text-lg font-bold text-gray-900 mb-3 border-b pb-2 font-playfair">Customer Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <PrintDetailItem label="Customer Name" value={result.customer_info.customer_name} />
              <PrintDetailItem label="Customer Email" value={result.customer_info.customer_email} />
              <PrintDetailItem label="Customer Phone" value={result.customer_info.customer_phone} />
            </div>
          </div>
        )}

        {/* Print Footer */}
        <div className="mt-12 pt-6 border-t-2 border-gray-300 print-section">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">
              Thank you for choosing RamyaConstructions
            </p>
            <p className="text-xs text-gray-500">
              This is a computer-generated receipt and does not require a physical signature.
            </p>
            <p className="text-xs text-gray-500 mt-2">
              For any queries, contact: support@ramyaconstructions.com | +91-XXX-XXX-XXXX
            </p>
            <p className="text-xs text-gray-400 mt-4">
              Generated on: {new Date().toLocaleString('en-IN')}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

// Reusable Detail Item Component for Screen
interface DetailItemProps {
  label: string;
  value?: string | number;
  onCopy?: () => void;
  copied?: boolean;
  status?: string;
}

const DetailItem: React.FC<DetailItemProps> = ({ label, value, onCopy, copied, status }) => {
  const getStatusColor = (status?: string) => {
    if (!status) return "";
    const statusUpper = status.toUpperCase();
    if (statusUpper === "PAID" || statusUpper === "SUCCESS") return "text-green-600 bg-green-50";
    if (statusUpper === "FAILED" || statusUpper === "CANCELLED") return "text-red-600 bg-red-50";
    return "text-yellow-600 bg-yellow-50";
  };

  return (
    <div className="flex justify-between items-start">
      <span className="text-sm font-medium text-gray-500">{label}</span>
      <div className="flex items-center gap-2">
        {status ? (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
            {value}
          </span>
        ) : (
          <span className="text-sm text-gray-900 text-right">{value || "N/A"}</span>
        )}
        {onCopy && (
          <button
            onClick={onCopy}
            className="p-1 hover:bg-gray-100 rounded transition-colors no-print"
            title="Copy to clipboard"
          >
            <Copy className={`w-4 h-4 ${copied ? 'text-green-500' : 'text-gray-400'}`} />
          </button>
        )}
      </div>
    </div>
  );
};

// Print-specific Detail Item Component
const PrintDetailItem: React.FC<{ label: string; value?: string | number }> = ({ label, value }) => (
  <div className="flex justify-between items-center py-1 border-b border-gray-100">
    <span className="text-sm font-medium text-gray-700">{label}</span>
    <span className="text-sm text-gray-900 font-semibold">{value || "N/A"}</span>
  </div>
);