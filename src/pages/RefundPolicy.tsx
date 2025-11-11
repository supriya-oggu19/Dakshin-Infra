// pages/RefundPolicy.tsx
import React, { useEffect } from "react";
import { FileText, CreditCard, RefreshCw } from "lucide-react";

const RefundPolicyPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        {/* Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Refund Policy</h1>
        </div>

        {/* Decorative Icons */}
        <div className="flex justify-center space-x-6 mb-6 text-yellow-600">
          <CreditCard className="w-6 h-6" />
          <RefreshCw className="w-6 h-6" />
          <FileText className="w-6 h-6" />
        </div>

        {/* Policy Content */}
        <div className="space-y-6 text-gray-800 leading-relaxed">
          <p className="text-lg font-semibold text-gray-900">
            The Policies Below Apply to Payments Made Via Online Payment Gateway.
          </p>

          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-xl shadow-sm">
            <h2 className="font-bold text-gray-900 mb-2">
              Refund for Failed Transaction
            </h2>
            <p>
              If the amount is debited from the customer’s account and the
              transaction was not successful, a refund will be initiated
              immediately. However, there are no guarantees whatsoever for the
              accuracy or timeliness of the refunds reaching the customer’s
              card or bank account.
            </p>
            <p className="mt-3">
              This is on account of the multiplicity of organizations involved
              in the processing of online transactions, the current limitations
              of internet infrastructure, and the working days/holidays of
              financial institutions.
            </p>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Ramya Constructions. All Rights Reserved.
        </div>
      </div>
    </div>
  );
};

export default RefundPolicyPage;
