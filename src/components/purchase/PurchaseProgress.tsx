import React, { useMemo } from 'react';
import { Building, User, FileText, CreditCard, CheckCircle } from 'lucide-react';
import { PurchaseStep } from '@/api/models/purchase.model';

interface PurchaseProgressProps {
  currentStep: PurchaseStep;
}

const PurchaseProgress: React.FC<PurchaseProgressProps> = ({ currentStep }) => {
  const steps = [
    { key: "plan-selection" as const, label: "Select Plan", icon: Building },
    { key: "user-info" as const, label: "Your Information", icon: User },
    { key: "kyc" as const, label: "KYC Documents", icon: FileText },
    { key: "payment" as const, label: "Payment", icon: CreditCard },
    { key: "confirmation" as const, label: "Confirmation", icon: CheckCircle },
  ] as const;

  const stepOrder = useMemo(() => steps.map(s => s.key), []);
  const currentIndex = useMemo(() => stepOrder.indexOf(currentStep), [currentStep, stepOrder]);

  const getStepStatus = useMemo(() => (stepKey: PurchaseStep) => {
    if (currentIndex === -1) return "pending";  // Guard invalid currentStep
    const stepIndex = stepOrder.indexOf(stepKey);
    if (stepIndex < currentIndex) return "completed";
    if (stepIndex === currentIndex) return "active";
    return "pending";
  }, [currentIndex, stepOrder]);

  const totalSteps = steps.length;

  return (
    <nav aria-label="Purchase progress" role="progressbar" aria-valuenow={currentIndex} aria-valuemin={0} aria-valuemax={totalSteps - 1} className="mb-8">
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const status = getStepStatus(step.key);
          const isActive = status === "active";
          const stepDescId = `step-desc-${step.key}`;

          return (
            <div key={step.key} className="flex items-center" aria-current={isActive ? "step" : undefined} aria-describedby={stepDescId}>
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                  status === "completed"
                    ? "bg-primary border-primary text-primary-foreground"
                    : status === "active"
                    ? "border-primary text-primary bg-primary/10"
                    : "border-muted text-muted-foreground"
                }`}
                title={step.label}  // Mobile tooltip
              >
                {status === "completed" ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </div>
              <span
                id={stepDescId}
                className={`ml-2 text-sm font-medium hidden sm:block ${
                  isActive
                    ? "text-primary"
                    : status === "completed"
                    ? "text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {step.label}
              </span>
              {index < totalSteps - 1 && (
                <div className={`w-8 sm:w-16 h-0.5 mx-2 sm:mx-4 transition-colors ${
                  status === "completed" ? "bg-primary" : "bg-muted"
                }`} />
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
};

export default PurchaseProgress;