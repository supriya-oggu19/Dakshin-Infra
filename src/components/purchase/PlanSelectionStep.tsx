import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Building, Plus, Minus, IndianRupee, AlertCircle } from 'lucide-react';
import { PlanSelection } from "@/api/models/purchase.model";

// Mock types for demonstration
interface Scheme {
  id: string;
  scheme_type: string;
  area_sqft: number;
  booking_advance: number;
  total_installments?: number;
  monthly_installment_amount?: number;
  monthly_rental_income: number;
  rental_start_month?: number;
  balance_payment_days?: number;
}

const SchemeType = {
  SINGLE_PAYMENT: 'single_payment',
  INSTALLMENT: 'installment'
};

interface PlanSelectionStepProps {
  schemes: Scheme[];
  totalInvestment: number;
  selectedPlan: PlanSelection | null;
  selectedUnits: number;
  customPayment: number;
  loading: boolean;
  fetchError: string | null;
  onPlanSelect: (scheme: Scheme, units: number) => void;
  onUnitsChange: (increment: boolean) => void;
  onCustomPaymentChange: (value: string) => void;
  isValidPaymentAmount: () => boolean;
  getMinPayment: () => number;
  formatCurrency: (amount: number) => string;
  // Add new prop for mobile scroll
  onPlanSelected?: () => void;
}

