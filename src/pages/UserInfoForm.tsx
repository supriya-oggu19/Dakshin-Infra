import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Users } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { CheckCircle, AlertCircle } from "lucide-react";

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
  businessName?: string;
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
  businessName?: string;
  userType: 'individual' | 'business' | 'nri';
  accountDetails: {
    accountHolderName: string;
    bankAccountName: string;
    accountNumber: string;
    ifscCode: string;
  };
}

interface UserInfoFormProps {
  userInfo: UserInfo;
  setUserInfo: React.Dispatch<React.SetStateAction<UserInfo>>;
  termsAccepted: boolean;
  setTermsAccepted: React.Dispatch<React.SetStateAction<boolean>>;
  isJointAccount?: boolean;
  setIsJointAccount?: React.Dispatch<React.SetStateAction<boolean>>;
  jointAccountInfo?: JointAccountInfo;
  setJointAccountInfo?: React.Dispatch<React.SetStateAction<JointAccountInfo>>;
  jointTermsAccepted?: boolean;
  setJointTermsAccepted?: React.Dispatch<React.SetStateAction<boolean>>;
  verified: {
    pan: boolean;
    aadhar: boolean;
    gst: boolean;
    passport: boolean;
    jointPan: boolean;
    jointAadhar: boolean;
    jointGst: boolean;
    jointPassport: boolean;
  };
  setVerified: React.Dispatch<
    React.SetStateAction<{
      pan: boolean;
      aadhar: boolean;
      gst: boolean;
      passport: boolean;
      jointPan: boolean;
      jointAadhar: boolean;
      jointGst: boolean;
      jointPassport: boolean;
    }>
  >;
}

