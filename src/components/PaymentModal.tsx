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
import { paymentApi } from "@/api/paymentApi";
import {
  Loader2,
  CreditCard,
  User,
  Mail,
  Phone,
  Building2,
  IndianRupee,
  AlertCircle,
  Lock,
  CheckCircle2,
  XCircle,
} from "lucide-react";

interface PaymentModalProps {
  unit: any;
  customerInfo: any;
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
  onClose,
}: PaymentModalProps) => {
  const [paymentAmount, setPaymentAmount] = useState<string>("10000");
  const [selectedOption, setSelectedOption] = useState<string>("installment"); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customAmountError, setCustomAmountError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Constants
  const MAX_PAYMENT_AMOUNT = 1000000; // 10 lakhs
  const DEFAULT_AMOUNT = 10000;

  // Check if it's an installment scheme
  const isInstallmentScheme = unit.scheme.scheme_type === "installment";

  // Calculate amounts
  const installmentAmount = unit.scheme.monthly_installment_amount || 0;
  const balanceAmount = unit.balance_amount || 0;
  const advanceAmount = unit.scheme.booking_advance || 0;

  // Since you're using sandbox, set mode to "sandbox"
  const CASHFREE_MODE = "sandbox"; // Change to 'production' for live

  useEffect(() => {
    // Initialize with default amount
    setPaymentAmount(DEFAULT_AMOUNT.toString());
    validateAmount(DEFAULT_AMOUNT.toString());
  }, []);

  useEffect(() => {
    if (selectedOption === "installment" && isInstallmentScheme) {
      setPaymentAmount(installmentAmount.toString());
      validateAmount(installmentAmount.toString());
    }
  }, [selectedOption, installmentAmount, isInstallmentScheme]);

  // Validate amount whenever it changes
  useEffect(() => {
    if (paymentAmount) {
      validateAmount(paymentAmount);
    }
  }, [paymentAmount]);

  const validateAmount = (amount: string): boolean => {
    const errors: string[] = [];
    
    // Parse amount
    const amountNum = parseFloat(amount);

    // Basic validation
    if (isNaN(amountNum)) {
      errors.push("Please enter a valid numeric amount");
      setValidationErrors(errors);
      return false;
    }

    if (amountNum <= 0) {
      errors.push("Amount must be greater than ₹0");
    }

    if (amountNum > MAX_PAYMENT_AMOUNT) {
      errors.push(`Amount cannot exceed ₹${MAX_PAYMENT_AMOUNT.toLocaleString('en-IN')} (10 lakhs)`);
    }

    if (amountNum > balanceAmount) {
      errors.push(`Amount cannot exceed your balance of ₹${balanceAmount.toLocaleString('en-IN')}`);
    }

    if (isInstallmentScheme && selectedOption === "installment" && amountNum !== installmentAmount) {
      errors.push(`Installment amount must be exactly ₹${installmentAmount.toLocaleString('en-IN')}`);
    }

    if (isInstallmentScheme && selectedOption === "custom" && amountNum < installmentAmount) {
      errors.push(`Amount must be at least ₹${installmentAmount.toLocaleString('en-IN')} for installment scheme`);
    }

    // Check for decimal values
    if (!Number.isInteger(amountNum)) {
      errors.push("Amount must be a whole number (no decimal places)");
    }

    setValidationErrors(errors);
    setCustomAmountError(errors.length > 0 ? errors[0] : null);
    return errors.length === 0;
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
      setError("Failed to load payment gateway. Please refresh the page and try again.");
    };

    // Avoid duplicate scripts
    if (!document.querySelector('script[src="https://sdk.cashfree.com/js/v3/cashfree.js"]')) {
      document.head.appendChild(script);
    } else {
      initializeAndStartPayment(orderData);
    }
  };

  const initializeAndStartPayment = (orderData: any) => {
    if (!window.Cashfree) {
      setLoading(false);
      setError("Payment gateway not available. Please refresh the page and try again.");
      return;
    }

    try {
      // Initialize Cashfree with sandbox mode
      const cashfree = window.Cashfree({
        mode: CASHFREE_MODE,
      });

      // Open the checkout page
      const checkoutOptions = {
        paymentSessionId: orderData.payment_session_id,
        redirectTarget: "_self",
      };

      cashfree.checkout(checkoutOptions);
      
      // Close modal after initiating payment
      onClose();
      setLoading(false);
    } catch (err: any) {
      console.error("Cashfree Initialization Error:", err);
      setLoading(false);
      setError("Failed to initialize payment gateway. Please try again.");
    }
  };

  const handlePayment = async () => {
    // Clear previous errors
    setError(null);

    // Validate amount
    if (!paymentAmount) {
      setError("Please enter a payment amount");
      return;
    }

    const amount = parseFloat(paymentAmount);
    if (!validateAmount(paymentAmount)) {
      setError("Please fix the validation errors before proceeding");
      return;
    }

    setLoading(true);

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

      // Validate customer info
      if (!paymentPayload.customer_name || !paymentPayload.customer_email || !paymentPayload.customer_phone) {
        throw new Error("Complete customer information is required for payment processing");
      }

      // Call payment API
      const { data: paymentData } = await paymentApi.makePayment(paymentPayload);

      // Validate response
      if (!paymentData.payment_session_id) {
        throw new Error("Invalid response from payment gateway");
      }

      // Initiate Cashfree payment
      initiateCashfreePayment(paymentData);

    } catch (err: any) {
      console.error("Payment error:", err);
      
      // Handle different error types
      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError("Failed to process payment. Please check your internet connection and try again.");
      }
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
    return loading || validationErrors.length > 0 || !paymentAmount;
  };

  const handleAmountChange = (value: string) => {
    // Remove any non-numeric characters except digits
    const numericValue = value.replace(/[^\d]/g, '');
    
    // Limit to 7 digits (10 lakhs)
    if (numericValue.length > 7) return;
    
    // Don't allow values starting with 0 unless it's just "0"
    if (numericValue.length > 1 && numericValue.startsWith('0')) {
      setPaymentAmount(numericValue.replace(/^0+/, ''));
    } else {
      setPaymentAmount(numericValue);
    }
  };

  const getAmountSuggestions = () => {
    if (isInstallmentScheme) {
      return [
        installmentAmount,
        Math.min(installmentAmount * 3, MAX_PAYMENT_AMOUNT, balanceAmount),
        Math.min(installmentAmount * 6, MAX_PAYMENT_AMOUNT, balanceAmount),
        Math.min(balanceAmount, MAX_PAYMENT_AMOUNT)
      ].filter(amount => amount > 0);
    } else {
      return [
        DEFAULT_AMOUNT,
        Math.min(50000, MAX_PAYMENT_AMOUNT, balanceAmount),
        Math.min(100000, MAX_PAYMENT_AMOUNT, balanceAmount),
        Math.min(balanceAmount, MAX_PAYMENT_AMOUNT)
      ].filter(amount => amount > 0);
    }
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
                  <span className={!customerInfo.customer_name ? "text-orange-600" : ""}>
                    {customerInfo.customer_name || "Name not provided"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className={!customerInfo.customer_email ? "text-orange-600" : ""}>
                    {customerInfo.customer_email || "Email not provided"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className={!customerInfo.customer_phone ? "text-orange-600" : ""}>
                    {customerInfo.customer_phone || "Phone not provided"}
                  </span>
                </div>
              </div>
              {(!customerInfo.customer_name || !customerInfo.customer_email || !customerInfo.customer_phone) && (
                <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded-md">
                  <p className="text-xs text-orange-700">
                    ⚠️ Complete customer information is required for payment processing
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Payment Options */}
        <div className="space-y-4">
          {isInstallmentScheme && (
            <>
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
                {/* <div className="flex items-center space-x-2">
                  <RadioGroupItem value="custom" id="custom" />
                  <Label htmlFor="custom" className="flex-1 cursor-pointer">
                    <div className="flex justify-between items-center">
                      <span>Custom Amount</span>
                      <span className="font-semibold text-blue-600">
                        Up to {formatCurrency(Math.min(balanceAmount, MAX_PAYMENT_AMOUNT))}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Pay any amount (min: {formatCurrency(installmentAmount)})
                    </p>
                  </Label>
                </div> */}
              </RadioGroup>
            </>
          )}

          {/* Amount Input */}
          <div className="space-y-3">
            <Label htmlFor="amount" className="text-sm font-semibold">
              {isInstallmentScheme && selectedOption === "installment" 
                ? "Installment Amount" 
                : "Enter Payment Amount"}
            </Label>
            <div className="relative w-full">
              <IndianRupee
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none"
              />
              <Input
                id="amount"
                type="text"
                inputMode="numeric"
                placeholder={`Enter amount (max: ₹${MAX_PAYMENT_AMOUNT.toLocaleString('en-IN')})`}
                value={paymentAmount}
                onChange={(e) => handleAmountChange(e.target.value)}
                className={`
                  pl-9 pr-3 py-2 text-base
                  focus:ring-amber-200 focus:ring-2 focus:border-amber-500
                  ${
                    validationErrors.length > 0
                      ? "border-red-500"
                      : "border-gray-300"
                  }
                `}
                disabled={isInstallmentScheme && selectedOption === "installment"}
              />
            </div>

            {/* Amount Suggestions */}
          {!isInstallmentScheme && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Suggested Amounts:</Label>
              <div className="flex gap-2 flex-wrap">
                {getAmountSuggestions().map((amount, index) => (
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
                  >
                    {formatCurrency(amount)}
                  </Button>
                ))}
              </div>
            </div>
          )}

            <p className="text-xs text-muted-foreground font-medium">
              Maximum payment amount: ₹{MAX_PAYMENT_AMOUNT.toLocaleString('en-IN')} (10 lakhs)
              {isInstallmentScheme && selectedOption === "custom" && (
                <span> • Minimum: {formatCurrency(installmentAmount)}</span>
              )}
            </p>
          </div>
        </div>

        {/* Payment Summary - Always Visible */}
        <Card className={`border-l-4 ${
          validationErrors.length > 0 ? "border-l-red-500 bg-red-50" : "border-l-green-500 bg-green-50"
        }`}>
          <CardContent className="p-4">
            <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <IndianRupee className="w-4 h-4" />
              Payment Summary
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Amount to Pay:</span>
                <span className={`text-lg font-bold ${
                  validationErrors.length > 0 ? "text-red-700" : "text-green-700"
                }`}>
                  {paymentAmount ? formatCurrency(parseFloat(paymentAmount)) : "₹0"}
                </span>
              </div>
              {isInstallmentScheme && selectedOption === "custom" && parseFloat(paymentAmount) > installmentAmount && (
                <div className="text-xs text-green-600 bg-green-100 p-2 rounded">
                  ✓ Includes monthly installment of {formatCurrency(installmentAmount)} + additional payment
                </div>
              )}
              {validationErrors.length === 0 && paymentAmount && (
                <div className="text-xs text-green-600">
                  ✓ This amount is within acceptable limits
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Main Error Message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="font-medium">Payment Error</span>
            </div>
            <p className="text-sm text-red-700 mt-1">{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2 text-xs"
              onClick={() => setError(null)}
            >
              Dismiss
            </Button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 border-gray-300"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handlePayment}
            disabled={isPaymentDisabled()}
            className="flex-1 bg-amber-400 hover:bg-amber-500"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4 mr-2" />
                {validationErrors.length > 0 ? "Fix Errors" : "Proceed to Pay"}
              </>
            )}
          </Button>
        </div>

        {/* Security Note */}
        <div className="flex items-center justify-center space-x-1 text-xs text-muted-foreground">
          <Lock className="w-4 h-4 fill-amber-300" strokeWidth={1.5} />
          <span>Your payment is secure and encrypted</span>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;