const PlanSelectionStep: React.FC<PlanSelectionStepProps> = ({
  schemes,
  totalInvestment,
  selectedPlan,
  selectedUnits,
  customPayment,
  loading,
  fetchError,
  onPlanSelect,
  onUnitsChange,
  onCustomPaymentChange,
  isValidPaymentAmount,
  getMinPayment,
  formatCurrency,
  onPlanSelected,
}) => {
  const handlePlanSelection = (scheme: Scheme, units: number) => {
    onPlanSelect(scheme, units);
    
    // Trigger mobile scroll only on mobile devices with a slight delay
    if (window.innerWidth < 1024) {
      // Add a small delay to ensure state updates complete
      setTimeout(() => {
        if (onPlanSelected) {
          onPlanSelected();
        } else {
          // Fallback: scroll to order summary by ID if callback not provided
          const orderSummary = document.getElementById('order-summary');
          if (orderSummary) {
            orderSummary.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      }, 100);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building className="w-5 h-5 mr-2" />
            Select Number of Units
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium">Number of Units:</label>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onUnitsChange(false)} 
                disabled={selectedUnits <= 1}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <div className="w-16 text-center py-2 px-3 border rounded-md font-medium">
                {selectedUnits}
              </div>
              <Button variant="outline" size="sm" onClick={() => onUnitsChange(true)}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              Total Area: {selectedPlan ? selectedPlan.area * selectedUnits : "Select a plan"} sqft
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building className="w-5 h-5 mr-2" />
            Choose Your Investment Plan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {fetchError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{fetchError}</AlertDescription>
            </Alert>
          )}
          {loading && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-muted-foreground mt-2">Loading schemes...</p>
            </div>
          )}
          {!loading && schemes.length === 0 && !fetchError && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>No investment schemes available for this project. Please contact support.</AlertDescription>
            </Alert>
          )}
          {schemes.length > 0 && (
            <>
              <SinglePaymentSchemes
                schemes={schemes}
                totalInvestment={totalInvestment}
                selectedPlan={selectedPlan}
                selectedUnits={selectedUnits}
                customPayment={customPayment}
                onPlanSelect={handlePlanSelection}
                onCustomPaymentChange={onCustomPaymentChange}
                isValidPaymentAmount={isValidPaymentAmount}
                getMinPayment={getMinPayment}
                formatCurrency={formatCurrency}
              />
              <InstallmentSchemes
                schemes={schemes}
                totalInvestment={totalInvestment}
                selectedPlan={selectedPlan}
                selectedUnits={selectedUnits}
                customPayment={customPayment}
                onPlanSelect={handlePlanSelection}
                onCustomPaymentChange={onCustomPaymentChange}
                isValidPaymentAmount={isValidPaymentAmount}
                getMinPayment={getMinPayment}
                formatCurrency={formatCurrency}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};


// Single Payment Schemes Sub-component
const SinglePaymentSchemes: React.FC<any> = ({
  schemes,
  totalInvestment,
  selectedPlan,
  selectedUnits,
  customPayment,
  onPlanSelect,
  onCustomPaymentChange,
  isValidPaymentAmount,
  getMinPayment,
  formatCurrency,
}) => {
  const singleSchemes = schemes.filter((s: Scheme) => s.scheme_type === SchemeType.SINGLE_PAYMENT);
  
  if (singleSchemes.length === 0) return null;

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4 text-primary">Single Payment Schemes</h3>
      <div className="grid md:grid-cols-3 gap-4">
        {singleSchemes.map((scheme: Scheme) => (
          <SchemeCard
            key={scheme.id}
            scheme={scheme}
            totalInvestment={totalInvestment}
            selectedPlan={selectedPlan}
            selectedUnits={selectedUnits}
            onPlanSelect={onPlanSelect}
            formatCurrency={formatCurrency}
          />
        ))}
        {selectedPlan?.type === "single" && (
          <PaymentInputSection
            customPayment={customPayment}
            selectedPlan={selectedPlan}
            totalInvestment={totalInvestment}
            onCustomPaymentChange={onCustomPaymentChange}
            isValidPaymentAmount={isValidPaymentAmount}
            getMinPayment={getMinPayment}
            formatCurrency={formatCurrency}
            schemes={schemes}
          />
        )}
      </div>
    </div>
  );
};

// Installment Schemes Sub-component
const InstallmentSchemes: React.FC<any> = ({
  schemes,
  totalInvestment,
  selectedPlan,
  selectedUnits,
  customPayment,
  onPlanSelect,
  onCustomPaymentChange,
  isValidPaymentAmount,
  getMinPayment,
  formatCurrency,
}) => {
  const installmentSchemes = schemes.filter((s: Scheme) => s.scheme_type === SchemeType.INSTALLMENT);
  
  if (installmentSchemes.length === 0) return null;

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4 text-primary">Installment Schemes</h3>
      <div className="grid md:grid-cols-3 gap-4">
        {installmentSchemes.map((scheme: Scheme) => (
          <SchemeCard
            key={scheme.id}
            totalInvestment={totalInvestment}
            scheme={scheme}
            selectedPlan={selectedPlan}
            selectedUnits={selectedUnits}
            onPlanSelect={onPlanSelect}
            formatCurrency={formatCurrency}
          />
        ))}
        {selectedPlan?.type === "installment" && (
          <PaymentInputSection
            customPayment={customPayment}
            totalInvestment={totalInvestment}
            selectedPlan={selectedPlan}
            onCustomPaymentChange={onCustomPaymentChange}
            isValidPaymentAmount={isValidPaymentAmount}
            getMinPayment={getMinPayment}
            formatCurrency={formatCurrency}
            schemes={schemes}
          />
        )}
      </div>
    </div>
  );
};

// Reusable Scheme Card Component
const SchemeCard: React.FC<any> = ({ scheme,totalInvestment, selectedPlan, selectedUnits, onPlanSelect, formatCurrency }) => {
  const isSelected = selectedPlan?.planId === scheme.id;
  const isSinglePayment = scheme.scheme_type === SchemeType.SINGLE_PAYMENT;
  const totalPerUnit = isSinglePayment ? scheme.booking_advance : (scheme.total_installments! * (scheme.monthly_installment_amount || 0));

  return (
    <div
      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
        isSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
      }`}
      onClick={() => onPlanSelect(scheme, selectedUnits)}
    >
      <div className="text-center">
        {!isSinglePayment && (
          <Badge className="mb-2 bg-secondary text-secondary-foreground">
            {scheme.total_installments} Installments
          </Badge>
        )}
        <div className="text-2xl font-bold text-primary mb-2">{scheme.area_sqft} sqft</div>
        <div className="text-sm text-muted-foreground mb-2">
          {isSinglePayment ? "Booking Advance" : "Booking Advance (per unit)"}
        </div>
        <div className="text-lg font-bold text-primary mb-3">
          {formatCurrency(scheme.booking_advance)}
        </div>
        
        {isSinglePayment ? (
          <SinglePaymentDetails scheme={scheme} formatCurrency={formatCurrency} />
        ) : (
          <InstallmentDetails scheme={scheme} formatCurrency={formatCurrency} />
        )}
        <div className="text-sm font-medium">
          Total per unit: {formatCurrency(totalInvestment)}
        </div>
        <div className="mt-1 text-xs text-muted-foreground">
          Total for {selectedUnits} unit{selectedUnits > 1 ? "s" : ""}: {formatCurrency(
            totalInvestment * selectedUnits
          )}
        </div>
      </div>
    </div>
  );
};

const SinglePaymentDetails: React.FC<any> = ({ scheme, formatCurrency }) => (
  <div className="bg-primary/10 p-2 rounded mb-3">
    <div className="text-xs text-muted-foreground">Monthly Rental (per unit)</div>
    <div className="text-lg font-bold text-primary">
      {formatCurrency(scheme.monthly_rental_income)}
    </div>
    <div className="text-xs text-muted-foreground mt-1">
      Rental starts: {scheme.rental_start_month ? `${scheme.rental_start_month}th Month` : "N/A"}
    </div>
  </div>
);

const InstallmentDetails: React.FC<any> = ({ scheme, formatCurrency }) => (
  <>
    <div className="bg-secondary/10 p-2 rounded mb-2">
      <div className="text-xs text-muted-foreground">Monthly Installment (per unit)</div>
      <div className="text-lg font-bold text-secondary">
        {formatCurrency(scheme.monthly_installment_amount!)}
      </div>
    </div>
    <div className="bg-primary/10 p-2 rounded mb-2">
      <div className="text-xs text-muted-foreground">Future Monthly Rental (per unit)</div>
      <div className="text-lg font-bold text-primary">
        {formatCurrency(scheme.monthly_rental_income
        )}
      </div>
    </div>
  </>
);

const PaymentInputSection: React.FC<any> = ({
  customPayment,
  selectedPlan,
  onCustomPaymentChange,
  isValidPaymentAmount,
  getMinPayment,
  formatCurrency,
  schemes,
}) => {
  const scheme = schemes.find((s: Scheme) => s.id === selectedPlan.planId);
  const currentPayment = customPayment;
  const balance = selectedPlan.price - currentPayment;
  const additional = Math.max(0, currentPayment - getMinPayment());

  return (
    <div className="md:col-span-3 mt-4 space-y-4">
      <div className="p-4 bg-muted/30 rounded-lg">
        <label className="text-sm font-medium mb-2 block">Enter Payment Amount</label>
        <div className="flex items-center space-x-2">
          <IndianRupee className="w-5 h-5 text-muted-foreground" />
          <Input
            type="number"
            value={customPayment.toString()}
            onChange={(e) => onCustomPaymentChange(e.target.value)}
            placeholder={`Minimum ${formatCurrency(getMinPayment())}`}
            className="text-sm"
            disabled={selectedPlan.type === "installment"}
          />
        </div>
        {!isValidPaymentAmount() && (
          <p className="text-xs text-red-600 mt-1">
            {Number(customPayment) < getMinPayment()
              ? `Payment must be at least ${formatCurrency(getMinPayment())}`
              : `Maximum allowed payment is ₹10,00,000`}
          </p>
        )}
        <div className="text-sm mt-2 space-y-1">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Minimum Payment:</span>
            <span className="font-medium">{formatCurrency(getMinPayment())}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Additional Payment:</span>
            <span className="font-medium">
              {formatCurrency(additional)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              {selectedPlan.type === "single" ? "Balance Due (within 90 days):" : "Remaining Investment:"}
            </span>
            <span className={`font-medium ${selectedPlan.type === "single" ? "text-orange-600" : ""}`}>
              {formatCurrency((selectedPlan.totalInvestment * selectedPlan.units) - selectedPlan.paymentAmount)}
            </span>
          </div>
        </div>
      </div>
      
      <PaymentStructureInfo
        getMinPayment={getMinPayment}
        scheme={scheme}
        formatCurrency={formatCurrency}
        selectedPlan={selectedPlan}
      />
    </div>
  );
};

const PaymentStructureInfo: React.FC<any> = ({ getMinPayment, scheme, formatCurrency, selectedPlan }) => (
  <div className="text-xs text-muted-foreground p-3 bg-blue-50 rounded border-l-4 border-blue-400">
    <div className="font-medium text-blue-800 mb-1">Payment Structure:</div>
    <ul className="space-y-1 text-blue-700">
      <li>• Minimum initial payment: {formatCurrency(getMinPayment())} {selectedPlan.type === "single" ? "(booking advance)" : "(booking advance or 1st installment)"}</li>
      <li>• Any amount above minimum {selectedPlan.type === "single" ? "goes toward main payment" : "reduces future installments"}</li>
      <li>• {selectedPlan.type === "single" ? `Remaining balance within ${scheme?.balance_payment_days || 90} days` : `Paid over ${selectedPlan.installments} monthly installments`}</li>
      {selectedPlan.type === "single" && (
        <li>• You can pay more now to complete your payment sooner.</li>
      )}
    </ul>
  </div>
);

export default PlanSelectionStep;