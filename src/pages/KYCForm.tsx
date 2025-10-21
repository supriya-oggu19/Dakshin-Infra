
import React, { useState } from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, FileText, User, Users, Edit, Upload, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface KYCDocuments {
  panCard?: File | null;
  aadharCard?: File | null;
  gstDocument?: File | null;
  passportPhoto?: File | null;
  jointPanCard?: File | null;
  jointAadharCard?: File | null;
  jointGstDocument?: File | null;
  jointPassportPhoto?: File | null;
}

interface UserInfo {
  firstName: string;
  lastName: string;
  dob: string;
  gender: 'male' | 'female' | 'other';
  email: string;
  phone: string;
  presentAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  permanentAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  occupation: string;
  annualIncome: string;
  panNumber: string;
  aadharNumber: string;
  gstNumber: string;
  passportNumber: string;
  sameAddress: boolean;
  userType: 'individual' | 'business' | 'nri';
  accountDetails: {
    accountHolderName: string;
    bankAccountName: string;
    accountNumber: string;
    ifscCode: string;
  };
}

interface JointAccountInfo {
  firstName: string;
  lastName: string;
  dob: string;
  gender: 'male' | 'female' | 'other';
  email: string;
  phone: string;
  panNumber: string;
  aadharNumber: string;
  gstNumber: string;
  passportNumber: string;
  userType: 'individual' | 'business' | 'nri';
  accountDetails: {
    accountHolderName: string;
    bankAccountName: string;
    accountNumber: string;
    ifscCode: string;
  };
}

interface KYCFormProps {
  kycDocuments: KYCDocuments;
  setKycDocuments: React.Dispatch<React.SetStateAction<KYCDocuments>>;
  kycAccepted: boolean;
  setKycAccepted: React.Dispatch<React.SetStateAction<boolean>>;
  userType: 'individual' | 'business' | 'nri';
  isJointAccount?: boolean;
  jointUserType?: 'individual' | 'business' | 'nri';
  jointKycAccepted?: boolean;
  setJointKycAccepted?: React.Dispatch<React.SetStateAction<boolean>>;
  userInfo: UserInfo;
  jointAccountInfo: JointAccountInfo;
  setCurrentStep: React.Dispatch<React.SetStateAction<PurchaseStep>>;
}

type PurchaseStep = 'plan-selection' | 'user-info' | 'kyc' | 'payment' | 'confirmation';

