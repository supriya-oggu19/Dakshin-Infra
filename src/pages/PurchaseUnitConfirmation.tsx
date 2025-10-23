import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building, FileText, Users, IndianRupee, CheckCircle, AlertCircle } from "lucide-react";

interface PurchaseUnitConfirmationProps {
  projectId: string;
  schemeId: string;
  isJointOwnership: boolean;
  numberOfUnits: number;
  onConfirm: () => void;
  userProfileId?: string;
  schemeData?: any;
  paymentAmount: number;
  projectName?: string;
}

interface UserInfo {
  name: string;
  email: string;
  phone: string;
}

const PurchaseUnitConfirmation = ({
  projectId,
  schemeId,
  isJointOwnership,
  numberOfUnits,
  onConfirm,
  userProfileId,
  schemeData,
  paymentAmount,
  projectName = projectId
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

  // Format currency function
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

  // Calculate total investment for display
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

  // Validation functions
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
    const phoneRegex = /^[6-9]\d{9}$/; // Indian phone number validation
    if (!phoneRegex.test(phone.replace(/\D/g, ''))) return 'Please enter a valid 10-digit phone number';
    return '';
  };

  const handleInputChange = (field: keyof UserInfo, value: string) => {
    setUserInfo(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
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

  const handleConfirm = () => {
    if (validateForm()) {
      onConfirm();
    }
  };

  const totalInvestment = getTotalInvestment();
  const isInstallment = schemeData?.scheme_type === 'installment';

  return (
    <Card className="border-2 border-green-200 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b-2 border-green-200">
        <CardTitle className="flex items-center gap-2 text-green-800">
          <CheckCircle className="w-6 h-6" />
          Purchase Confirmation
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        {/* Selected Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Project & Scheme Details */}
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

          {/* Ownership & Payment Details */}
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
              
              {/* Payment Breakdown */}
              {isInstallment ? (
                <>
                  <div className="flex justify-between text-green-600">
                    <span className="font-medium">Booking Advance (Now):</span>
                    <span className="font-semibold">{formatCurrency(paymentAmount)}</span>
                  </div>
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
                </>
              ) : (
                <>
                  <div className="flex justify-between text-green-600">
                    {/* <span className="font-medium">Amount to Pay (Now):</span> */}
                    {/* <span className="font-semibold">{formatCurrency(paymentAmount)}</span> */}
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
              
              <div className="flex justify-between border-t pt-2">
                <span className="text-lg font-bold text-gray-800">
                  {isInstallment ? 'Total Investment:' : 'Total Amount:'}
                </span>
                <span className="text-lg font-bold text-blue-600">
                  {formatCurrency(totalInvestment)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* User Information Form */}
        <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-800 flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Your Information
          </h3>
          <p className="text-sm text-blue-700">
            Please provide your details for the purchase agreement
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name Field */}
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

            {/* Email Field */}
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

            {/* Phone Field */}
            <div className="space-y-2 md:col-span-2">
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
          </div>
        </div>

        {/* Next Steps Information */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-green-800 mb-2">Ready to Proceed</h4>
              <p className="text-sm text-green-700">
                Review your selection and provide your information above. When you click "Confirm & Continue", 
                you will be redirected to the payment gateway to complete your purchase.
              </p>
            </div>
          </div>
        </div>

        {/* Confirm Button */}
        <div className="flex justify-center pt-4">
          <Button
            onClick={handleConfirm}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg font-semibold"
            size="lg"
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            Confirm & Continue to Payment
          </Button>
        </div>

        {/* Security Notice */}
        <div className="text-center text-xs text-gray-500">
          <p>Your information is secure and will only be used for purchase processing</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PurchaseUnitConfirmation;