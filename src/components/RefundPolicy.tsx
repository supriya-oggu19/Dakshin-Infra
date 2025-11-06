// components/RefundPolicy.tsx
import React from 'react';
import { 
  X, 
  CheckCircle, 
  XCircle, 
  Clock, 
  CreditCard, 
  AlertTriangle, 
  Info,
  Building,
  FileText,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';

interface RefundPolicyProps {
  isOpen: boolean;
  onClose: () => void;
}

const RefundPolicy: React.FC<RefundPolicyProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const refundScenarios = [
    {
      type: 'Buyer-Initiated Cancellation',
      icon: <XCircle className="w-6 h-6 text-red-600" />,
      status: 'Generally Non-Refundable',
      color: 'red',
      details: [
        'Booking amount (10-20% of unit price) is typically non-refundable',
        'Cancellation request must be submitted in writing',
        'Refunds for additional payments beyond booking amount may be considered',
        'Administrative charges will be deducted from any refund',
        'Processing time: 120 days from cancellation request'
      ]
    },
    {
      type: 'Company-Initiated Cancellation',
      icon: <CheckCircle className="w-6 h-6 text-green-600" />,
      status: 'Full Refund with Interest',
      color: 'green',
      details: [
        'Full refund of all amounts paid including booking amount',
        'Simple interest at prevailing bank rates from payment date',
        'Alternative unit options in other projects may be offered',
        'Compensation as per applicable laws and regulations',
        'Automatic processing without request required'
      ]
    },
    {
      type: 'Project Delays & Force Majeure',
      icon: <AlertTriangle className="w-6 h-6 text-amber-600" />,
      status: 'Case by Case Basis',
      color: 'amber',
      details: [
        'Delays due to force majeure events not attributable to company',
        'Grace period of 6-12 months for possession delays',
        'No penalty charges during approved delay periods',
        'Option to cancel with terms reviewed individually',
        'Regular project updates provided throughout delay'
      ]
    }
  ];

  const refundTimeline = [
    { stage: 'Cancellation Request', duration: 'Immediate', description: 'Submit written cancellation request' },
    { stage: 'Document Verification', duration: '7-14 days', description: 'Review of documents and payment history' },
    { stage: 'Approval Process', duration: '30 days', description: 'Internal approval and calculations' },
    { stage: 'Deduction Assessment', duration: '15 days', description: 'Administrative charges calculation' },
    { stage: 'Refund Processing', duration: '45-60 days', description: 'Bank processing and transfer' }
  ];

  const nonRefundableCharges = [
    { charge: 'Booking Amount', percentage: '10-20%', reason: 'Reservation and administrative costs' },
    { charge: 'Legal & Documentation', amount: 'Actuals', reason: 'Legal processing and document preparation' },
    { charge: 'Bank Charges', amount: 'As applicable', reason: 'Transaction and processing fees' },
    { charge: 'Administrative Fee', percentage: '2-5%', reason: 'Administrative processing costs' }
  ];

  const getStatusColor = (color: string) => {
    switch (color) {
      case 'red': return 'bg-red-100 text-red-800 border-red-200';
      case 'green': return 'bg-green-100 text-green-800 border-green-200';
      case 'amber': return 'bg-amber-100 text-amber-800 border-amber-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl max-h-[90vh] overflow-y-auto w-full">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Refund Policy</h2>
                <p className="text-gray-600">Clear guidelines for commercial real estate investments</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Important Alert */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-blue-900 mb-1">Important Notice</h4>
                <p className="text-blue-800 text-sm">
                  All refund requests are subject to the terms and conditions agreed upon during booking. 
                  Please review your sale agreement for specific terms applicable to your transaction.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-gray-200 rounded-xl p-4 text-center shadow-sm">
              <CreditCard className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900">Booking Amount</h3>
              <p className="text-red-600 font-bold text-lg">Non-Refundable</p>
              <p className="text-gray-600 text-sm">Initial reservation fee (10-20%)</p>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-xl p-4 text-center shadow-sm">
              <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900">Processing Time</h3>
              <p className="text-blue-600 font-bold text-lg">120 Days</p>
              <p className="text-gray-600 text-sm">From request to completion</p>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-xl p-4 text-center shadow-sm">
              <Building className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900">Full Refund Cases</h3>
              <p className="text-green-600 font-bold text-lg">Project Cancellation</p>
              <p className="text-gray-600 text-sm">Only when company initiates</p>
            </div>
          </div>

          {/* Refund Scenarios */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Refund Scenarios & Conditions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {refundScenarios.map((scenario, index) => (
                <div key={index} className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm">
                  <div className="flex items-center space-x-2 mb-3">
                    {scenario.icon}
                    <h4 className="font-semibold text-gray-900">{scenario.type}</h4>
                  </div>
                  
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(scenario.color)} mb-3`}>
                    {scenario.status}
                  </span>
                  
                  <ul className="space-y-2">
                    {scenario.details.map((detail, idx) => (
                      <li key={idx} className="flex items-start space-x-2 text-sm text-gray-700">
                        <Info className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Refund Process Timeline */}
            <div className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm">
              <h4 className="font-bold text-gray-900 mb-3">Refund Process Timeline</h4>
              <p className="text-gray-600 text-sm mb-4">Typical timeline for refund processing after approval</p>
              
              <div className="space-y-3">
                {refundTimeline.map((stage, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{stage.stage}</p>
                      <p className="text-gray-600 text-sm">{stage.description}</p>
                    </div>
                    <span className="bg-white border border-gray-200 px-2 py-1 rounded text-sm font-medium">
                      {stage.duration}
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-4">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <p className="text-amber-800 text-sm">
                    Total processing time may vary based on documentation completeness and banking procedures.
                  </p>
                </div>
              </div>
            </div>

            {/* Non-Refundable Charges */}
            <div className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm">
              <h4 className="font-bold text-gray-900 mb-3">Potential Deductions & Charges</h4>
              <p className="text-gray-600 text-sm mb-4">Charges that may be deducted from refund amounts</p>
              
              <div className="space-y-3">
                {nonRefundableCharges.map((charge, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{charge.charge}</p>
                      <p className="text-gray-600 text-sm">{charge.reason}</p>
                    </div>
                    <span className="bg-white border border-red-200 px-2 py-1 rounded text-sm font-medium text-red-700">
                      {charge.percentage || charge.amount}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Important Legal Notes */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <h4 className="font-bold text-amber-900 mb-3">Important Legal Notes</h4>
            <div className="space-y-2">
              {[
                "All refunds are processed as per the signed Sale Agreement terms",
                "Force majeure events may affect refund timelines and terms",
                "Refund approval is subject to document verification and internal approval",
                "Interest on refunds only applicable in company-initiated cancellations"
              ].map((note, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <FileText className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <p className="text-amber-800 text-sm">{note}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-yellow-500 rounded-xl p-6 text-white">
            <h4 className="font-bold text-xl mb-3">Need Help with Refund Process?</h4>
            <p className="mb-4 opacity-90">Contact our customer service team for assistance with refund requests and queries</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5" />
                <span>support@ramyaconstructions.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5" />
                <span>[Customer Service Number]</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5" />
                <span>[Complete Business Address]</span>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5" />
                <span>Mon-Sat, 9:00 AM - 6:00 PM</span>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="text-center text-gray-600 text-sm">
            <p>
              This refund policy is part of and subject to the complete Terms and Conditions of Ramya Constructions. 
              The company reserves the right to modify this policy with reasonable notice.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RefundPolicy;