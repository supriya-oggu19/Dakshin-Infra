// components/purchase/PlanSelectionStep.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Building, Plus, Minus, IndianRupee, AlertCircle } from 'lucide-react';
import { Scheme, PlanSelection, SchemeType } from '@/api/models/purchase.model';

interface PlanSelectionStepProps {
  schemes: Scheme[];
  selectedPlan: PlanSelection | null;
  selectedUnits: number;
  customPayment: string;
  loading: boolean;
  fetchError: string | null;
  onPlanSelect: (scheme: Scheme, units: number) => void;
  onUnitsChange: (increment: boolean) => void;
  onCustomPaymentChange: (value: string) => void;
  isValidPaymentAmount: () => boolean;
  getMinPayment: () => number;
  formatCurrency: (amount: number) => string;
}

const PlanSelectionStep: React.FC<PlanSelectionStepProps> = ({
  schemes,
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
}) => {
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
                selectedPlan={selectedPlan}
                selectedUnits={selectedUnits}
                customPayment={customPayment}
                onPlanSelect={onPlanSelect}
                onCustomPaymentChange={onCustomPaymentChange}
                isValidPaymentAmount={isValidPaymentAmount}
                getMinPayment={getMinPayment}
                formatCurrency={formatCurrency}
              />
              <InstallmentSchemes
                schemes={schemes}
                selectedPlan={selectedPlan}
                selectedUnits={selectedUnits}
                onPlanSelect={onPlanSelect}
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
            selectedPlan={selectedPlan}
            selectedUnits={selectedUnits}
            onPlanSelect={onPlanSelect}
            formatCurrency={formatCurrency}
          />
        ))}
        {selectedPlan?.type === "single" && (
          <PaymentInputSection
            customPayment={customPayment}
            onCustomPaymentChange={onCustomPaymentChange}
            isValidPaymentAmount={isValidPaymentAmount}
            getMinPayment={getMinPayment}
            formatCurrency={formatCurrency}
            selectedPlan={selectedPlan}
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
  selectedPlan,
  selectedUnits,
  onPlanSelect,
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
            scheme={scheme}
            selectedPlan={selectedPlan}
            selectedUnits={selectedUnits}
            onPlanSelect={onPlanSelect}
            formatCurrency={formatCurrency}
          />
        ))}
      </div>
    </div>
  );
};

// Reusable Scheme Card Component
const SchemeCard: React.FC<any> = ({ scheme, selectedPlan, selectedUnits, onPlanSelect, formatCurrency }) => {
  const isSelected = selectedPlan?.planId === scheme.id;
  const isSinglePayment = scheme.scheme_type === SchemeType.SINGLE_PAYMENT;

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
          Total per unit: {formatCurrency(
            isSinglePayment 
              ? scheme.booking_advance 
              : scheme.total_installments! * scheme.monthly_installment_amount!
          )}
        </div>
        <div className="mt-1 text-xs text-muted-foreground">
          Total for {selectedUnits} unit{selectedUnits > 1 ? "s" : ""}: {formatCurrency(
            isSinglePayment
              ? scheme.booking_advance * selectedUnits
              : scheme.total_installments! * scheme.monthly_installment_amount! * selectedUnits
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
      {formatCurrency(scheme.monthly_installment_amount ? scheme.monthly_installment_amount * 0.3 : scheme.booking_advance * 0.01)}
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
        {formatCurrency(scheme.monthly_installment_amount! * 0.3)}
      </div>
    </div>
  </>
);

const PaymentInputSection: React.FC<any> = ({
  customPayment,
  onCustomPaymentChange,
  isValidPaymentAmount,
  getMinPayment,
  formatCurrency,
  selectedPlan,
  schemes,
}) => {
  const scheme = schemes.find((s: Scheme) => s.id === selectedPlan.planId);
  const balanceDue = selectedPlan.price - (parseInt(customPayment) || 0);

  return (
    <div className="md:col-span-3 mt-4 space-y-4">
      <div className="p-4 bg-muted/30 rounded-lg">
        <label className="text-sm font-medium mb-2 block">Enter Payment Amount</label>
        <div className="flex items-center space-x-2">
          <IndianRupee className="w-5 h-5 text-muted-foreground" />
          <Input
            type="number"
            value={customPayment}
            onChange={(e) => onCustomPaymentChange(e.target.value)}
            placeholder={`Minimum ${formatCurrency(getMinPayment())}`}
            className="text-sm"
          />
        </div>
        {!isValidPaymentAmount() && (
          <p className="text-xs text-red-600 mt-1">
            Payment must be at least {formatCurrency(getMinPayment())}
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
              {formatCurrency(Math.max(0, (parseInt(customPayment) || 0) - getMinPayment()))}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Balance Due (within 90 days):</span>
            <span className="font-medium text-orange-600">{formatCurrency(balanceDue)}</span>
          </div>
        </div>
      </div>
      
      <PaymentStructureInfo
        getMinPayment={getMinPayment}
        scheme={scheme}
        formatCurrency={formatCurrency}
      />
    </div>
  );
};

const PaymentStructureInfo: React.FC<any> = ({ getMinPayment, scheme, formatCurrency }) => (
  <div className="text-xs text-muted-foreground p-3 bg-blue-50 rounded border-l-4 border-blue-400">
    <div className="font-medium text-blue-800 mb-1">Payment Structure:</div>
    <ul className="space-y-1 text-blue-700">
      <li>• Minimum advance: {formatCurrency(getMinPayment())} per unit (required now)</li>
      <li>• Any amount above minimum goes toward main payment</li>
      <li>• Remaining balance must be paid within {scheme?.balance_payment_days || 90} days</li>
      <li>• You can pay the full amount now to avoid future payment</li>
    </ul>
  </div>
);

export default PlanSelectionStep;