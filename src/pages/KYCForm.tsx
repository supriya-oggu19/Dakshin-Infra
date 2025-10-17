import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, FileText, User, Users } from "lucide-react";

interface KYCDocuments {
  panCard?: File | null;
  aadharCard?: File | null;
  gstDocument?: File | null;
  passportPhoto?: File | null;
  // Joint account documents
  jointPanCard?: File | null;
  jointAadharCard?: File | null;
  jointGstDocument?: File | null;
  jointPassportPhoto?: File | null;
}

interface KYCFormProps {
  kycDocuments: KYCDocuments;
  setKycDocuments: React.Dispatch<React.SetStateAction<KYCDocuments>>;
  kycAccepted: boolean;
  setKycAccepted: React.Dispatch<React.SetStateAction<boolean>>;
  userType: 'individual' | 'business' | 'nri';
  isJointAccount?: boolean;
}

const KYCForm = ({ 
  kycDocuments, 
  setKycDocuments, 
  kycAccepted, 
  setKycAccepted, 
  userType,
  isJointAccount = false 
}: KYCFormProps) => {
  const handleFileUpload = (field: keyof KYCDocuments, file: File) => {
    setKycDocuments(prev => ({ ...prev, [field]: file }));
  };

  const primaryDocs = userType === 'individual' ? [
    { key: 'panCard', label: 'PAN Card *', required: true },
    { key: 'aadharCard', label: 'Aadhar Card *', required: true },
  ] : userType === 'business' ? [
    { key: 'gstDocument', label: 'GST Document *', required: true },
  ] : [
    { key: 'passportPhoto', label: 'Passport Photo *', required: true },
  ];

  const jointDocs = userType === 'individual' ? [
    { key: 'jointPanCard', label: 'PAN Card *', required: true },
    { key: 'jointAadharCard', label: 'Aadhar Card *', required: true },
  ] : userType === 'business' ? [
    { key: 'jointGstDocument', label: 'GST Document *', required: true },
  ] : [
    { key: 'jointPassportPhoto', label: 'Passport Photo *', required: true },
  ];

  return (
    <>
      {/* Primary Account Holder Documents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            KYC Document Verification - Primary Account Holder
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {primaryDocs.map((doc) => (
              <div key={doc.key} className="p-4 border border-dashed border-muted-foreground/25 rounded-lg">
                <Label className="text-sm font-medium mb-2 block">{doc.label}</Label>
                <div className="space-y-2">
                  <Input
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(doc.key as keyof KYCDocuments, file);
                    }}
                    className="text-sm"
                  />
                  {kycDocuments[doc.key as keyof KYCDocuments] && (
                    <div className="flex items-center text-sm text-green-600">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      {kycDocuments[doc.key as keyof KYCDocuments]?.name}
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Upload JPG or PNG (Max 5MB)
                </p>
              </div>
            ))}
          </div>

          {!isJointAccount && (
            <div className="pt-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="kycTerms"
                  checked={kycAccepted}
                  onCheckedChange={(checked) => setKycAccepted(checked as boolean)}
                />
                <Label htmlFor="kycTerms" className="text-sm">
                  I confirm that all the documents uploaded are genuine and I authorize Kapil Business Park to verify the same.
                </Label>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Joint Account Holder Documents */}
      {isJointAccount && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              KYC Document Verification - Joint Account Holder
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {jointDocs.map((doc) => (
                <div key={doc.key} className="p-4 border border-dashed border-muted-foreground/25 rounded-lg">
                  <Label className="text-sm font-medium mb-2 block">{doc.label}</Label>
                  <div className="space-y-2">
                    <Input
                      type="file"
                      accept="image/jpeg,image/png"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(doc.key as keyof KYCDocuments, file);
                      }}
                      className="text-sm"
                    />
                    {kycDocuments[doc.key as keyof KYCDocuments] && (
                      <div className="flex items-center text-sm text-green-600">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        {kycDocuments[doc.key as keyof KYCDocuments]?.name}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Upload JPG or PNG (Max 5MB)
                  </p>
                </div>
              ))}
            </div>

            <div className="pt-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="kycTerms"
                  checked={kycAccepted}
                  onCheckedChange={(checked) => setKycAccepted(checked as boolean)}
                />
                <Label htmlFor="kycTerms" className="text-sm">
                  I confirm that all the documents uploaded are genuine and I authorize Kapil Business Park to verify the same.
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default KYCForm;