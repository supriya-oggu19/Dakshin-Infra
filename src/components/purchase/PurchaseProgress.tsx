// components/purchase/PurchaseProgress.tsx
import React from 'react';
import { Building, User, FileText, CreditCard, CheckCircle } from 'lucide-react';
import { PurchaseStep } from '@/api/models/purchase.model';

interface PurchaseProgressProps {
  currentStep: PurchaseStep;
}

const PurchaseProgress: React.FC<PurchaseProgressProps> = ({ currentStep }) => {
  const steps = [
    { key: "plan-selection", label: "Select Plan", icon: Building },
    { key: "user-info", label: "Your Information", icon: User },
    { key: "kyc", label: "KYC Documents", icon: FileText },
    { key: "payment", label: "Payment", icon: CreditCard },
    { key: "confirmation", label: "Confirmation", icon: CheckCircle },
  ] as const;

  const getStepStatus = (step: PurchaseStep) => {
    const stepsOrder = steps.map(s => s.key);
    const currentIndex = stepsOrder.indexOf(currentStep);
    const stepIndex = stepsOrder.indexOf(step);

    if (stepIndex < currentIndex) return "completed";
    if (stepIndex === currentIndex) return "active";
    return "pending";
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const status = getStepStatus(step.key as PurchaseStep);

          return (
            <div key={step.key} className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  status === "completed"
                    ? "bg-primary border-primary text-primary-foreground"
                    : status === "active"
                    ? "border-primary text-primary bg-primary/10"
                    : "border-muted text-muted-foreground"
                }`}
              >
                {status === "completed" ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </div>
              <span
                className={`ml-2 text-sm font-medium hidden sm:block ${
                  status === "active"
                    ? "text-primary"
                    : status === "completed"
                    ? "text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {step.label}
              </span>
              {index < 4 && (
                <div className={`w-8 sm:w-16 h-0.5 mx-2 sm:mx-4 ${
                  status === "completed" ? "bg-primary" : "bg-muted"
                }`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PurchaseProgress;