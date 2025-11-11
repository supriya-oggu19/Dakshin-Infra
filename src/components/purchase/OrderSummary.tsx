import React, { forwardRef } from 'react';
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

const OrderSummary = forwardRef<HTMLDivElement, OrderSummaryProps>(({
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
}, ref) => {
  const getNextButtonDisabled = () => {
    if (loading) return true;
    if (!selectedPlan) return true;
    
    switch (currentStep) {
      case "plan-selection":
        return !isValidPaymentAmount();
      case "user-info":
        return !validateUserInfo();
      case "kyc":
        return !validateKYC();
      default:
        return false;
    }
  };

  return (
    <div ref={ref} id="order-summary" className="space-y-6">
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
});

OrderSummary.displayName = 'OrderSummary';

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
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Balance Due (within 90 days)</span>
        <span className="font-medium text-orange-600">
          {formatCurrency((selectedPlan.totalInvestment * selectedPlan.units) - selectedPlan.paymentAmount)}
        </span>
      </div>
    )}
    
    {selectedPlan.type === "installment" && (
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Remaining Amount</span>
        <span className="font-medium">
          {formatCurrency((selectedPlan.totalInvestment * selectedPlan.units) - selectedPlan.paymentAmount)}
        </span>
      </div>
    )}
    
    <Separator />
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">Future Monthly Rental</span>
      <span className="font-medium text-green-600">{formatCurrency(selectedPlan.monthlyRental)}</span>
    </div>
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">Total Investment</span>
      <span>{formatCurrency(selectedPlan.totalInvestment * selectedPlan.units)}</span>
    </div>
    <Separator />
    <div className="flex justify-between text-lg font-bold text-primary">
      <span>Pay now</span>
      <span>{formatCurrency(selectedPlan.paymentAmount)}</span>
    </div>
  </div>
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