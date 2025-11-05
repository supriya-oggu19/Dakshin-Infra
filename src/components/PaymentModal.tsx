import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  CreditCard,
  User,
  Mail,
  Phone,
  Building2,
  IndianRupee,
  AlertCircle,
} from "lucide-react";

interface PaymentModalProps {
  unit: any;
  customerInfo: any;
  token: string | null;
  onClose: () => void;
}

declare global {
  interface Window {
    Cashfree: any;
  }
}

const PaymentModal = ({
  unit,
  customerInfo,
  token,
  onClose,
}: PaymentModalProps) => {
  const [paymentAmount, setPaymentAmount] = useState<string>("");
  const [selectedOption, setSelectedOption] = useState<string>("installment");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customAmountError, setCustomAmountError] = useState<string | null>(
    null
  );

  // Check if it's an installment scheme
  const isInstallmentScheme = unit.scheme.scheme_type === "installment";

  // Calculate suggested amounts
  const installmentAmount = unit.scheme.monthly_installment_amount || 0;
  const balanceAmount = unit.balance_amount || 0;
  const advanceAmount = unit.scheme.booking_advance || 0;

  // Since you're using sandbox, set mode to "sandbox"
  const CASHFREE_MODE = "sandbox"; // Change to 'production' for live

  useEffect(() => {
    // Set default amount based on selected option and scheme type
    if (isInstallmentScheme) {
      if (selectedOption === "installment") {
        setPaymentAmount(installmentAmount.toString());
        setCustomAmountError(null);
      } else if (selectedOption === "custom") {
        setPaymentAmount("");
      }
    } else {
      // For single payment scheme, default to custom amount
      setSelectedOption("custom");
      setPaymentAmount(balanceAmount > 0 ? balanceAmount.toString() : "");
    }
  }, [selectedOption, installmentAmount, isInstallmentScheme, balanceAmount]);

  // Validate custom amount when it changes
  useEffect(() => {
    if (selectedOption === "custom" && paymentAmount) {
      validateCustomAmount(paymentAmount);
    } else {
      setCustomAmountError(null);
    }
  }, [paymentAmount, selectedOption]);

  const validateCustomAmount = (amount: string) => {
    const amountNum = parseFloat(amount);

    if (isNaN(amountNum)) {
      setCustomAmountError("Please enter a valid amount");
      return false;
    }

    if (amountNum <= 0) {
      setCustomAmountError("Amount must be greater than 0");
      return false;
    }

    if (isInstallmentScheme && amountNum < installmentAmount) {
      setCustomAmountError(
        `Amount must be at least ${formatCurrency(
          installmentAmount
        )} (monthly installment)`
      );
      return false;
    }

    if (amountNum > balanceAmount) {
      setCustomAmountError(
        `Amount cannot exceed balance of ${formatCurrency(balanceAmount)}`
      );
      return false;
    }

    setCustomAmountError(null);
    return true;
  };

  const initiateCashfreePayment = (orderData: any) => {
    // Check if Cashfree script is already loaded
    if (window.Cashfree) {
      initializeAndStartPayment(orderData);
      return;
    }
    // Dynamically load the Cashfree v3 script
    const script = document.createElement("script");
    script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
    script.async = true;
    script.onload = () => {
      initializeAndStartPayment(orderData);
    };
    script.onerror = () => {
      setLoading(false);
      setError("Failed to load payment gateway. Please try again.");
    };
    // Avoid duplicate scripts
    if (
      !document.querySelector(
        'script[src="https://sdk.cashfree.com/js/v3/cashfree.js"]'
      )
    ) {
      document.head.appendChild(script);
    } else {
      initializeAndStartPayment(orderData);
    }
  };

  const initializeAndStartPayment = (orderData: any) => {
    if (!window.Cashfree) {
      setLoading(false);
      setError("Payment gateway not available. Please refresh and try again.");
      return;
    }
    try {
      // Initialize Cashfree with sandbox mode
      const cashfree = window.Cashfree({
        mode: CASHFREE_MODE,
      });
      // Open the checkout page in a new tab (similar to original window.open behavior)
      const checkoutOptions = {
        paymentSessionId: orderData.payment_session_id,
        redirectTarget: "_blank", // Opens in new tab; use '_self' for same tab or '_modal' for modal overlay
      };
      // For redirect, no promise; user will be redirected back to your return_url set in order creation
      cashfree.checkout(checkoutOptions);
      // Close modal after initiating payment (similar to original)
      onClose();
      setLoading(false);
    } catch (err: any) {
      console.error("Cashfree Initialization Error:", err);
      setLoading(false);
      setError("Failed to initialize payment. Please try again.");
    }
  };

  const handlePayment = async () => {
    if (!token || !paymentAmount) {
      setError("Please enter a valid payment amount");
      return;
    }

    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      setError("Please enter a valid payment amount");
      return;
    }

    // Additional validation for custom amount
    if (selectedOption === "custom") {
      if (!validateCustomAmount(paymentAmount)) {
        return;
      }
    }

    if (amount > balanceAmount) {
      setError("Payment amount cannot exceed balance amount");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const paymentPayload = {
        unit_number: unit.unit_number,
        order_amount: amount,
        order_currency: "INR",
        customer_name: customerInfo?.customer_name || "",
        customer_email: customerInfo?.customer_email || "",
        customer_phone: customerInfo?.customer_phone || "",
        payment_methods: "upi,cc,dc,nb",
      };

      const response = await fetch(
        "http://127.0.0.1:8000/api/payments/make-payment",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(paymentPayload),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create payment order");
      }

      const paymentData = await response.json();

      // Initiate Cashfree payment using SDK
      if (paymentData.payment_session_id) {
        initiateCashfreePayment(paymentData);
      }
    } catch (err: any) {
      console.error("Payment error:", err);
      setError(err.message || "Failed to process payment");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const isPaymentDisabled = () => {
    if (loading || !paymentAmount) return true;

    if (selectedOption === "custom") {
      return !!customAmountError;
    }

    return false;
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            {isInstallmentScheme ? "Make Payment" : "Complete Payment"}
          </DialogTitle>
        </DialogHeader>

        {/* Unit Information */}
        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-sm">
                  {unit.project.project_name}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {unit.unit_number}
                </p>
              </div>
              <Badge variant="outline" className="bg-amber-50 text-amber-700">
                {unit.scheme.scheme_name}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground">Total Investment:</span>
                <p className="font-medium">
                  {formatCurrency(unit.total_investment)}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Balance:</span>
                <p className="font-medium text-red-600">
                  {formatCurrency(unit.balance_amount)}
                </p>
              </div>
              {isInstallmentScheme && (
                <div className="col-span-2">
                  <span className="text-muted-foreground">
                    Monthly Installment:
                  </span>
                  <p className="font-medium text-green-600">
                    {formatCurrency(installmentAmount)}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Customer Information */}
        {customerInfo && (
          <Card>
            <CardContent className="p-4">
              <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                <User className="w-4 h-4" />
                Customer Details
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span>{customerInfo.customer_name || "Not provided"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>{customerInfo.customer_email || "Not provided"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{customerInfo.customer_phone || "Not provided"}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payment Options - Only show for installment schemes */}
        {isInstallmentScheme ? (
          <div className="space-y-4">
            <Label className="text-base font-medium">Select Payment Type</Label>

            <RadioGroup
              value={selectedOption}
              onValueChange={setSelectedOption}
              className="space-y-3"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="installment" id="installment" />
                <Label htmlFor="installment" className="flex-1 cursor-pointer">
                  <div className="flex justify-between items-center">
                    <span>Monthly Installment</span>
                    <span className="font-semibold text-amber-600">
                      {formatCurrency(installmentAmount)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Pay your regular monthly installment
                  </p>
                </Label>
              </div>
            </RadioGroup>

            {/* Amount Input for Custom Option */}
            {selectedOption === "custom" && (
              <div className="space-y-3">
                <Label htmlFor="amount" className="text-sm font-semibold">
                  Enter Amount (Minimum: {formatCurrency(installmentAmount)})
                </Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder={`Enter amount from ${formatCurrency(
                    installmentAmount
                  )} to ${formatCurrency(balanceAmount)}`}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  min={installmentAmount}
                  max={balanceAmount}
                  className={`
                    border-2 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 
                    ${
                      customAmountError
                        ? "border-red-500 border-2"
                        : "border-gray-300"
                    }
                    py-2 px-3 text-base
                  `}
                />

                {/* Custom Amount Error */}
                {customAmountError && (
                  <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-2 rounded-md border border-red-200">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span className="font-medium">{customAmountError}</span>
                  </div>
                )}

                <p className="text-xs text-muted-foreground font-medium">
                  Valid range: {formatCurrency(installmentAmount)} to{" "}
                  {formatCurrency(balanceAmount)}
                </p>
              </div>
            )}

            {/* Quick Amount Buttons for Custom Option */}
            {selectedOption === "custom" && (
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Quick Amounts:</Label>
                <div className="flex gap-2 flex-wrap">
                  {[
                    installmentAmount,
                    installmentAmount * 2,
                    installmentAmount * 3,
                    balanceAmount,
                  ].map((amount, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => setPaymentAmount(amount.toString())}
                      className={`
                        text-xs font-medium border-2 
                        ${
                          paymentAmount === amount.toString()
                            ? "border-amber-500 bg-amber-50 text-amber-700"
                            : "border-gray-300 hover:border-amber-400"
                        }
                        transition-all duration-200
                      `}
                      disabled={amount > balanceAmount}
                    >
                      {formatCurrency(amount)}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          // Single Payment Scheme - Direct custom amount input
          <div className="space-y-4">
            <Label className="text-base font-medium">
              Enter Payment Amount
            </Label>
            <div className="space-y-3">
              <Input
                id="amount"
                type="number"
                placeholder={`Enter amount up to ${formatCurrency(
                  balanceAmount
                )}`}
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                min={1}
                max={balanceAmount}
                className={`
                  border-2 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 
                  ${
                    customAmountError
                      ? "border-red-500 border-2"
                      : "border-gray-300"
                  }
                  py-2 px-3 text-base
                `}
              />

              {/* Custom Amount Error */}
              {customAmountError && (
                <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-2 rounded-md border border-red-200">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="font-medium">{customAmountError}</span>
                </div>
              )}

              <p className="text-xs text-muted-foreground font-medium">
                Maximum amount: {formatCurrency(balanceAmount)}
              </p>
            </div>

            {/* Quick Amount Buttons for Single Payment */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Quick Amounts:</Label>
              <div className="flex gap-2 flex-wrap">
                {[
                  balanceAmount * 0.25,
                  balanceAmount * 0.5,
                  balanceAmount * 0.75,
                  balanceAmount,
                ].map((amount, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setPaymentAmount(Math.floor(amount).toString())
                    }
                    className={`
                      text-xs font-medium border-2 
                      ${
                        paymentAmount === Math.floor(amount).toString()
                          ? "border-amber-500 bg-amber-50 text-amber-700"
                          : "border-gray-300 hover:border-amber-400"
                      }
                      transition-all duration-200
                    `}
                  >
                    {formatCurrency(Math.floor(amount))}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Payment Summary */}
        {paymentAmount && !customAmountError && (
          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="p-4">
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <IndianRupee className="w-4 h-4" />
                Payment Summary
              </h4>
              <div className="flex justify-between items-center">
                <span className="text-sm">Amount to Pay:</span>
                <span className="text-lg font-bold text-amber-700">
                  {formatCurrency(parseFloat(paymentAmount))}
                </span>
              </div>
              {isInstallmentScheme &&
                selectedOption === "custom" &&
                parseFloat(paymentAmount) > installmentAmount && (
                  <div className="mt-2 text-xs text-green-600">
                    ✓ This includes your monthly installment plus additional
                    payment
                  </div>
                )}
            </CardContent>
          </Card>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handlePayment}
            disabled={isPaymentDisabled()}
            className="flex-1 bg-amber-500 hover:bg-amber-600"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4 mr-2" />
                {isInstallmentScheme ? "Pay Now" : "Make Payment"}
              </>
            )}
          </Button>
        </div>

        {/* Security Note */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            🔒 Your payment is secure and encrypted
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
