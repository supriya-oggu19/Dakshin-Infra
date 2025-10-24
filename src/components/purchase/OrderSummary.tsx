// components/purchase/OrderSummary.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Shield, CheckCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { PlanSelection, PurchaseStep } from '@/api/models/purchase.model';

interface OrderSummaryProps {
  selectedPlan: PlanSelection | null;
  currentStep: PurchaseStep;
  loading: boolean;
  onNextStep: () => void;
  onPrevStep: () => void;
  getMinPayment: () => number;
  validateUserInfo: () => boolean;
  validateKYC: () => boolean;
  isValidPaymentAmount: () => boolean;
  formatCurrency: (amount: number) => string;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  selectedPlan,
  currentStep,
  loading,
  onNextStep,
  onPrevStep,
  getMinPayment,
  validateUserInfo,
  validateKYC,
  isValidPaymentAmount,
  formatCurrency,
}) => {
  const getNextButtonDisabled = () => {
    if (loading) return true;
    if (!selectedPlan) return true;
    
    switch (currentStep) {
      case "plan-selection":
        return selectedPlan?.type === "single" && !isValidPaymentAmount();
      case "user-info":
        return !validateUserInfo();
      case "kyc":
        return !validateKYC();
      default:
        return false;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {selectedPlan ? (
            <OrderDetails 
              selectedPlan={selectedPlan} 
              getMinPayment={getMinPayment}
              formatCurrency={formatCurrency}
            />
          ) : (
            <p className="text-sm text-muted-foreground text-center">No plan selected</p>
          )}
        </CardContent>
      </Card>

      <SecurityInfoCard />

      {currentStep !== "confirmation" && currentStep !== "payment" && (
        <NavigationButtons
          currentStep={currentStep}
          loading={loading}
          onNextStep={onNextStep}
          onPrevStep={onPrevStep}
          nextButtonDisabled={getNextButtonDisabled()}
        />
      )}
    </div>
  );
};

const OrderDetails: React.FC<any> = ({ selectedPlan, getMinPayment, formatCurrency }) => (
  <div className="space-y-2">
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">Plan Type</span>
      <span className="font-medium capitalize">{selectedPlan.type}</span>
    </div>
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">Units</span>
      <span className="font-medium">{selectedPlan.units}</span>
    </div>
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">Area per Unit</span>
      <span className="font-medium">{selectedPlan.area} sqft</span>
    </div>
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">Total Area</span>
      <span className="font-medium">{selectedPlan.area * selectedPlan.units} sqft</span>
    </div>
    <Separator />
    
    {selectedPlan.type === "installment" && (
      <>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Monthly Installment</span>
          <span className="font-medium">{formatCurrency(selectedPlan.monthlyAmount!)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Total Installments</span>
          <span className="font-medium">{selectedPlan.installments}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Rental Starts</span>
          <span className="font-medium">{selectedPlan.rentalStart}</span>
        </div>
      </>
    )}
    
    {selectedPlan.type === "single" && (
      <>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Payment Amount</span>
          <span className="font-medium">{formatCurrency(selectedPlan.paymentAmount || getMinPayment())}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Balance Due</span>
          <span className="font-medium text-orange-600">
            {formatCurrency(selectedPlan.price - (selectedPlan.paymentAmount || getMinPayment()))}
          </span>
        </div>
      </>
    )}
    
    <Separator />
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">Future Monthly Rental</span>
      <span className="font-medium text-green-600">{formatCurrency(selectedPlan.monthlyRental)}</span>
    </div>
    <Separator />
    <div className="flex justify-between text-lg font-bold">
      <span>Total Investment</span>
      <span>{formatCurrency(selectedPlan.price)}</span>
    </div>
  </div>
);

const SecurityInfoCard: React.FC = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center text-sm">
        <Shield className="w-4 h-4 mr-2" />
        Secure Payment
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-3 text-xs text-muted-foreground">
      <p>Your personal and payment information is encrypted and secure.</p>
      <div className="flex items-center space-x-2">
        <div className="w-8 h-5 bg-green-600 rounded flex items-center justify-center">
          <CheckCircle className="w-3 h-3 text-white" />
        </div>
        <span>256-bit SSL Encryption</span>
      </div>
      <div className="flex items-center space-x-2">
        <div className="w-8 h-5 bg-blue-600 rounded flex items-center justify-center">
          <Shield className="w-3 h-3 text-white" />
        </div>
        <span>PCI DSS Compliant</span>
      </div>
    </CardContent>
  </Card>
);

const NavigationButtons: React.FC<any> = ({
  currentStep,
  loading,
  onNextStep,
  onPrevStep,
  nextButtonDisabled,
}) => (
  <div className="flex space-x-3">
    {currentStep !== "plan-selection" && (
      <Button variant="outline" onClick={onPrevStep} className="flex-1" disabled={loading}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>
    )}
    <Button
      onClick={onNextStep}
      className="flex-1"
      disabled={nextButtonDisabled}
    >
      {loading ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          Processing...
        </>
      ) : (
        <>
          {currentStep === "confirmation" ? "Complete" : "Continue"}
          <ArrowRight className="w-4 h-4 ml-2" />
        </>
      )}
    </Button>
  </div>
);

export default OrderSummary;