const UserInfoForm = ({
  userInfo,
  setUserInfo,
  termsAccepted,
  setTermsAccepted,
  isJointAccount = false,
  setIsJointAccount,
  jointAccountInfo,
  setJointAccountInfo,
  jointTermsAccepted,
  setJointTermsAccepted,
  verified,
  setVerified,
}: UserInfoFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState({
    pan: false,
    aadhar: false,
    gst: false,
    passport: false,
    jointPan: false,
    jointAadhar: false,
    jointGst: false,
    jointPassport: false,
  });
  const [errors, setErrors] = useState({
    pan: '',
    aadhar: '',
    gst: '',
    passport: '',
    jointPan: '',
    jointAadhar: '',
    jointGst: '',
    jointPassport: '',
  });
  const [aadharFile, setAadharFile] = useState<File | null>(null);
  const [jointAadharFile, setJointAadharFile] = useState<File | null>(null);

  const handleChange = (field: keyof UserInfo, value: string) => {
    setUserInfo((prev) => ({ ...prev, [field]: value }));
    // Reset verification status when field changes
    if (field === 'panNumber') setVerified((prev) => ({ ...prev, pan: false }));
    if (field === 'aadharNumber') setVerified((prev) => ({ ...prev, aadhar: false }));
    if (field === 'gstNumber') setVerified((prev) => ({ ...prev, gst: false }));
    if (field === 'passportNumber') setVerified((prev) => ({ ...prev, passport: false }));
    setErrors((prev) => ({
      ...prev,
      pan: field === 'panNumber' ? '' : prev.pan,
      aadhar: field === 'aadharNumber' ? '' : prev.aadhar,
      gst: field === 'gstNumber' ? '' : prev.gst,
      passport: field === 'passportNumber' ? '' : prev.passport,
    }));
  };

  const handleAddressChange = (type: 'present' | 'permanent', field: string, value: string) => {
    setUserInfo((prev) => ({
      ...prev,
      [`${type}Address`]: {
        ...prev[`${type}Address` as 'presentAddress' | 'permanentAddress'],
        [field]: value,
      },
    }));
  };

  const handleBankDetailsChange = (field: keyof UserInfo['accountDetails'], value: string) => {
    setUserInfo((prev) => ({
      ...prev,
      accountDetails: {
        ...prev.accountDetails,
        [field]: value,
      },
    }));
  };

  const handleSameAddressChange = (checked: boolean) => {
    setUserInfo((prev) => ({
      ...prev,
      sameAddress: checked,
      permanentAddress: checked ? { ...prev.presentAddress } : prev.permanentAddress,
    }));
  };

  const handleJointAccountChange = (field: keyof JointAccountInfo, value: string) => {
    if (setJointAccountInfo) {
      setJointAccountInfo((prev) => ({ ...prev, [field]: value }));
      // Reset verification status for joint account
      if (field === 'panNumber') setVerified((prev) => ({ ...prev, jointPan: false }));
      if (field === 'aadharNumber') setVerified((prev) => ({ ...prev, jointAadhar: false }));
      if (field === 'gstNumber') setVerified((prev) => ({ ...prev, jointGst: false }));
      if (field === 'passportNumber') setVerified((prev) => ({ ...prev, jointPassport: false }));
      setErrors((prev) => ({
        ...prev,
        jointPan: field === 'panNumber' ? '' : prev.jointPan,
        jointAadhar: field === 'aadharNumber' ? '' : prev.jointAadhar,
        jointGst: field === 'gstNumber' ? '' : prev.jointGst,
        jointPassport: field === 'passportNumber' ? '' : prev.jointPassport,
      }));
    }
  };

  const handleJointBankDetailsChange = (field: keyof JointAccountInfo['accountDetails'], value: string) => {
    if (setJointAccountInfo) {
      setJointAccountInfo((prev) => ({
        ...prev,
        accountDetails: {
          ...prev.accountDetails,
          [field]: value,
        },
      }));
    }
  };

const verifyPan = async (isJoint: boolean = false) => {
  const target = isJoint ? jointAccountInfo : userInfo;
  const key = isJoint ? 'jointPan' : 'pan';
  if (!target?.panNumber || !target?.firstName || !target?.lastName) {
    setErrors((prev) => ({ ...prev, [key]: 'PAN number and full name are required' }));
    toast({ title: 'Error', description: 'PAN number and full name are required', variant: 'destructive' });
    return;
  }
  setLoading((prev) => ({ ...prev, [key]: true }));
  try {
    const response = await fetch('http://127.0.0.1:8000/api/documents/verify-pan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pan_number: target.panNumber,
        full_name: `${target.firstName} ${target.lastName}`,
      }),
    });
    const data = await response.json();
    if (response.ok) {
      // Success: Assume OK status means verified, use backend message if available
      setVerified((prev) => ({ ...prev, [key]: true }));
      setErrors((prev) => ({ ...prev, [key]: '' }));
      toast({ 
        title: 'Success', 
        description: data.detail || 'PAN verified successfully' 
      });
    } else {
      // Error: Use backend detail for message
      setErrors((prev) => ({ ...prev, [key]: data.detail || 'PAN verification failed' }));
      toast({ 
        title: 'Error', 
        description: data.detail || 'PAN verification failed', 
        variant: 'destructive' 
      });
    }
  } catch (error) {
    setErrors((prev) => ({ ...prev, [key]: 'Error verifying PAN' }));
    toast({ title: 'Error', description: 'Error verifying PAN', variant: 'destructive' });
  } finally {
    setLoading((prev) => ({ ...prev, [key]: false }));
  }
};

  const verifyAadhar = async (isJoint: boolean = false) => {
    const target = isJoint ? jointAccountInfo : userInfo;
    const file = isJoint ? jointAadharFile : aadharFile;
    const key = isJoint ? 'jointAadhar' : 'aadhar';
    if (!target?.aadharNumber || !file) {
      setErrors((prev) => ({ ...prev, [key]: 'Aadhar number and file are required' }));
      toast({ title: 'Error', description: 'Aadhar number and file are required', variant: 'destructive' });
      return;
    }
    setLoading((prev) => ({ ...prev, [key]: true }));
    const formData = new FormData();
    formData.append('verification_id', target.aadharNumber);
    formData.append('image', file);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/documents/verify-aadhaar', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (response.ok && data.status === 'VALID') {
        setVerified((prev) => ({ ...prev, [key]: true }));
        setErrors((prev) => ({ ...prev, [key]: '' }));
        toast({ title: 'Success', description: 'Aadhar verified successfully' });
      } else {
        setErrors((prev) => ({ ...prev, [key]: data.message || 'Aadhar verification failed' }));
        toast({ title: 'Error', description: data.message || 'Aadhar verification failed', variant: 'destructive' });
      }
    } catch (error) {
      setErrors((prev) => ({ ...prev, [key]: 'Error verifying Aadhar' }));
      toast({ title: 'Error', description: 'Error verifying Aadhar', variant: 'destructive' });
    } finally {
      setLoading((prev) => ({ ...prev, [key]: false }));
    }
  };

  const verifyGST = async (isJoint: boolean = false) => {
    const target = isJoint ? jointAccountInfo : userInfo;
    const key = isJoint ? 'jointGst' : 'gst';
    if (!target?.gstNumber || !target?.businessName) {
      setErrors((prev) => ({ ...prev, [key]: 'GST number and business name are required' }));
      toast({ title: 'Error', description: 'GST number and business name are required', variant: 'destructive' });
      return;
    }
    setLoading((prev) => ({ ...prev, [key]: true }));
    try {
      const response = await fetch('http://127.0.0.1:8000/api/documents/verify-gstin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          GSTIN: target.gstNumber,
          business_name: target.businessName,
        }),
      });
      const data = await response.json();
      if (response.ok && data.valid) {
        setVerified((prev) => ({ ...prev, [key]: true }));
        setErrors((prev) => ({ ...prev, [key]: '' }));
        toast({ title: 'Success', description: 'GST verified successfully' });
      } else {
        setErrors((prev) => ({ ...prev, [key]: data.message || 'GST verification failed' }));
        toast({ title: 'Error', description: data.message || 'GST verification failed', variant: 'destructive' });
      }
    } catch (error) {
      setErrors((prev) => ({ ...prev, [key]: 'Error verifying GST' }));
      toast({ title: 'Error', description: 'Error verifying GST', variant: 'destructive' });
    } finally {
      setLoading((prev) => ({ ...prev, [key]: false }));
    }
  };

  const verifyPassport = async (isJoint: boolean = false) => {
    const target = isJoint ? jointAccountInfo : userInfo;
    const key = isJoint ? 'jointPassport' : 'passport';
    if (!target?.passportNumber || !target?.firstName || !target?.lastName || !target?.dob) {
      setErrors((prev) => ({ ...prev, [key]: 'Passport number, full name, and DOB are required' }));
      toast({ title: 'Error', description: 'Passport number, full name, and DOB are required', variant: 'destructive' });
      return;
    }
    setLoading((prev) => ({ ...prev, [key]: true }));
    try {
      const response = await fetch('http://127.0.0.1:8000/api/documents/verify-passport', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verification_id: `KBP${Date.now()}`,
          file_number: target.passportNumber,
          dob: target.dob,
          name: `${target.firstName} ${target.lastName}`,
        }),
      });
      const data = await response.json();
      if (response.ok && data.status === 'VALID') {
        setVerified((prev) => ({ ...prev, [key]: true }));
        setErrors((prev) => ({ ...prev, [key]: '' }));
        toast({ title: 'Success', description: 'Passport verified successfully' });
      } else {
        setErrors((prev) => ({ ...prev, [key]: data.message || 'Passport verification failed' }));
        toast({ title: 'Error', description: data.message || 'Passport verification failed', variant: 'destructive' });
      }
    } catch (error) {
      setErrors((prev) => ({ ...prev, [key]: 'Error verifying Passport' }));
      toast({ title: 'Error', description: 'Error verifying Passport', variant: 'destructive' });
    } finally {
      setLoading((prev) => ({ ...prev, [key]: false }));
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <User className="w-5 h-5 mr-2" />
              Personal Information (Primary Account Holder)
            </CardTitle>
            {setIsJointAccount && (
              <div className="flex items-center space-x-2">
                <Label htmlFor="joint-account" className="text-sm font-medium">
                  Joint Account
                </Label>
                <Switch
                  id="joint-account"
                  checked={isJointAccount}
                  onCheckedChange={setIsJointAccount}
                />
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={userInfo.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                placeholder="Enter your first name"
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={userInfo.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                placeholder="Enter your last name"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dob">Date of Birth *</Label>
              <Input
                id="dob"
                type="date"
                value={userInfo.dob}
                onChange={(e) => handleChange('dob', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="gender">Gender *</Label>
              <Select value={userInfo.gender} onValueChange={(value: 'male' | 'female' | 'other') => handleChange('gender', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={userInfo.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="Enter your email"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                value={userInfo.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="Enter your phone number"
              />
            </div>
          </div>

          <div>
            <Label>Present Address *</Label>
            <div className="space-y-4 mt-2">
              <Textarea
                placeholder="Street Address"
                value={userInfo.presentAddress.street}
                onChange={(e) => handleAddressChange('present', 'street', e.target.value)}
              />
              <div className="grid md:grid-cols-3 gap-4">
                <Input
                  placeholder="City"
                  value={userInfo.presentAddress.city}
                  onChange={(e) => handleAddressChange('present', 'city', e.target.value)}
                />
                <Select value={userInfo.presentAddress.state} onValueChange={(value) => handleAddressChange('present', 'state', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="telangana">Telangana</SelectItem>
                    <SelectItem value="andhra-pradesh">Andhra Pradesh</SelectItem>
                    <SelectItem value="karnataka">Karnataka</SelectItem>
                    <SelectItem value="tamil-nadu">Tamil Nadu</SelectItem>
                    <SelectItem value="kerala">Kerala</SelectItem>
                    <SelectItem value="maharashtra">Maharashtra</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Pincode"
                  value={userInfo.presentAddress.pincode}
                  onChange={(e) => handleAddressChange('present', 'pincode', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="sameAddress"
              checked={userInfo.sameAddress}
              onCheckedChange={(checked) => handleSameAddressChange(checked as boolean)}
            />
            <Label htmlFor="sameAddress">Permanent address same as present</Label>
          </div>

          {!userInfo.sameAddress && (
            <div>
              <Label>Permanent Address *</Label>
              <div className="space-y-4 mt-2">
                <Textarea
                  placeholder="Street Address"
                  value={userInfo.permanentAddress.street}
                  onChange={(e) => handleAddressChange('permanent', 'street', e.target.value)}
                />
                <div className="grid md:grid-cols-3 gap-4">
                  <Input
                    placeholder="City"
                    value={userInfo.permanentAddress.city}
                    onChange={(e) => handleAddressChange('permanent', 'city', e.target.value)}
                  />
                  <Select value={userInfo.permanentAddress.state} onValueChange={(value) => handleAddressChange('permanent', 'state', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="telangana">Telangana</SelectItem>
                      <SelectItem value="andhra-pradesh">Andhra Pradesh</SelectItem>
                      <SelectItem value="karnataka">Karnataka</SelectItem>
                      <SelectItem value="tamil-nadu">Tamil Nadu</SelectItem>
                      <SelectItem value="kerala">Kerala</SelectItem>
                      <SelectItem value="maharashtra">Maharashtra</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Pincode"
                    value={userInfo.permanentAddress.pincode}
                    onChange={(e) => handleAddressChange('permanent', 'pincode', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="occupation">Occupation</Label>
              <Input
                id="occupation"
                value={userInfo.occupation}
                onChange={(e) => handleChange('occupation', e.target.value)}
                placeholder="Enter your occupation"
              />
            </div>
            <div>
              <Label htmlFor="annualIncome">Annual Income</Label>
              <Select value={userInfo.annualIncome} onValueChange={(value) => handleChange('annualIncome', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select annual income" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="below-5lakh">Below ₹5 Lakh</SelectItem>
                  <SelectItem value="5-10lakh">₹5 - ₹10 Lakh</SelectItem>
                  <SelectItem value="10-25lakh">₹10 - ₹25 Lakh</SelectItem>
                  <SelectItem value="25-50lakh">₹25 - ₹50 Lakh</SelectItem>
                  <SelectItem value="50lakh-1crore">₹50 Lakh - ₹1 Crore</SelectItem>
                  <SelectItem value="above-1crore">Above ₹1 Crore</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="userType">User Type *</Label>
            <Select value={userInfo.userType} onValueChange={(value: 'individual' | 'business' | 'nri') => handleChange('userType', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select user type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="individual">Individual</SelectItem>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="nri">NRI</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {userInfo.userType === 'individual' && (
              <>
                <div>
                  <Label htmlFor="panNumber">PAN Number *</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="panNumber"
                      value={userInfo.panNumber}
                      onChange={(e) => handleChange('panNumber', e.target.value.toUpperCase())}
                      placeholder="Enter PAN number"
                      className={errors.pan ? 'border-red-500' : ''}
                    />
                    <Button
                      onClick={() => verifyPan()}
                      disabled={loading.pan || !userInfo.panNumber || !userInfo.firstName || !userInfo.lastName}
                      className="flex items-center gap-2"
                    >
                      {loading.pan ? 'Verifying...' : verified.pan ? <CheckCircle className="w-4 h-4 text-green-500" /> : 'Verify'}
                    </Button>
                  </div>
                  {errors.pan && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" /> {errors.pan}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="aadharNumber">Aadhar Number *</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="aadharNumber"
                      value={userInfo.aadharNumber}
                      onChange={(e) => handleChange('aadharNumber', e.target.value)}
                      placeholder="Enter Aadhar number"
                      className={errors.aadhar ? 'border-red-500' : ''}
                    />
                    <Button
                      onClick={() => verifyAadhar()}
                      disabled={loading.aadhar || !userInfo.aadharNumber || !aadharFile}
                      className="flex items-center gap-2"
                    >
                      {loading.aadhar ? 'Verifying...' : verified.aadhar ? <CheckCircle className="w-4 h-4 text-green-500" /> : 'Verify'}
                    </Button>
                  </div>
                  <Input
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setAadharFile(file);
                    }}
                    className="mt-2"
                  />
                  {errors.aadhar && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" /> {errors.aadhar}
                    </p>
                  )}
                </div>
              </>
            )}
            {userInfo.userType === 'business' && (
              <>
                <div>
                  <Label htmlFor="businessName">Business Name *</Label>
                  <Input
                    id="businessName"
                    value={userInfo.businessName || ''}
                    onChange={(e) => handleChange('businessName', e.target.value)}
                    placeholder="Enter business name"
                  />
                </div>
                <div>
                  <Label htmlFor="gstNumber">GST Number *</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="gstNumber"
                      value={userInfo.gstNumber}
                      onChange={(e) => handleChange('gstNumber', e.target.value.toUpperCase())}
                      placeholder="Enter GST number"
                      className={errors.gst ? 'border-red-500' : ''}
                    />
                    <Button
                      onClick={() => verifyGST()}
                      disabled={loading.gst || !userInfo.gstNumber || !userInfo.businessName}
                      className="flex items-center gap-2"
                    >
                      {loading.gst ? 'Verifying...' : verified.gst ? <CheckCircle className="w-4 h-4 text-green-500" /> : 'Verify'}
                    </Button>
                  </div>
                  {errors.gst && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" /> {errors.gst}
                    </p>
                  )}
                </div>
              </>
            )}
            {userInfo.userType === 'nri' && (
              <div>
                <Label htmlFor="passportNumber">Passport Number *</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="passportNumber"
                    value={userInfo.passportNumber}
                    onChange={(e) => handleChange('passportNumber', e.target.value)}
                    placeholder="Enter Passport number"
                    className={errors.passport ? 'border-red-500' : ''}
                  />
                  <Button
                    onClick={() => verifyPassport()}
                    disabled={loading.passport || !userInfo.passportNumber || !userInfo.firstName || !userInfo.lastName || !userInfo.dob}
                    className="flex items-center gap-2"
                  >
                    {loading.passport ? 'Verifying...' : verified.passport ? <CheckCircle className="w-4 h-4 text-green-500" /> : 'Verify'}
                  </Button>
                </div>
                {errors.passport && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> {errors.passport}
                  </p>
                )}
              </div>
            )}
          </div>

          <div>
            <Label>Bank Account Details *</Label>
            <div className="space-y-4 mt-2">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="accountHolderName">Account Holder Name *</Label>
                  <Input
                    id="accountHolderName"
                    value={userInfo.accountDetails.accountHolderName}
                    onChange={(e) => handleBankDetailsChange('accountHolderName', e.target.value)}
                    placeholder="Enter account holder name"
                  />
                </div>
                <div>
                  <Label htmlFor="bankAccountName">Bank Name *</Label>
                  <Input
                    id="bankAccountName"
                    value={userInfo.accountDetails.bankAccountName}
                    onChange={(e) => handleBankDetailsChange('bankAccountName', e.target.value)}
                    placeholder="Enter bank name"
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="accountNumber">Account Number *</Label>
                  <Input
                    id="accountNumber"
                    value={userInfo.accountDetails.accountNumber}
                    onChange={(e) => handleBankDetailsChange('accountNumber', e.target.value)}
                    placeholder="Enter account number"
                  />
                </div>
                <div>
                  <Label htmlFor="ifscCode">IFSC Code *</Label>
                  <Input
                    id="ifscCode"
                    value={userInfo.accountDetails.ifscCode}
                    onChange={(e) => handleBankDetailsChange('ifscCode', e.target.value.toUpperCase())}
                    placeholder="Enter IFSC code"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                checked={termsAccepted}
                onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
              />
              <Label htmlFor="terms" className="text-sm">
                I agree to the{" "}
                <button className="text-primary hover:underline">Terms and Conditions</button>
                {" "}and{" "}
                <button className="text-primary hover:underline">Privacy Policy</button>
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {isJointAccount && jointAccountInfo && setJointAccountInfo && setJointTermsAccepted && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Joint Account Holder Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="joint-firstName">First Name *</Label>
                <Input
                  id="joint-firstName"
                  value={jointAccountInfo.firstName}
                  onChange={(e) => handleJointAccountChange('firstName', e.target.value)}
                  placeholder="Enter first name"
                />
              </div>
              <div>
                <Label htmlFor="joint-lastName">Last Name *</Label>
                <Input
                  id="joint-lastName"
                  value={jointAccountInfo.lastName}
                  onChange={(e) => handleJointAccountChange('lastName', e.target.value)}
                  placeholder="Enter last name"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="joint-dob">Date of Birth *</Label>
                <Input
                  id="joint-dob"
                  type="date"
                  value={jointAccountInfo.dob}
                  onChange={(e) => handleJointAccountChange('dob', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="joint-gender">Gender *</Label>
                <Select value={jointAccountInfo.gender} onValueChange={(value: 'male' | 'female' | 'other') => handleJointAccountChange('gender', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="joint-email">Email Address *</Label>
                <Input
                  id="joint-email"
                  type="email"
                  value={jointAccountInfo.email}
                  onChange={(e) => handleJointAccountChange('email', e.target.value)}
                  placeholder="Enter email"
                />
              </div>
              <div>
                <Label htmlFor="joint-phone">Phone Number *</Label>
                <Input
                  id="joint-phone"
                  value={jointAccountInfo.phone}
                  onChange={(e) => handleJointAccountChange('phone', e.target.value)}
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="joint-userType">User Type *</Label>
              <Select value={jointAccountInfo.userType} onValueChange={(value: 'individual' | 'business' | 'nri') => handleJointAccountChange('userType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select user type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Individual</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="nri">NRI</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {jointAccountInfo.userType === 'individual' && (
                <>
                  <div>
                    <Label htmlFor="joint-panNumber">PAN Number *</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="joint-panNumber"
                        value={jointAccountInfo.panNumber}
                        onChange={(e) => handleJointAccountChange('panNumber', e.target.value.toUpperCase())}
                        placeholder="Enter PAN number"
                        className={errors.jointPan ? 'border-red-500' : ''}
                      />
                      <Button
                        onClick={() => verifyPan(true)}
                        disabled={loading.jointPan || !jointAccountInfo.panNumber || !jointAccountInfo.firstName || !jointAccountInfo.lastName}
                        className="flex items-center gap-2"
                      >
                        {loading.jointPan ? 'Verifying...' : verified.jointPan ? <CheckCircle className="w-4 h-4 text-green-500" /> : 'Verify'}
                      </Button>
                    </div>
                    {errors.jointPan && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" /> {errors.jointPan}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="joint-aadharNumber">Aadhar Number *</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="joint-aadharNumber"
                        value={jointAccountInfo.aadharNumber}
                        onChange={(e) => handleJointAccountChange('aadharNumber', e.target.value)}
                        placeholder="Enter Aadhar number"
                        className={errors.jointAadhar ? 'border-red-500' : ''}
                      />
                      <Button
                        onClick={() => verifyAadhar(true)}
                        disabled={loading.jointAadhar || !jointAccountInfo.aadharNumber || !jointAadharFile}
                        className="flex items-center gap-2"
                      >
                        {loading.jointAadhar ? 'Verifying...' : verified.jointAadhar ? <CheckCircle className="w-4 h-4 text-green-500" /> : 'Verify'}
                      </Button>
                    </div>
                    <Input
                      type="file"
                      accept="image/jpeg,image/png"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setJointAadharFile(file);
                      }}
                      className="mt-2"
                    />
                    {errors.jointAadhar && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" /> {errors.jointAadhar}
                      </p>
                    )}
                  </div>
                </>
              )}
              {jointAccountInfo.userType === 'business' && (
                <>
                  <div>
                    <Label htmlFor="joint-businessName">Business Name *</Label>
                    <Input
                      id="joint-businessName"
                      value={jointAccountInfo.businessName || ''}
                      onChange={(e) => handleJointAccountChange('businessName', e.target.value)}
                      placeholder="Enter business name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="joint-gstNumber">GST Number *</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="joint-gstNumber"
                        value={jointAccountInfo.gstNumber}
                        onChange={(e) => handleJointAccountChange('gstNumber', e.target.value.toUpperCase())}
                        placeholder="Enter GST number"
                        className={errors.jointGst ? 'border-red-500' : ''}
                      />
                      <Button
                        onClick={() => verifyGST(true)}
                        disabled={loading.jointGst || !jointAccountInfo.gstNumber || !jointAccountInfo.businessName}
                        className="flex items-center gap-2"
                      >
                        {loading.jointGst ? 'Verifying...' : verified.jointGst ? <CheckCircle className="w-4 h-4 text-green-500" /> : 'Verify'}
                      </Button>
                    </div>
                    {errors.jointGst && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" /> {errors.jointGst}
                      </p>
                    )}
                  </div>
                </>
              )}
              {jointAccountInfo.userType === 'nri' && (
                <div>
                  <Label htmlFor="joint-passportNumber">Passport Number *</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="joint-passportNumber"
                      value={jointAccountInfo.passportNumber}
                      onChange={(e) => handleJointAccountChange('passportNumber', e.target.value)}
                      placeholder="Enter Passport number"
                      className={errors.jointPassport ? 'border-red-500' : ''}
                    />
                    <Button
                      onClick={() => verifyPassport(true)}
                      disabled={loading.jointPassport || !jointAccountInfo.passportNumber || !jointAccountInfo.firstName || !jointAccountInfo.lastName || !jointAccountInfo.dob}
                      className="flex items-center gap-2"
                    >
                      {loading.jointPassport ? 'Verifying...' : verified.jointPassport ? <CheckCircle className="w-4 h-4 text-green-500" /> : 'Verify'}
                    </Button>
                  </div>
                  {errors.jointPassport && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" /> {errors.jointPassport}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div>
              <Label>Bank Account Details *</Label>
              <div className="space-y-4 mt-2">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="joint-accountHolderName">Account Holder Name *</Label>
                    <Input
                      id="joint-accountHolderName"
                      value={jointAccountInfo.accountDetails.accountHolderName}
                      onChange={(e) => handleJointBankDetailsChange('accountHolderName', e.target.value)}
                      placeholder="Enter account holder name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="joint-bankAccountName">Bank Name *</Label>
                    <Input
                      id="joint-bankAccountName"
                      value={jointAccountInfo.accountDetails.bankAccountName}
                      onChange={(e) => handleJointBankDetailsChange('bankAccountName', e.target.value)}
                      placeholder="Enter bank name"
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="joint-accountNumber">Account Number *</Label>
                    <Input
                      id="joint-accountNumber"
                      value={jointAccountInfo.accountDetails.accountNumber}
                      onChange={(e) => handleJointBankDetailsChange('accountNumber', e.target.value)}
                      placeholder="Enter account number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="joint-ifscCode">IFSC Code *</Label>
                    <Input
                      id="joint-ifscCode"
                      value={jointAccountInfo.accountDetails.ifscCode}
                      onChange={(e) => handleJointBankDetailsChange('ifscCode', e.target.value.toUpperCase())}
                      placeholder="Enter IFSC code"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="joint-terms"
                  checked={jointTermsAccepted}
                  onCheckedChange={(checked) => setJointTermsAccepted(checked as boolean)}
                />
                <Label htmlFor="joint-terms" className="text-sm">
                  I agree to the{" "}
                  <button className="text-primary hover:underline">Terms and Conditions</button>
                  {" "}and{" "}
                  <button className="text-primary hover:underline">Privacy Policy</button>
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default UserInfoForm;