const KYCForm = ({
  kycDocuments,
  setKycDocuments,
  kycAccepted,
  setKycAccepted,
  userType,
  isJointAccount = false,
  jointUserType = 'individual',
  jointKycAccepted = false,
  setJointKycAccepted,
  userInfo,
  jointAccountInfo,
  setCurrentStep,
}: KYCFormProps) => {
  const handleFileUpload = (field: keyof KYCDocuments, file: File) => {
    setKycDocuments(prev => ({ ...prev, [field]: file }));
  };

  const primaryDocs = userType === 'individual' ? [
    { key: 'panCard', label: 'PAN Card', required: true },
    { key: 'aadharCard', label: 'Aadhar Card', required: true },
  ] : userType === 'business' ? [
    { key: 'gstDocument', label: 'GST Document', required: true },
  ] : [
    { key: 'passportPhoto', label: 'Passport Photo', required: true },
  ];

  const jointDocs = jointUserType === 'individual' ? [
    { key: 'jointPanCard', label: 'PAN Card', required: true },
    { key: 'jointAadharCard', label: 'Aadhar Card', required: true },
  ] : jointUserType === 'business' ? [
    { key: 'jointGstDocument', label: 'GST Document', required: true },
  ] : [
    { key: 'jointPassportPhoto', label: 'Passport Photo', required: true },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6">
      {/* Primary Account Holder Details */}
      <Card className="border-2 border-yellow-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="bg-gradient-to-r from-yellow-50 to-amber-50 border-b-2 border-yellow-200">
          <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-yellow-400 rounded-lg">
                <User className="w-5 h-5 text-yellow-900" />
              </div>
              <span className="text-lg sm:text-xl font-bold text-gray-800">Primary Account Holder</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentStep('user-info')}
              className="border-2 border-yellow-400 text-yellow-700 hover:bg-yellow-50 hover:text-yellow-800 transition-all duration-200 w-full sm:w-auto"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Details
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <Label className="text-xs font-semibold text-yellow-800 uppercase tracking-wide">Full Name</Label>
              <p className="text-sm sm:text-base font-medium text-gray-800 mt-1">{userInfo.firstName} {userInfo.lastName}</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <Label className="text-xs font-semibold text-yellow-800 uppercase tracking-wide">Email Address</Label>
              <p className="text-sm sm:text-base font-medium text-gray-800 mt-1 break-all">{userInfo.email}</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <Label className="text-xs font-semibold text-yellow-800 uppercase tracking-wide">Phone Number</Label>
              <p className="text-sm sm:text-base font-medium text-gray-800 mt-1">{userInfo.phone}</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <Label className="text-xs font-semibold text-yellow-800 uppercase tracking-wide">Date of Birth</Label>
              <p className="text-sm sm:text-base font-medium text-gray-800 mt-1">{userInfo.dob}</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <Label className="text-xs font-semibold text-yellow-800 uppercase tracking-wide">Gender</Label>
              <p className="text-sm sm:text-base font-medium text-gray-800 mt-1 capitalize">{userInfo.gender}</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <Label className="text-xs font-semibold text-yellow-800 uppercase tracking-wide">Account Type</Label>
              <p className="text-sm sm:text-base font-medium text-gray-800 mt-1 capitalize">{userInfo.userType}</p>
            </div>
            
            {userInfo.userType === 'individual' && (
              <>
                <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <Label className="text-xs font-semibold text-yellow-800 uppercase tracking-wide">PAN Number</Label>
                  <p className="text-sm sm:text-base font-medium text-gray-800 mt-1">{userInfo.panNumber}</p>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <Label className="text-xs font-semibold text-yellow-800 uppercase tracking-wide">Aadhar Number</Label>
                  <p className="text-sm sm:text-base font-medium text-gray-800 mt-1">{userInfo.aadharNumber}</p>
                </div>
              </>
            )}
            
            {userInfo.userType === 'business' && (
              <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <Label className="text-xs font-semibold text-yellow-800 uppercase tracking-wide">GST Number</Label>
                <p className="text-sm sm:text-base font-medium text-gray-800 mt-1">{userInfo.gstNumber}</p>
              </div>
            )}
            
            {userInfo.userType === 'nri' && (
              <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <Label className="text-xs font-semibold text-yellow-800 uppercase tracking-wide">Passport Number</Label>
                <p className="text-sm sm:text-base font-medium text-gray-800 mt-1">{userInfo.passportNumber}</p>
              </div>
            )}
            
            <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200 sm:col-span-2 lg:col-span-3">
              <Label className="text-xs font-semibold text-yellow-800 uppercase tracking-wide">Present Address</Label>
              <p className="text-sm sm:text-base font-medium text-gray-800 mt-1">
                {userInfo.presentAddress.street}, {userInfo.presentAddress.city}, {userInfo.presentAddress.state} - {userInfo.presentAddress.pincode}
              </p>
            </div>
            
            {!userInfo.sameAddress && (
              <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200 sm:col-span-2 lg:col-span-3">
                <Label className="text-xs font-semibold text-yellow-800 uppercase tracking-wide">Permanent Address</Label>
                <p className="text-sm sm:text-base font-medium text-gray-800 mt-1">
                  {userInfo.permanentAddress.street}, {userInfo.permanentAddress.city}, {userInfo.permanentAddress.state} - {userInfo.permanentAddress.pincode}
                </p>
              </div>
            )}
            
            <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <Label className="text-xs font-semibold text-yellow-800 uppercase tracking-wide">Occupation</Label>
              <p className="text-sm sm:text-base font-medium text-gray-800 mt-1">{userInfo.occupation}</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <Label className="text-xs font-semibold text-yellow-800 uppercase tracking-wide">Annual Income</Label>
              <p className="text-sm sm:text-base font-medium text-gray-800 mt-1">{userInfo.annualIncome}</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200 sm:col-span-2 lg:col-span-3">
              <Label className="text-xs font-semibold text-yellow-800 uppercase tracking-wide">Bank Account Details</Label>
              <p className="text-sm sm:text-base font-medium text-gray-800 mt-1">
                {userInfo.accountDetails.accountHolderName} | {userInfo.accountDetails.bankAccountName}<br className="sm:hidden" />
                <span className="text-xs sm:text-sm text-gray-600"> Account: {userInfo.accountDetails.accountNumber} | IFSC: {userInfo.accountDetails.ifscCode}</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Joint Account Holder Details */}
      {isJointAccount && (
        <Card className="border-2 border-yellow-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="bg-gradient-to-r from-yellow-50 to-amber-50 border-b-2 border-yellow-200">
            <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-yellow-400 rounded-lg">
                  <Users className="w-5 h-5 text-yellow-900" />
                </div>
                <span className="text-lg sm:text-xl font-bold text-gray-800">Joint Account Holder</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentStep('user-info')}
                className="border-2 border-yellow-400 text-yellow-700 hover:bg-yellow-50 hover:text-yellow-800 transition-all duration-200 w-full sm:w-auto"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Details
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <Label className="text-xs font-semibold text-yellow-800 uppercase tracking-wide">Full Name</Label>
                <p className="text-sm sm:text-base font-medium text-gray-800 mt-1">{jointAccountInfo.firstName} {jointAccountInfo.lastName}</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <Label className="text-xs font-semibold text-yellow-800 uppercase tracking-wide">Email Address</Label>
                <p className="text-sm sm:text-base font-medium text-gray-800 mt-1 break-all">{jointAccountInfo.email}</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <Label className="text-xs font-semibold text-yellow-800 uppercase tracking-wide">Phone Number</Label>
                <p className="text-sm sm:text-base font-medium text-gray-800 mt-1">{jointAccountInfo.phone}</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <Label className="text-xs font-semibold text-yellow-800 uppercase tracking-wide">Date of Birth</Label>
                <p className="text-sm sm:text-base font-medium text-gray-800 mt-1">{jointAccountInfo.dob}</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <Label className="text-xs font-semibold text-yellow-800 uppercase tracking-wide">Gender</Label>
                <p className="text-sm sm:text-base font-medium text-gray-800 mt-1 capitalize">{jointAccountInfo.gender}</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <Label className="text-xs font-semibold text-yellow-800 uppercase tracking-wide">Account Type</Label>
                <p className="text-sm sm:text-base font-medium text-gray-800 mt-1 capitalize">{jointAccountInfo.userType}</p>
              </div>
              
              {jointAccountInfo.userType === 'individual' && (
                <>
                  <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <Label className="text-xs font-semibold text-yellow-800 uppercase tracking-wide">PAN Number</Label>
                    <p className="text-sm sm:text-base font-medium text-gray-800 mt-1">{jointAccountInfo.panNumber}</p>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <Label className="text-xs font-semibold text-yellow-800 uppercase tracking-wide">Aadhar Number</Label>
                    <p className="text-sm sm:text-base font-medium text-gray-800 mt-1">{jointAccountInfo.aadharNumber}</p>
                  </div>
                </>
              )}
              
              {jointAccountInfo.userType === 'business' && (
                <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <Label className="text-xs font-semibold text-yellow-800 uppercase tracking-wide">GST Number</Label>
                  <p className="text-sm sm:text-base font-medium text-gray-800 mt-1">{jointAccountInfo.gstNumber}</p>
                </div>
              )}
              
              {jointAccountInfo.userType === 'nri' && (
                <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <Label className="text-xs font-semibold text-yellow-800 uppercase tracking-wide">Passport Number</Label>
                  <p className="text-sm sm:text-base font-medium text-gray-800 mt-1">{jointAccountInfo.passportNumber}</p>
                </div>
              )}
              
              <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200 sm:col-span-2 lg:col-span-3">
                <Label className="text-xs font-semibold text-yellow-800 uppercase tracking-wide">Bank Account Details</Label>
                <p className="text-sm sm:text-base font-medium text-gray-800 mt-1">
                  {jointAccountInfo.accountDetails.accountHolderName} | {jointAccountInfo.accountDetails.bankAccountName}<br className="sm:hidden" />
                  <span className="text-xs sm:text-sm text-gray-600"> Account: {jointAccountInfo.accountDetails.accountNumber} | IFSC: {jointAccountInfo.accountDetails.ifscCode}</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Primary Account Holder Documents */}
      <Card className="border-2 border-yellow-300 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="bg-gradient-to-r from-yellow-100 to-amber-100 border-b-2 border-yellow-300">
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 bg-yellow-500 rounded-lg">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg sm:text-xl font-bold text-gray-800">Document Upload - Primary Holder</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {primaryDocs.map((doc) => (
              <div key={doc.key} className="relative group">
                <div className="p-4 sm:p-5 border-2 border-dashed border-yellow-300 rounded-xl bg-gradient-to-br from-yellow-50 to-amber-50 hover:border-yellow-400 hover:shadow-md transition-all duration-300">
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-sm sm:text-base font-semibold text-yellow-900">{doc.label}</Label>
                    {doc.required && (
                      <span className="px-2 py-1 bg-yellow-200 text-yellow-800 text-xs font-bold rounded-full">Required</span>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <div className="relative">
                      <Input
                        type="file"
                        accept="image/jpeg,image/png,application/pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(doc.key as keyof KYCDocuments, file);
                        }}
                        className="text-sm border-2 border-yellow-200 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200 transition-all"
                      />
                      <Upload className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-yellow-600 pointer-events-none" />
                    </div>
                    
                    {kycDocuments[doc.key as keyof KYCDocuments] && (
                      <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span className="text-xs sm:text-sm text-green-700 font-medium truncate">
                          {kycDocuments[doc.key as keyof KYCDocuments]?.name}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-start gap-2 mt-3 p-2 bg-yellow-100 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-yellow-700 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-yellow-800">
                      Supported: JPG, PNG, PDF (Max 5MB)
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 sm:p-5 bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-300 rounded-xl">
            <div className="flex items-start gap-3">
              <Checkbox
                id="kycTerms"
                checked={kycAccepted}
                onCheckedChange={(checked) => setKycAccepted(checked as boolean)}
                className="mt-1 border-2 border-yellow-400 data-[state=checked]:bg-yellow-500 data-[state=checked]:border-yellow-500"
              />
              <Label htmlFor="kycTerms" className="text-sm sm:text-base leading-relaxed text-gray-700 cursor-pointer">
                I confirm that all documents uploaded are genuine and authorize <span className="font-semibold text-yellow-800">Kapil Business Park</span> to verify the same. I understand that providing false information may result in legal consequences.
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Joint Account Holder Documents */}
      {isJointAccount && (
        <Card className="border-2 border-yellow-300 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="bg-gradient-to-r from-yellow-100 to-amber-100 border-b-2 border-yellow-300">
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 bg-yellow-500 rounded-lg">
                <Users className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg sm:text-xl font-bold text-gray-800">Document Upload - Joint Holder</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {jointDocs.map((doc) => (
                <div key={doc.key} className="relative group">
                  <div className="p-4 sm:p-5 border-2 border-dashed border-yellow-300 rounded-xl bg-gradient-to-br from-yellow-50 to-amber-50 hover:border-yellow-400 hover:shadow-md transition-all duration-300">
                    <div className="flex items-center justify-between mb-3">
                      <Label className="text-sm sm:text-base font-semibold text-yellow-900">{doc.label}</Label>
                      {doc.required && (
                        <span className="px-2 py-1 bg-yellow-200 text-yellow-800 text-xs font-bold rounded-full">Required</span>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      <div className="relative">
                        <Input
                          type="file"
                          accept="image/jpeg,image/png,application/pdf"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(doc.key as keyof KYCDocuments, file);
                          }}
                          className="text-sm border-2 border-yellow-200 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200 transition-all"
                        />
                        <Upload className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-yellow-600 pointer-events-none" />
                      </div>
                      
                      {kycDocuments[doc.key as keyof KYCDocuments] && (
                        <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                          <span className="text-xs sm:text-sm text-green-700 font-medium truncate">
                            {kycDocuments[doc.key as keyof KYCDocuments]?.name}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-start gap-2 mt-3 p-2 bg-yellow-100 rounded-lg">
                      <AlertCircle className="w-4 h-4 text-yellow-700 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-yellow-800">
                        Supported: JPG, PNG, PDF (Max 5MB)
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 sm:p-5 bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-300 rounded-xl">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="jointKycTerms"
                  checked={jointKycAccepted}
                  onCheckedChange={(checked) => setJointKycAccepted?.(checked as boolean)}
                  className="mt-1 border-2 border-yellow-400 data-[state=checked]:bg-yellow-500 data-[state=checked]:border-yellow-500"
                />
                <Label htmlFor="jointKycTerms" className="text-sm sm:text-base leading-relaxed text-gray-700 cursor-pointer">
                  I confirm that all documents uploaded are genuine and authorize <span className="font-semibold text-yellow-800">Kapil Business Park</span> to verify the same. I understand that providing false information may result in legal consequences.
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
export default KYCForm;