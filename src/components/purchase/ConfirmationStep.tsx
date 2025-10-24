// components/purchase/ConfirmationStep.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { PlanSelection } from '@/api/models/purchase.model';

interface ConfirmationStepProps {
  projectId: string;
  selectedPlan: PlanSelection | null;
  formatCurrency: (amount: number) => string;
}

const ConfirmationStep: React.FC<ConfirmationStepProps> = ({
  projectId,
  selectedPlan,
  formatCurrency,
}) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-green-600">
            <CheckCircle className="w-6 h-6 mr-2" />
            Investment Confirmed!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800">
              Thank you for your investment! Your purchase has been successfully processed.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold">Investment Details</h4>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>Project:</span>
                  <span className="font-medium">{projectId}</span>
                </div>
                <div className="flex justify-between">
                  <span>Units:</span>
                  <span className="font-medium">{selectedPlan?.units}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Area:</span>
                  <span className="font-medium">{selectedPlan?.area * selectedPlan?.units!} sqft</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Investment:</span>
                  <span className="font-medium">{formatCurrency(selectedPlan?.price || 0)}</span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Next Steps</h4>
              <ul className="text-sm space-y-1">
                <li>• You will receive a confirmation email shortly</li>
                <li>• Legal documents will be processed within 3-5 business days</li>
                <li>• Monthly rental payments will begin as per the selected plan</li>
                <li>• You can track your investment in your dashboard</li>
              </ul>
            </div>
          </div>
          <div className="flex space-x-4 pt-4">
            <Button onClick={() => navigate("/dashboard")}>Go to Dashboard</Button>
            <Button variant="outline" onClick={() => navigate(`/projects/${projectId}`)}>
              View Project Details
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConfirmationStep;