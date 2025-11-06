import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building, FileText, Users, IndianRupee, CheckCircle,ClipboardClock, AlertCircle, Shield } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { paymentApi } from "@/api/paymentApi"; // Adjust path as needed based on your project structure
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

interface UserInfo {
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
  projectName
}: PurchaseUnitConfirmationProps) => {
  const [userInfo, setUserInfo] = useState<UserInfo>({
    name: '',
    email: '',
    phone: ''
  });
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { getToken } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState("dc");

  // Since you're using sandbox, set mode to "sandbox"
  const CASHFREE_MODE = 'sandbox'; // Change to 'production' for live

  console.log('projectId Data:', projectId);
  console.log('schemeId Data:', schemeId);
  console.log('isJointOwnership Data:', isJointOwnership);
  console.log('userProfileIds Data:', userProfileIds);
  console.log('paymentAmount Data:', paymentAmount);
  console.log('Scheme Data:', schemeData);

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
    
    if (schemeData.scheme_type === 'single_payment') {
      return schemeData.booking_advance * numberOfUnits;
    } else {
      const monthlyAmount = schemeData.monthly_installment_amount || 0;
      const totalInstallments = schemeData.total_installments || 0;
      const bookingAdvance = schemeData.booking_advance || 0;
      return (bookingAdvance + (monthlyAmount * totalInstallments)) * numberOfUnits;
    }
  };

  const validateName = (name: string): string => {
    if (!name.trim()) return 'Name is required';
    if (name.trim().length < 2) return 'Name must be at least 2 characters';
    return '';
  };

  const validateEmail = (email: string): string => {
    if (!email.trim()) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return '';
  };

  const validatePhone = (phone: string): string => {
    if (!phone.trim()) return 'Phone number is required';
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone.replace(/\D/g, ''))) return 'Please enter a valid 10-digit phone number';
    return '';
  };

  const handleInputChange = (field: keyof UserInfo, value: string) => {
    setUserInfo(prev => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const nameError = validateName(userInfo.name);
    const emailError = validateEmail(userInfo.email);
    const phoneError = validatePhone(userInfo.phone);

    setErrors({
      name: nameError,
      email: emailError,
      phone: phoneError
    });

    return !nameError && !emailError && !phoneError;
  };

  const initiateCashfreePayment = (orderData: any) => {
    // Check if Cashfree script is already loaded
    if (window.Cashfree) {
      initializeAndStartPayment(orderData);
      return;
    }

    // Dynamically load the Cashfree v3 script
    const script = document.createElement('script');
    script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
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
      toast({
        title: "Error",
        description: "Payment gateway not available. Please refresh and try again.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Initialize Cashfree with sandbox mode
      const cashfree = window.Cashfree({
        mode: CASHFREE_MODE,
      });

      // Open the checkout page (redirect to hosted page)
      const checkoutOptions = {
        paymentSessionId: orderData.payment_session_id,
        redirectTarget: '_self', // Opens in the same tab; use '_blank' for new tab
      };

      // For redirect, no promise; user will be redirected back to your return_url set in order creation
      // If using '_modal' or inline, you can chain .then/.catch
      cashfree.checkout(checkoutOptions);

      // Note: For redirect mode, success/error handling happens on your server or return_url
      // Here, we assume the redirect will handle the flow; you may want to show a message
      toast({
        title: "Redirecting",
        description: "Opening secure payment page...",
      });

      // Since it's redirect, we don't call onPurchaseSuccess here
      // The parent component or return_url should handle the final success
      // For now, to match your flow, you might need to adjust based on your backend return handling

    } catch (error) {
      console.error('Cashfree Initialization Error:', error);
      setLoading(false);
      toast({
        title: "Payment Error",
        description: 'Failed to initialize payment. Please try again.',
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
      // Assuming the first profile ID is the primary user
      const primaryUserProfileId = userProfileIds[0];
      const jointOwners = isJointOwnership 
        ? userProfileIds.slice(1).map(id => ({ user_profile_id: id })) 
        : null;

      const requestData = {
        unit_data: {
          project_id: projectId,
          scheme_id: schemeId,
          user_profile_id: primaryUserProfileId,
          is_joint_ownership: isJointOwnership,
          joint_owners: jointOwners,
          number_of_units: numberOfUnits
        },
        order_data: {
          order_amount: paymentAmount,
          customer_phone: userInfo.phone,
          customer_name: userInfo.name, // Added for completeness, assuming backend accepts
          customer_email: userInfo.email, // Added for completeness, assuming backend accepts
          payment_methods: paymentMethod
        }
      };

      const response = await paymentApi.createOrder(requestData);

      const data = response.data;
      console.log('Order Creation Response:', data);
      if (data.status === 'success') {
        toast({
          title: "Success",
          description: "Order created successfully! Redirecting to secure payment page.",
        });
        // Initiate Cashfree payment
        initiateCashfreePayment(data);
      } else {
        throw new Error(data.message || 'Order creation failed');
      }
    } catch (error: any) {
      console.error('Purchase error:', error);
      setLoading(false);
      toast({
        title: "Error",
        description: error.response?.data?.message || error.message || "Failed to create order. Please try again.",
        variant: "destructive",
      });
    }
  };

  const totalInvestment = getTotalInvestment();
  const isInstallment = schemeData?.scheme_type === 'installment';

  return (
    <Card className="border-2 border-amber-200 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-amber-50 to-amber-50 border-b-2 border-amber-200">
        <CardTitle className="flex items-center gap-2 text-amber-500">
          <ClipboardClock className="w-6 h-6" />
          Purchase Confirmation
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Building className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-800">Selected Plan</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Project:</span>
                <span className="font-semibold">{projectName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Scheme:</span>
                <span className="font-semibold">{schemeData?.scheme_name || 'Standard Scheme'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Scheme Type:</span>
                <span className="font-semibold capitalize">
                  {schemeData?.scheme_type?.replace('_', ' ') || 'single payment'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Area per Unit:</span>
                <span className="font-semibold">{schemeData?.area_sqft || 0} sqft</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-orange-600" />
              <h3 className="text-lg font-semibold text-gray-800">Payment Details</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Ownership:</span>
                <span className="font-semibold">
                  {isJointOwnership ? 'Joint Ownership' : 'Single Ownership'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Number of Units:</span>
                <span className="font-semibold">{numberOfUnits}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Area:</span>
                <span className="font-semibold">
                  {((schemeData?.area_sqft || 0) * numberOfUnits).toLocaleString()} sqft
                </span>
              </div>
              
              {isInstallment ? (
                <>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monthly Installment:</span>
                    <span className="font-semibold">
                      {formatCurrency((schemeData?.monthly_installment_amount || 0) * numberOfUnits)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Installments:</span>
                    <span className="font-semibold">{schemeData?.total_installments || 0}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="font-medium">Total Inverstment:</span>
                    <span className="font-semibold">{formatCurrency(totalInvestmentOfProject)}</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span className="font-medium">Booking Advance (Now):</span>
                    <span className="font-semibold">{formatCurrency(paymentAmount)}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between text-green-600">
                    <span className="font-medium">Amount to Pay (Now):</span>
                    <span className="font-semibold">{formatCurrency(paymentAmount)}</span>
                  </div>
                  {paymentAmount < totalInvestment && (
                    <div className="flex justify-between text-orange-600">
                      <span className="text-sm">Balance Due (90 days):</span>
                      <span className="text-sm font-medium">
                        {formatCurrency(totalInvestment - paymentAmount)}
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Your Information
          </h3>
          <p className="text-sm text-blue-700">
            Please provide your details for the payment reference
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-700">
                Full Name *
              </Label>
              <Input
                id="name"
                value={userInfo.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter your full name"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-red-500 text-xs flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.name}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700">
                Email Address *
              </Label>
              <Input
                id="email"
                type="email"
                value={userInfo.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter your email address"
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-red-500 text-xs flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.email}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-gray-700">
                Phone Number *
              </Label>
              <Input
                id="phone"
                value={userInfo.phone}
                onChange={(e) => handleInputChange('phone', e.target.value.replace(/\D/g, ''))}
                placeholder="Enter your 10-digit phone number"
                maxLength={10}
                className={errors.phone ? 'border-red-500' : ''}
              />
              {errors.phone && (
                <p className="text-red-500 text-xs flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.phone}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-gray-700">Payment Method *</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select payment type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="cc">Credit Card</SelectItem>
                  <SelectItem value="dc">Debit Card</SelectItem>
                  <SelectItem value="nb">Net Banking</SelectItem> 
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex justify-center pt-4">
          <Button
            onClick={handlePurchase}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg font-semibold"
            size="lg"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5 mr-2" />
                Confirm & Complete Purchase
              </>
            )}
          </Button>
        </div>

        <div className="text-center text-xs text-gray-500">
          <p>Your information is secure and will only be used for purchase processing</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PurchaseUnitConfirmation;