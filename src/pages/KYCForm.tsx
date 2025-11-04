import React, { useState } from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, FileText, User, Users, Edit, Upload, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KYCFormProps, UserInfo, JointAccountInfo, KYCDocuments, PurchaseStep } from "@/api/models/userInfo.model";

const KYCForm = ({
  kycDocuments,
  setKycDocuments,
  kycAccepted,
  setKycAccepted,
  userType = 'individual',
  isJointAccount = false,
  jointAccounts = [],
  jointKycAccepted = [],
  setJointKycAccepted,
  userInfo,
  setCurrentStep,
}: KYCFormProps) => {
  const [showDocuments, setShowDocuments] = useState(false);

  const handleFileUpload = (field: string, file: File) => {
    setKycDocuments(prev => ({ ...prev, [field]: file }));
  };

  const handleJointFileUpload = (jointIndex: number, field: string, file: File) => {
    const jointField = `joint${jointIndex + 1}${field.charAt(0).toUpperCase() + field.slice(1)}`;
    setKycDocuments(prev => ({ ...prev, [jointField]: file }));
  };

  const handleJointKycAccepted = (index: number, accepted: boolean) => {
    if (setJointKycAccepted) {
      setJointKycAccepted(prev => {
        const newAccepted = [...prev];
        newAccepted[index] = accepted;
        return newAccepted;
      });
    }
  };

  // Correct document mapping based on user type
  const getPrimaryDocs = () => {
    switch (userType) {
      case 'individual':
        return [
          { key: 'pan', label: 'PAN Card', required: true },
          { key: 'aadhar', label: 'Aadhar Card', required: true },
          { key: 'photo', label: 'Applicant Photo', required: true },
        ];
      case 'business':
        return [
          { key: 'gst', label: 'GST Document', required: true },
          { key: 'photo', label: 'Applicant Photo', required: true },
        ];
      case 'NRI':
        return [
          { key: 'passport', label: 'Passport', required: true },
          { key: 'photo', label: 'Applicant Photo', required: true },
        ];
      default:
        return [];
    }
  };

  const getJointDocs = (jointUserType: 'individual' | 'business' | 'NRI') => {
    switch (jointUserType) {
      case 'individual':
        return [
          { key: 'pan', label: 'PAN Card', required: true },
          { key: 'aadhar', label: 'Aadhar Card', required: true },
          { key: 'photo', label: 'Applicant Photo', required: true },
        ];
      case 'business':
        return [
          { key: 'gst', label: 'GST Document', required: true },
          { key: 'photo', label: 'Applicant Photo', required: true },
        ];
      case 'NRI':
        return [
          { key: 'passport', label: 'Passport', required: true },
          { key: 'photo', label: 'Applicant Photo', required: true },
        ];
      default:
        return [];
    }
  };

  const getPrimaryAddress = (type: 'present' | 'permanent') => {
    if (!userInfo) return 'Address not available';

    // If sameAddress is true, always use present_address
    const addr =
      userInfo.sameAddress || type === 'present'
        ? userInfo.present_address
        : userInfo.permanent_address;

    return `${addr.street || ''}, ${addr.city || ''}, ${addr.state || ''} - ${addr.postal_code || ''}`
      .trim()
      .replace(/,\s*,/g, ',')  // clean double commas
      .replace(/,\s*-/g, '');  // clean ", -"
  };

  const getJointAddress = (jointAccount: JointAccountInfo, type: 'present' | 'permanent') => {
    if (!jointAccount) return 'Address not available';

    // Use present address if sameAddress is true or if type is 'present'
    const addr =
      jointAccount.sameAddress || type === 'present'
        ? jointAccount.present_address
        : jointAccount.permanent_address;

    if (!addr) return 'Address not available';

    return `${addr.street || ''}, ${addr.city || ''}, ${addr.state || ''} - ${addr.postal_code || ''}`
      .trim()
      .replace(/,\s*,/g, ',')  // remove duplicate commas
      .replace(/,\s*-/g, '');  // clean ", -"
  };

  const primaryDocs = getPrimaryDocs();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Primary Account Holder Details */}
      <Card className="border-2 border-yellow-200 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-yellow-50 to-amber-50 border-b-2 border-yellow-200 p-3 sm:p-5">
          <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-base sm:text-lg">
            <div className="flex items-center gap-2">
              <div className="p-1.5 sm:p-2 bg-yellow-400 rounded-lg flex-shrink-0">
                <User className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-900" />
              </div>
              <span className="font-bold text-gray-800">Primary Account Holder</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentStep('user-info')}
              className="border-2 border-yellow-400 text-yellow-700 hover:bg-yellow-50 hover:text-yellow-800 transition-all duration-200 text-xs sm:text-sm w-full sm:w-auto"
            >
              <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5" />
              Edit Details
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-5">
          {userInfo ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <div>
                <Label className="text-xs sm:text-sm font-medium text-gray-500">Full Name</Label>
                <p className="text-sm sm:text-base font-semibold text-gray-900 truncate">{userInfo.surname} {userInfo.name}</p>
              </div>
              <div>
                <Label className="text-xs sm:text-sm font-medium text-gray-500">Date of Birth</Label>
                <p className="text-sm sm:text-base font-semibold text-gray-900">{userInfo.dob}</p>
              </div>
              <div>
                <Label className="text-xs sm:text-sm font-medium text-gray-500">Gender</Label>
                <p className="text-sm sm:text-base font-semibold text-gray-900">{userInfo.gender}</p>
              </div>
              <div>
                <Label className="text-xs sm:text-sm font-medium text-gray-500">Email</Label>
                <p className="text-sm sm:text-base font-semibold text-gray-900 break-all">{userInfo.email}</p>
              </div>
              <div>
                <Label className="text-xs sm:text-sm font-medium text-gray-500">Phone Number</Label>
                <p className="text-sm sm:text-base font-semibold text-gray-900">{userInfo.phone_number}</p>
              </div>
              <div>
                <Label className="text-xs sm:text-sm font-medium text-gray-500">User Type</Label>
                <p className="text-sm sm:text-base font-semibold text-gray-900 capitalize">{userInfo.user_type}</p>
              </div>
              <div className="sm:col-span-2">
                <Label className="text-xs sm:text-sm font-medium text-gray-500">Present Address</Label>
                <p className="text-sm sm:text-base font-semibold text-gray-900">{getPrimaryAddress('present')}</p>
              </div>
              <div className="sm:col-span-2">
                <Label className="text-xs sm:text-sm font-medium text-gray-500">Permanent Address</Label>
                <p className="text-sm sm:text-base font-semibold text-gray-900">{getPrimaryAddress('permanent')}</p>
              </div>
              <div>
                <Label className="text-xs sm:text-sm font-medium text-gray-500">Occupation</Label>
                <p className="text-sm sm:text-base font-semibold text-gray-900">{userInfo.occupation}</p>
              </div>
              <div>
                <Label className="text-xs sm:text-sm font-medium text-gray-500">Annual Income</Label>
                <p className="text-sm sm:text-base font-semibold text-gray-900">{userInfo.annual_income}</p>
              </div>
              {userInfo.pan_number && (
                <div>
                  <Label className="text-xs sm:text-sm font-medium text-gray-500">PAN Number</Label>
                  <p className="text-sm sm:text-base font-semibold text-gray-900 uppercase">{userInfo.pan_number}</p>
                </div>
              )}
              {userInfo.aadhar_number && (
                <div>
                  <Label className="text-xs sm:text-sm font-medium text-gray-500">Aadhaar Number</Label>
                  <p className="text-sm sm:text-base font-semibold text-gray-900">{userInfo.aadhar_number}</p>
                </div>
              )}
              {userInfo.gst_number && (
                <div>
                  <Label className="text-xs sm:text-sm font-medium text-gray-500">GST Number</Label>
                  <p className="text-sm sm:text-base font-semibold text-gray-900 uppercase">{userInfo.gst_number}</p>
                </div>
              )}
              {userInfo.passport_number && (
                <div>
                  <Label className="text-xs sm:text-sm font-medium text-gray-500">Passport Number</Label>
                  <p className="text-sm sm:text-base font-semibold text-gray-900 uppercase">{userInfo.passport_number}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-red-600 text-sm sm:text-base">No user information available. Please go back and fill user details.</p>
          )}
        </CardContent>
      </Card>

      {/* Joint Account Holders */}
      {isJointAccount && jointAccounts.map((jointAccount, index) => (
        <Card key={index} className="border-2 border-yellow-200 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-yellow-50 to-amber-50 border-b-2 border-yellow-200 p-3 sm:p-5">
            <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-base sm:text-lg">
              <div className="flex items-center gap-2">
                <div className="p-1.5 sm:p-2 bg-yellow-400 rounded-lg flex-shrink-0">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-900" />
                </div>
                <span className="font-bold text-gray-800">Joint Account Holder {index + 1}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentStep('user-info')}
                className="border-2 border-yellow-400 text-yellow-700 hover:bg-yellow-50 hover:text-yellow-800 transition-all duration-200 text-xs sm:text-sm w-full sm:w-auto"
              >
                <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5" />
                Edit Details
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <div>
                <Label className="text-xs sm:text-sm font-medium text-gray-500">Full Name</Label>
                <p className="text-sm sm:text-base font-semibold text-gray-900 truncate">{jointAccount.surname} {jointAccount.name}</p>
              </div>
              <div>
                <Label className="text-xs sm:text-sm font-medium text-gray-500">Date of Birth</Label>
                <p className="text-sm sm:text-base font-semibold text-gray-900">{jointAccount.dob}</p>
              </div>
              <div>
                <Label className="text-xs sm:text-sm font-medium text-gray-500">Gender</Label>
                <p className="text-sm sm:text-base font-semibold text-gray-900">{jointAccount.gender}</p>
              </div>
              <div>
                <Label className="text-xs sm:text-sm font-medium text-gray-500">Email</Label>
                <p className="text-sm sm:text-base font-semibold text-gray-900 break-all">{jointAccount.email}</p>
              </div>
              <div>
                <Label className="text-xs sm:text-sm font-medium text-gray-500">Phone Number</Label>
                <p className="text-sm sm:text-base font-semibold text-gray-900">{jointAccount.phone_number}</p>
              </div>
              <div>
                <Label className="text-xs sm:text-sm font-medium text-gray-500">User Type</Label>
                <p className="text-sm sm:text-base font-semibold text-gray-900 capitalize">{jointAccount.user_type}</p>
              </div>
              <div>
                <Label className="text-xs sm:text-sm font-medium text-gray-500">Occupation</Label>
                <p className="text-sm sm:text-base font-semibold text-gray-900">{jointAccount.occupation}</p>
              </div>
              <div>
                <Label className="text-xs sm:text-sm font-medium text-gray-500">Annual Income</Label>
                <p className="text-sm sm:text-base font-semibold text-gray-900">{jointAccount.annual_income}</p>
              </div>
              <div className="sm:col-span-2">
                <Label className="text-xs sm:text-sm font-medium text-gray-500">Present Address</Label>
                <p className="text-sm sm:text-base font-semibold text-gray-900">{getJointAddress(jointAccount, 'present')}</p>
              </div>
              <div className="sm:col-span-2">
                <Label className="text-xs sm:text-sm font-medium text-gray-500">Permanent Address</Label>
                <p className="text-sm sm:text-base font-semibold text-gray-900">{getJointAddress(jointAccount, 'permanent')}</p>
              </div>
              {jointAccount.pan_number && (
                <div>
                  <Label className="text-xs sm:text-sm font-medium text-gray-500">PAN Number</Label>
                  <p className="text-sm sm:text-base font-semibold text-gray-900 uppercase">{jointAccount.pan_number}</p>
                </div>
              )}
              {jointAccount.aadhar_number && (
                <div>
                  <Label className="text-xs sm:text-sm font-medium text-gray-500">Aadhaar Number</Label>
                  <p className="text-sm sm:text-base font-semibold text-gray-900">{jointAccount.aadhar_number}</p>
                </div>
              )}
              {jointAccount.gst_number && (
                <div>
                  <Label className="text-xs sm:text-sm font-medium text-gray-500">GST Number</Label>
                  <p className="text-sm sm:text-base font-semibold text-gray-900 uppercase">{jointAccount.gst_number}</p>
                </div>
              )}
              {jointAccount.passport_number && (
                <div>
                  <Label className="text-xs sm:text-sm font-medium text-gray-500">Passport Number</Label>
                  <p className="text-sm sm:text-base font-semibold text-gray-900 uppercase">{jointAccount.passport_number}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Primary Account Holder Documents */}
      <Card className="border-2 border-yellow-300 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-yellow-100 to-amber-100 border-b-2 border-yellow-300 p-3 sm:p-5">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <div className="p-1.5 sm:p-2 bg-yellow-500 rounded-lg flex-shrink-0">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <span className="font-bold text-gray-800">Document Upload - Primary Holder</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-5 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {primaryDocs.map((doc) => (
              <div key={doc.key} className="relative group">
                <div className="p-3 sm:p-4 border-2 border-dashed border-yellow-300 rounded-xl bg-gradient-to-br from-yellow-50 to-amber-50 hover:border-yellow-400 hover:shadow-md transition-all duration-300">
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-xs sm:text-sm font-semibold text-yellow-900">{doc.label}</Label>
                    {doc.required && (
                      <span className="px-1.5 py-0.5 bg-yellow-200 text-yellow-800 text-xs font-bold rounded-full">Required</span>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="relative">
                      <Input
                        type="file"
                        accept="image/jpeg,image/png,application/pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(doc.key, file);
                        }}
                        className="text-xs sm:text-sm file:text-xs sm:file:text-sm border-2 border-yellow-200 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200 transition-all cursor-pointer pr-9 sm:pr-11 truncate"
                      />
                      <Upload className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-600 pointer-events-none" />
                    </div>
                    
                    {kycDocuments[doc.key] && (
                      <div className="flex items-center gap-1.5 p-1.5 bg-green-50 border border-green-200 rounded-lg">
                        <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600 flex-shrink-0" />
                        <span className="text-xs sm:text-sm text-green-700 font-medium truncate max-w-[180px] sm:max-w-full">
                          {(kycDocuments[doc.key] as File)?.name}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-start gap-1.5 mt-2 p-1.5 bg-yellow-100 rounded-lg text-xs">
                    <AlertCircle className="w-3.5 h-3.5 text-yellow-700 flex-shrink-0 mt-0.5" />
                    <p className="text-yellow-800">JPG, PNG, PDF (Max 5MB)</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 sm:p-4 bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-300 rounded-xl">
            <div className="flex flex-col sm:flex-row items-start gap-3">
              <Checkbox
                id="kycTerms"
                checked={kycAccepted}
                onCheckedChange={(checked) => setKycAccepted(checked as boolean)}
                className="mt-0.5 sm:mt-1 border-2 border-yellow-400 data-[state=checked]:bg-yellow-500 data-[state=checked]:border-yellow-500"
              />
              <Label htmlFor="kycTerms" className="text-xs sm:text-sm leading-relaxed text-gray-700 cursor-pointer">
                I confirm that all documents uploaded are genuine and authorize <span className="font-semibold text-yellow-800">Kapil Business Park</span> to verify the same. I understand that providing false information may result in legal consequences.
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Joint Account Holder Documents */}
      {isJointAccount && jointAccounts.map((jointAccount, index) => {
        const jointDocs = getJointDocs(jointAccount.user_type);
        return (
          <Card key={index} className="border-2 border-yellow-300 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-yellow-100 to-amber-100 border-b-2 border-yellow-300 p-3 sm:p-5">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <div className="p-1.5 sm:p-2 bg-yellow-500 rounded-lg flex-shrink-0">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <span className="font-bold text-gray-800">Document Upload - Joint Holder {index + 1}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-5 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {jointDocs.map((doc) => (
                  <div key={doc.key} className="relative group">
                    <div className="p-3 sm:p-4 border-2 border-dashed border-yellow-300 rounded-xl bg-gradient-to-br from-yellow-50 to-amber-50 hover:border-yellow-400 hover:shadow-md transition-all duration-300">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-xs sm:text-sm font-semibold text-yellow-900">{doc.label}</Label>
                        {doc.required && (
                          <span className="px-1.5 py-0.5 bg-yellow-200 text-yellow-800 text-xs font-bold rounded-full">Required</span>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <div className="relative">
                          <Input
                            type="file"
                            accept="image/jpeg,image/png,application/pdf"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleJointFileUpload(index, doc.key, file);
                            }}
                            className="text-xs sm:text-sm file:text-xs sm:file:text-sm border-2 border-yellow-200 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200 transition-all cursor-pointer"
                          />
                          <Upload className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-600 pointer-events-none" />
                        </div>
                        
                        {kycDocuments[`joint${index + 1}${doc.key.charAt(0).toUpperCase() + doc.key.slice(1)}`] && (
                          <div className="flex items-center gap-1.5 p-1.5 bg-green-50 border border-green-200 rounded-lg">
                            <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600 flex-shrink-0" />
                            <span className="text-xs sm:text-sm text-green-700 font-medium truncate max-w-[180px] sm:max-w-full">
                              {(kycDocuments[`joint${index + 1}${doc.key.charAt(0).toUpperCase() + doc.key.slice(1)}`] as File)?.name}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-start gap-1.5 mt-2 p-1.5 bg-yellow-100 rounded-lg text-xs">
                        <AlertCircle className="w-3.5 h-3.5 text-yellow-700 flex-shrink-0 mt-0.5" />
                        <p className="text-yellow-800">JPG, PNG, PDF (Max 5MB)</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 sm:p-4 bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-300 rounded-xl">
                <div className="flex flex-col sm:flex-row items-start gap-3">
                  <Checkbox
                    id={`jointKycTerms-${index}`}
                    checked={jointKycAccepted[index] || false}
                    onCheckedChange={(checked) => handleJointKycAccepted(index, checked as boolean)}
                    className="mt-0.5 sm:mt-1 border-2 border-yellow-400 data-[state=checked]:bg-yellow-500 data-[state=checked]:border-yellow-500"
                  />
                  <Label htmlFor={`jointKycTerms-${index}`} className="text-xs sm:text-sm leading-relaxed text-gray-700 cursor-pointer">
                    I confirm that all documents uploaded for Joint Holder {index + 1} are genuine and authorize <span className="font-semibold text-yellow-800">Kapil Business Park</span> to verify the same. I understand that providing false information may result in legal consequences.
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default KYCForm;