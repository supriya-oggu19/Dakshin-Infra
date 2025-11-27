import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Building,
  Users,
  CheckCircle,
  ClipboardList,
  AlertCircle,
  CreditCard,
  Shield,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { paymentApi } from "@/api/paymentApi";

interface PurchaseUnitConfirmationProps {
  projectId: string;
  schemeId: string;
  totalInvestmentOfProject: number;
  isJointOwnership: boolean;
  numberOfUnits: number;
  onPurchaseSuccess: (data: any) => void;
  userProfileIds: string[];
  schemeData?: any;
  paymentAmount: number;
  projectName?: string;
}

interface BillingInfo {
  name: string;
  email: string;
  phone: string;
}

declare global {
  interface Window {
    Cashfree: any;
  }
}

const PurchaseUnitConfirmation = ({
  projectId,
  schemeId,
  isJointOwnership,
  numberOfUnits,
  totalInvestmentOfProject,
  onPurchaseSuccess,
  userProfileIds,
  schemeData,
  paymentAmount,
  projectName,
}: PurchaseUnitConfirmationProps) => {
  const [billingInfo, setBillingInfo] = useState<BillingInfo>({
    name: "",
    email: "",
    phone: "",
  });
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const CASHFREE_MODE = "sandbox";

  useEffect(() => {
    const loadBillingData = () => {
      const savedBillingInfo = sessionStorage.getItem(`billingInfo_${projectId}`);
      if (savedBillingInfo) {
        try {
          const parsedInfo = JSON.parse(savedBillingInfo);
          setBillingInfo(prev => ({
            name: parsedInfo.name || "",
            email: parsedInfo.email || "",
            phone: parsedInfo.phone || "",
          }));
        } catch (error) {
          console.error("Error parsing saved billing info:", error);
        }
      }
      
      if (user && (!savedBillingInfo || !JSON.parse(savedBillingInfo).email)) {
        setBillingInfo(prev => ({
          name: prev.name || user.name || "",
          email: prev.email || user.email || "",
          phone: prev.phone || "",
        }));
      }
    };

    loadBillingData();
  }, [projectId, user]);

  useEffect(() => {
    if (billingInfo.name || billingInfo.email || billingInfo.phone) {
      sessionStorage.setItem(`billingInfo_${projectId}`, JSON.stringify(billingInfo));
    }
  }, [billingInfo, projectId]);

  const formatCurrency = (amount: number) => {
    if (!amount || isNaN(amount)) {
      return "₹0";
    }
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getTotalInvestment = () => {
    if (!schemeData) return 0;

    if (schemeData.scheme_type === "single_payment") {
      return schemeData.booking_advance * numberOfUnits;
    } else {
      const monthlyAmount = schemeData.monthly_installment_amount || 0;
      const totalInstallments = schemeData.total_installments || 0;
      const bookingAdvance = schemeData.booking_advance || 0;
      return (
        (bookingAdvance + monthlyAmount * totalInstallments) * numberOfUnits
      );
    }
  };

  const validateName = (name: string): string => {
    if (!name.trim()) return "Name is required";
    if (name.trim().length < 2) return "Name must be at least 2 characters";
    return "";
  };

  const validateEmail = (email: string): string => {
    if (!email.trim()) return "Email is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    return "";
  };

  const validatePhone = (phone: string): string => {
    if (!phone.trim()) return "Phone number is required";
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone.replace(/\D/g, "")))
      return "Please enter a valid 10-digit phone number";
    return "";
  };

  const handleInputChange = (field: keyof BillingInfo, value: string) => {
    setBillingInfo((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const nameError = validateName(billingInfo.name);
    const emailError = validateEmail(billingInfo.email);
    const phoneError = validatePhone(billingInfo.phone);

    setErrors({
      name: nameError,
      email: emailError,
      phone: phoneError,
    });

    return !nameError && !emailError && !phoneError;
  };

  const clearBillingData = () => {
    sessionStorage.removeItem(`billingInfo_${projectId}`);
    setBillingInfo({
      name: "",
      email: "",
      phone: "",
    });
  };

  const initiateCashfreePayment = (orderData: any) => {
    if (window.Cashfree) {
      initializeAndStartPayment(orderData);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
    script.async = true;
    script.onload = () => {
      initializeAndStartPayment(orderData);
    };
    script.onerror = () => {
      setLoading(false);
      toast({
        title: "Error",
        description: "Failed to load payment gateway. Please try again.",
        variant: "destructive",
      });
    };

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
      toast({
        title: "Error",
        description:
          "Payment gateway not available. Please refresh and try again.",
        variant: "destructive",
      });
      return;
    }

    try {
      const cashfree = window.Cashfree({
        mode: CASHFREE_MODE,
      });

      const checkoutOptions = {
        paymentSessionId: orderData.payment_session_id,
        redirectTarget: "_self",
      };

      cashfree.checkout(checkoutOptions);

      toast({
        title: "Redirecting",
        description: "Opening secure payment page...",
      });

    } catch (error) {
      console.error("Cashfree Initialization Error:", error);
      setLoading(false);
      toast({
        title: "Payment Error",
        description: "Failed to initialize payment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePurchase = async () => {
    if (!validateForm()) {
      return;
    }

    if (!userProfileIds || userProfileIds.length === 0) {
      toast({
        title: "Error",
        description: "User profiles not found. Please complete previous steps.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const requestData = {
        unit_data: {
          project_id: projectId,
          scheme_id: schemeId,
          user_profile_id: userProfileIds[0],
          is_joint_ownership: userProfileIds.length > 1,
          joint_owners: userProfileIds
            .slice(1)
            .map((id) => ({ user_profile_id: id })),
          number_of_units: numberOfUnits,
        },
        order_data: {
          order_amount: paymentAmount,
          customer_phone: billingInfo.phone,
          customer_name: billingInfo.name,
          customer_email: billingInfo.email,
          payment_methods: "upi,cc,dc,nb",
        },
      };

      const response = await paymentApi.createOrder(requestData);

      const data = response.data;
      if (data.status === "success") {
        toast({
          title: "Success",
          description:
            "Order created successfully! Redirecting to secure payment page.",
        });
        initiateCashfreePayment(data);
      } else {
        throw new Error(data.message || "Order creation failed");
      }
    } catch (error: any) {
      console.error("Purchase error:", error);
      setLoading(false);
      toast({
        title: "Error",
        description:
          error.response?.data?.message ||
          error.message ||
          "Failed to create order. Please try again.",
        variant: "destructive",
      });
    }
  };

  const totalInvestment = getTotalInvestment();
  const isInstallment = schemeData?.scheme_type === "installment";
  const displayProjectName = projectName || "Project";

  return (
    <Card className="border border-gray-200 shadow-lg bg-white">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
        <CardTitle className="flex items-center gap-3 text-white text-xl">
          <ClipboardList className="w-6 h-6" />
          Purchase Confirmation
        </CardTitle>
        <p className="text-blue-100 text-sm mt-1">
          Review your investment details and complete the purchase
        </p>
      </CardHeader>

      <CardContent className="p-6 space-y-8">
        {/* Investment Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Project Details */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Project Details
                </h3>
                <p className="text-sm text-gray-600">Your selected investment</p>
              </div>
            </div>

            <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-600 font-medium">Project:</span>
                <span className="font-semibold text-gray-900">{displayProjectName}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-600 font-medium">Scheme:</span>
                <span className="font-semibold text-gray-900">
                  {schemeData?.scheme_name || "Standard Scheme"}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-600 font-medium">Scheme Type:</span>
                <span className="font-semibold text-gray-900 capitalize">
                  {schemeData?.scheme_type?.replace("_", " ") || "single payment"}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600 font-medium">Area per Unit:</span>
                <span className="font-semibold text-gray-900">
                  {schemeData?.area_sqft || 0} sqft
                </span>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Payment Summary
                </h3>
                <p className="text-sm text-gray-600">Investment breakdown</p>
              </div>
            </div>

            <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-600 font-medium">Ownership:</span>
                <span className="font-semibold text-gray-900">
                  {isJointOwnership ? "Joint Ownership" : "Single Ownership"}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-600 font-medium">Number of Units:</span>
                <span className="font-semibold text-gray-900">{numberOfUnits}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-600 font-medium">Total Area:</span>
                <span className="font-semibold text-gray-900">
                  {((schemeData?.area_sqft || 0) * numberOfUnits).toLocaleString()} sqft
                </span>
              </div>

              {isInstallment ? (
                <>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-600 font-medium">Monthly Installment:</span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency((schemeData?.monthly_installment_amount || 0) * numberOfUnits)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-600 font-medium">Total Installments:</span>
                    <span className="font-semibold text-gray-900">
                      {schemeData?.total_installments || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-700 font-semibold">Total Investment:</span>
                    <span className="font-bold text-blue-600 text-lg">
                      {formatCurrency(totalInvestment)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 bg-green-50 -mx-4 -mb-4 px-4 py-3 rounded-b-lg">
                    <span className="text-green-700 font-semibold">Booking Advance (Now):</span>
                    <span className="font-bold text-green-700 text-lg">
                      {formatCurrency(paymentAmount)}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between items-center py-2 bg-green-50 -mx-4 -mb-4 px-4 py-3 rounded-b-lg">
                    <span className="text-green-700 font-semibold">Amount to Pay (Now):</span>
                    <span className="font-bold text-green-700 text-lg">
                      {formatCurrency(paymentAmount)}
                    </span>
                  </div>
                  {paymentAmount < totalInvestment && (
                    <div className="flex justify-between items-center py-2 bg-orange-50 -mx-4 mt-2 px-4 py-2 rounded">
                      <span className="text-orange-700 text-sm font-medium">Balance Due (90 days):</span>
                      <span className="text-orange-700 text-sm font-semibold">
                        {formatCurrency(totalInvestment - paymentAmount)}
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Billing Information */}
        <div className="space-y-6 p-6 bg-blue-50 rounded-xl border border-blue-200">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Billing Information
                </h3>
                <p className="text-sm text-blue-700">
                  Provide your details for payment processing
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={clearBillingData}
              className="text-blue-600 border-blue-300 hover:bg-blue-50"
            >
              Clear All
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <Label htmlFor="name" className="text-gray-700 font-medium">
                Full Name *
              </Label>
              <Input
                id="name"
                value={billingInfo.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter your full name"
                className={`h-12 ${errors.name ? "border-red-500" : "border-gray-300"}`}
              />
              {errors.name && (
                <p className="text-red-500 text-sm flex items-center gap-2 mt-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.name}
                </p>
              )}
            </div>

            <div className="space-y-3">
              <Label htmlFor="email" className="text-gray-700 font-medium">
                Email Address *
              </Label>
              <Input
                id="email"
                type="email"
                value={billingInfo.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="Enter your email"
                className={`h-12 ${errors.email ? "border-red-500" : "border-gray-300"}`}
              />
              {errors.email && (
                <p className="text-red-500 text-sm flex items-center gap-2 mt-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.email}
                </p>
              )}
            </div>

            <div className="space-y-3">
              <Label htmlFor="phone" className="text-gray-700 font-medium">
                Phone Number *
              </Label>
              <Input
                id="phone"
                value={billingInfo.phone}
                onChange={(e) =>
                  handleInputChange("phone", e.target.value.replace(/\D/g, ""))
                }
                placeholder="Enter your phone number"
                maxLength={10}
                className={`h-12 ${errors.phone ? "border-red-500" : "border-gray-300"}`}
              />
              {errors.phone && (
                <p className="text-red-500 text-sm flex items-center gap-2 mt-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.phone}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Action Section */}
        <div className="space-y-4 pt-4">
          <div className="flex justify-center">
            <Button
              onClick={handlePurchase}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
              size="lg"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                  Processing Payment...
                </>
              ) : (
                <>
                  <CheckCircle className="w-6 h-6 mr-3" />
                  Confirm & Complete Purchase
                </>
              )}
            </Button>
          </div>

          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <Shield className="w-4 h-4 text-blue-500" />
            <span>Your information is secure and encrypted</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PurchaseUnitConfirmation;