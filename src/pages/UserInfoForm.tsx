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
import { useAuth } from "@/contexts/AuthContext";

// Validation patterns matching backend
const VALIDATION_PATTERNS = {
  PAN: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
  AADHAAR: /^\d{12}$/,
  GSTIN: /^[0-9A-Z]{15}$/,
  PASSPORT: /^[A-Z0-9]{6,12}$/,
  PHONE: /^\+?\d{1,3}[-.\s]?\d{6,10}$/,
  ACCOUNT_NUMBER: /^\d{9,18}$/,
  IFSC: /^[A-Z]{4}0[A-Z0-9]{6}$/,
};

interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
}

interface AccountDetails {
  account_holder_name: string;
  bank_account_name: string;
  account_number: string;
  ifsc_code: string;
}

interface UserInfo {
  surname: string;
  name: string;
  dob: string;
  gender: 'male' | 'female' | 'other';
  present_address: Address;
  permanent_address: Address;
  occupation: string;
  annual_income: string;
  user_type: 'individual' | 'business' | 'NRI';
  pan_number: string;
  aadhar_number: string;
  gst_number: string;
  passport_number: string;
  phone_number: string;
  email: string;
  account_details: AccountDetails;
  sameAddress: boolean;
}

interface JointAccountInfo {
  surname: string;
  name: string;
  dob: string;
  gender: 'male' | 'female' | 'other';
  email: string;
  phone_number: string;
  user_type: 'individual' | 'business' | 'NRI';
  pan_number: string;
  aadhar_number: string;
  gst_number: string;
  passport_number: string;
  account_details: AccountDetails;
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
  const { getToken } = useAuth();

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

  // Validation functions matching backend
  const validatePAN = (pan: string): boolean => {
    return VALIDATION_PATTERNS.PAN.test(pan);
  };

  const validateAadhaar = (aadhaar: string): boolean => {
    return VALIDATION_PATTERNS.AADHAAR.test(aadhaar);
  };

  const validateGSTIN = (gstin: string): boolean => {
    return VALIDATION_PATTERNS.GSTIN.test(gstin);
  };

  const validatePassport = (passport: string): boolean => {
    return VALIDATION_PATTERNS.PASSPORT.test(passport);
  };

  const validatePhone = (phone: string): boolean => {
    return VALIDATION_PATTERNS.PHONE.test(phone);
  };

  const validateAccountNumber = (accountNumber: string): boolean => {
    return VALIDATION_PATTERNS.ACCOUNT_NUMBER.test(accountNumber);
  };

  const validateIFSC = (ifsc: string): boolean => {
    return VALIDATION_PATTERNS.IFSC.test(ifsc);
  };

  const validateUserTypeFields = (userType: string, fields: any): string[] => {
    const validationErrors: string[] = [];

    if (userType === 'individual') {
      if (!fields.pan_number || !validatePAN(fields.pan_number)) {
        validationErrors.push('Valid PAN number is required for individual user type');
      }
      if (!fields.aadhar_number || !validateAadhaar(fields.aadhar_number)) {
        validationErrors.push('Valid Aadhaar number is required for individual user type');
      }
      if (fields.gst_number) {
        validationErrors.push('GST number should not be provided for individual user type');
      }
      if (fields.passport_number) {
        validationErrors.push('Passport number should not be provided for individual user type');
      }
    } else if (userType === 'business') {
      if (!fields.gst_number || !validateGSTIN(fields.gst_number)) {
        validationErrors.push('Valid GST number is required for business user type');
      }
      if (fields.pan_number) {
        validationErrors.push('PAN number should not be provided for business user type');
      }
      if (fields.aadhar_number) {
        validationErrors.push('Aadhaar number should not be provided for business user type');
      }
      if (fields.passport_number) {
        validationErrors.push('Passport number should not be provided for business user type');
      }
    } else if (userType === 'NRI') {
      if (!fields.passport_number || !validatePassport(fields.passport_number)) {
        validationErrors.push('Valid passport number is required for NRI user type');
      }
      if (fields.pan_number) {
        validationErrors.push('PAN number should not be provided for NRI user type');
      }
      if (fields.aadhar_number) {
        validationErrors.push('Aadhaar number should not be provided for NRI user type');
      }
      if (fields.gst_number) {
        validationErrors.push('GST number should not be provided for NRI user type');
      }
    }

    return validationErrors;
  };

  const handleChange = (field: keyof UserInfo, value: string) => {
    setUserInfo((prev) => ({ ...prev, [field]: value }));

    // Reset verification status when field changes
    if (field === 'pan_number') setVerified((prev) => ({ ...prev, pan: false }));
    if (field === 'aadhar_number') setVerified((prev) => ({ ...prev, aadhar: false }));
    if (field === 'gst_number') setVerified((prev) => ({ ...prev, gst: false }));
    if (field === 'passport_number') setVerified((prev) => ({ ...prev, passport: false }));

    setErrors((prev) => ({
      ...prev,
      pan: field === 'pan_number' ? '' : prev.pan,
      aadhar: field === 'aadhar_number' ? '' : prev.aadhar,
      gst: field === 'gst_number' ? '' : prev.gst,
      passport: field === 'passport_number' ? '' : prev.passport,
    }));
  };

  const handleAddressChange = (type: 'present' | 'permanent', field: string, value: string) => {
    setUserInfo((prev) => ({
      ...prev,
      [`${type}_address`]: {
        ...prev[`${type}_address` as 'present_address' | 'permanent_address'],
        [field]: value,
      },
    }));
  };

  const handleBankDetailsChange = (field: keyof AccountDetails, value: string) => {
    setUserInfo((prev) => ({
      ...prev,
      account_details: {
        ...prev.account_details,
        [field]: value,
      },
    }));
  };

  const handleSameAddressChange = (checked: boolean) => {
    setUserInfo((prev) => ({
      ...prev,
      sameAddress: checked,
      permanent_address: checked ? { ...prev.present_address } : prev.permanent_address,
    }));
  };

  const handleJointAccountChange = (field: keyof JointAccountInfo, value: string) => {
    if (setJointAccountInfo) {
      setJointAccountInfo((prev) => ({ ...prev, [field]: value }));
      // Reset verification status for joint account
      if (field === 'pan_number') setVerified((prev) => ({ ...prev, jointPan: false }));
      if (field === 'aadhar_number') setVerified((prev) => ({ ...prev, jointAadhar: false }));
      if (field === 'gst_number') setVerified((prev) => ({ ...prev, jointGst: false }));
      if (field === 'passport_number') setVerified((prev) => ({ ...prev, jointPassport: false }));
      setErrors((prev) => ({
        ...prev,
        jointPan: field === 'pan_number' ? '' : prev.jointPan,
        jointAadhar: field === 'aadhar_number' ? '' : prev.jointAadhar,
        jointGst: field === 'gst_number' ? '' : prev.jointGst,
        jointPassport: field === 'passport_number' ? '' : prev.jointPassport,
      }));
    }
  };

  const handleJointBankDetailsChange = (field: keyof AccountDetails, value: string) => {
    if (setJointAccountInfo) {
      setJointAccountInfo((prev) => ({
        ...prev,
        account_details: {
          ...prev.account_details,
          [field]: value,
        },
      }));
    }
  };

const verifyPan = async (isJoint: boolean = false) => {
  const token = getToken();
  if (!token) {
    setErrors((prev) => ({ ...prev, [isJoint ? 'jointPan' : 'pan']: 'Authentication token not found' }));
    toast({ title: 'Error', description: 'Please log in again', variant: 'destructive' });
    return;
  }

  const target = isJoint ? jointAccountInfo : userInfo;
  const key = isJoint ? 'jointPan' : 'pan';

  // Frontend validation
  if (!target?.pan_number) {
    setErrors((prev) => ({ ...prev, [key]: 'PAN number is required' }));
    toast({ title: 'Error', description: 'PAN number is required', variant: 'destructive' });
    return;
  }

  if (!validatePAN(target.pan_number)) {
    setErrors((prev) => ({ ...prev, [key]: 'Invalid PAN format' }));
    toast({ title: 'Error', description: 'Invalid PAN number format', variant: 'destructive' });
    return;
  }

  if (!target?.name || !target?.surname) {
    setErrors((prev) => ({ ...prev, [key]: 'Full name is required for PAN verification' }));
    toast({ title: 'Error', description: 'Full name is required', variant: 'destructive' });
    return;
  }

  setLoading((prev) => ({ ...prev, [key]: true }));
  try {
    const response = await fetch('http://127.0.0.1:8000/api/documents/verify-pan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        pan_number: target.pan_number,
        full_name: `${target.name} ${target.surname}`,
      }),
    });

    const data = await response.json();
    console.log("PAN verify response:", data);

    // ✅ FIXED: Check for data.detail instead of data.pan_status
    if (response.ok && data.detail === 'PAN verified successfully') {
      setVerified((prev) => ({ ...prev, [key]: true }));
      setErrors((prev) => ({ ...prev, [key]: '' }));
      toast({ 
        title: 'Success', 
        description: 'PAN verified successfully',
        variant: 'default'
      });
    } else {
      const errorMsg = data.message || data.detail || 'PAN verification failed';
      setErrors((prev) => ({ ...prev, [key]: errorMsg }));
      toast({ title: 'Error', description: errorMsg, variant: 'destructive' });
    }
    
  } catch (error) {
    setErrors((prev) => ({ ...prev, [key]: 'Error verifying PAN' }));
    toast({ title: 'Error', description: 'Error verifying PAN', variant: 'destructive' });
  } finally {
    setLoading((prev) => ({ ...prev, [key]: false }));
  }
};


  const verifyAadhar = async (isJoint: boolean = false) => {
    const token = getToken();
    if (!token) {
      setErrors((prev) => ({ ...prev, [isJoint ? 'jointAadhar' : 'aadhar']: 'Authentication token not found' }));
      toast({ title: 'Error', description: 'Please log in again', variant: 'destructive' });
      return;
    }

    const target = isJoint ? jointAccountInfo : userInfo;
    const file = isJoint ? jointAadharFile : aadharFile;
    const key = isJoint ? 'jointAadhar' : 'aadhar';

    // Frontend validation matching backend
    if (!target?.aadhar_number) {
      setErrors((prev) => ({ ...prev, [key]: 'Aadhaar number is required' }));
      toast({ title: 'Error', description: 'Aadhaar number is required', variant: 'destructive' });
      return;
    }

    if (!validateAadhaar(target.aadhar_number)) {
      setErrors((prev) => ({ ...prev, [key]: 'Aadhaar number must be exactly 12 digits' }));
      toast({ title: 'Error', description: 'Invalid Aadhaar number format', variant: 'destructive' });
      return;
    }

    if (!file) {
      setErrors((prev) => ({ ...prev, [key]: 'Aadhaar document image is required' }));
      toast({ title: 'Error', description: 'Aadhaar document image is required', variant: 'destructive' });
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      setErrors((prev) => ({ ...prev, [key]: 'Aadhaar document must be an image file' }));
      toast({ title: 'Error', description: 'Aadhaar document must be an image file', variant: 'destructive' });
      return;
    }

    setLoading((prev) => ({ ...prev, [key]: true }));
    const formData = new FormData();
    formData.append('verification_id', target.aadhar_number);
    formData.append('image', file);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/documents/verify-aadhaar', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.status === 'VALID') {
        setVerified((prev) => ({ ...prev, [key]: true }));
        setErrors((prev) => ({ ...prev, [key]: '' }));
        toast({ title: 'Success', description: 'Aadhaar verified successfully' });
      } else {
        const errorMsg = data.message || data.detail || 'Aadhaar verification failed';
        setErrors((prev) => ({ ...prev, [key]: errorMsg }));
        toast({ title: 'Error', description: errorMsg, variant: 'destructive' });
      }
    } catch (error) {
      setErrors((prev) => ({ ...prev, [key]: 'Error verifying Aadhaar' }));
      toast({ title: 'Error', description: 'Error verifying Aadhaar', variant: 'destructive' });
    } finally {
      setLoading((prev) => ({ ...prev, [key]: false }));
    }
  };

const verifyGST = async (isJoint: boolean = false) => {
  const token = getToken();
  if (!token) {
    setErrors((prev) => ({ ...prev, [isJoint ? 'jointGst' : 'gst']: 'Authentication token not found' }));
    toast({ title: 'Error', description: 'Please log in again', variant: 'destructive' });
    return;
  }

  const target = isJoint ? jointAccountInfo : userInfo;
  const key = isJoint ? 'jointGst' : 'gst';

  // Frontend validation matching backend
  if (!target?.gst_number) {
    setErrors((prev) => ({ ...prev, [key]: 'GST number is required' }));
    toast({ title: 'Error', description: 'GST number is required', variant: 'destructive' });
    return;
  }

  if (!validateGSTIN(target.gst_number)) {
    setErrors((prev) => ({ ...prev, [key]: 'GST number must be 15 alphanumeric characters' }));
    toast({ title: 'Error', description: 'Invalid GST number format', variant: 'destructive' });
    return;
  }

  setLoading((prev) => ({ ...prev, [key]: true }));
  try {
    const response = await fetch('http://127.0.0.1:8000/api/documents/verify-gstin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        GSTIN: target.gst_number, // ✅ CORRECT: Uppercase "GSTIN" (not "gstin")
        business_name: target.name, // ✅ CORRECT: Lowercase "business_name"
      }),
    });

    const data = await response.json();
    console.log("GST verify response:", data);

    if (response.ok && data.valid) {
      setVerified((prev) => ({ ...prev, [key]: true }));
      setErrors((prev) => ({ ...prev, [key]: '' }));
      toast({ title: 'Success', description: 'GST verified successfully' });
    } else {
      const errorMsg = data.message || data.detail || 'GST verification failed';
      setErrors((prev) => ({ ...prev, [key]: errorMsg }));
      toast({ title: 'Error', description: errorMsg, variant: 'destructive' });
    }
  } catch (error) {
    setErrors((prev) => ({ ...prev, [key]: 'Error verifying GST' }));
    toast({ title: 'Error', description: 'Error verifying GST', variant: 'destructive' });
  } finally {
    setLoading((prev) => ({ ...prev, [key]: false }));
  }
};

const verifyPassport = async (isJoint: boolean = false) => {
  const token = getToken();
  if (!token) {
    setErrors((prev) => ({ ...prev, [isJoint ? 'jointPassport' : 'passport']: 'Authentication token not found' }));
    toast({ title: 'Error', description: 'Please log in again', variant: 'destructive' });
    return;
  }

  const target = isJoint ? jointAccountInfo : userInfo;
  const key = isJoint ? 'jointPassport' : 'passport';

  // Frontend validation matching backend
  if (!target?.passport_number) {
    setErrors((prev) => ({ ...prev, [key]: 'Passport number is required' }));
    toast({ title: 'Error', description: 'Passport number is required', variant: 'destructive' });
    return;
  }

  if (!validatePassport(target.passport_number)) {
    setErrors((prev) => ({ ...prev, [key]: 'Passport number must be 6-12 alphanumeric characters' }));
    toast({ title: 'Error', description: 'Invalid passport number format', variant: 'destructive' });
    return;
  }

  if (!target?.name || !target?.surname || !target?.dob) {
    setErrors((prev) => ({ ...prev, [key]: 'Full name and date of birth are required for passport verification' }));
    toast({ title: 'Error', description: 'Full name and date of birth are required', variant: 'destructive' });
    return;
  }

  setLoading((prev) => ({ ...prev, [key]: true }));
  try {
    // ✅ FIX: Pad passport number to 15 characters with zeros
    const paddedPassportNumber = target.passport_number.padEnd(15, '0');
    
    console.log("🔄 Sending Passport verification:", {
      original_passport: target.passport_number,
      padded_passport: paddedPassportNumber,
      length: paddedPassportNumber.length
    });

    const response = await fetch('http://127.0.0.1:8000/api/documents/verify-passport', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        verification_id: `KBP${Date.now()}`,
        file_number: paddedPassportNumber, // ✅ Now 15 characters
        dob: target.dob,
        name: `${target.name} ${target.surname}`,
      }),
    });

    const data = await response.json();
    console.log("📥 Passport verify response:", data);

    if (response.ok && data.status === 'VALID') {
      setVerified((prev) => ({ ...prev, [key]: true }));
      setErrors((prev) => ({ ...prev, [key]: '' }));
      toast({ title: 'Success', description: 'Passport verified successfully' });
    } else {
      const errorMsg = data.message || data.detail || 'Passport verification failed';
      setErrors((prev) => ({ ...prev, [key]: errorMsg }));
      toast({ title: 'Error', description: errorMsg, variant: 'destructive' });
    }
  } catch (error) {
    setErrors((prev) => ({ ...prev, [key]: 'Error verifying Passport' }));
    toast({ title: 'Error', description: 'Error verifying Passport', variant: 'destructive' });
  } finally {
    setLoading((prev) => ({ ...prev, [key]: false }));
  }
};

  // Real-time validation for fields
  const validateField = (field: string, value: string): string => {
    switch (field) {
      case 'pan_number':
        return value && !validatePAN(value) ? 'PAN must be exactly 10 characters (ABCDE1234F)' : '';
      case 'aadhar_number':
        return value && !validateAadhaar(value) ? 'Aadhaar must be exactly 12 digits' : '';
      case 'gst_number':
        return value && !validateGSTIN(value) ? 'GSTIN must be 15 alphanumeric characters' : '';
      case 'passport_number':
        return value && !validatePassport(value) ? 'Passport must be 6-12 alphanumeric characters' : '';
      case 'phone_number':
        return value && !validatePhone(value) ? 'Phone must be in international format (+91 XXXXXXXXXX)' : '';
      case 'account_number':
        return value && !validateAccountNumber(value) ? 'Account number must be 9-18 digits' : '';
      case 'ifsc_code':
        return value && !validateIFSC(value) ? 'IFSC must be 11 characters (BANK0XXXXXX)' : '';
      default:
        return '';
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
              <Label htmlFor="name">First Name *</Label>
              <Input
                id="name"
                value={userInfo.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Enter your first name"
              />
            </div>
            <div>
              <Label htmlFor="surname">Last Name *</Label>
              <Input
                id="surname"
                value={userInfo.surname}
                onChange={(e) => handleChange('surname', e.target.value)}
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
              <Label htmlFor="phone_number">Phone Number *</Label>
              <Input
                id="phone_number"
                value={userInfo.phone_number}
                onChange={(e) => handleChange('phone_number', e.target.value)}
                placeholder="+91 9876543210"
                className={validateField('phone_number', userInfo.phone_number) ? 'border-red-500' : ''}
              />
              {validateField('phone_number', userInfo.phone_number) && (
                <p className="text-red-500 text-xs mt-1">{validateField('phone_number', userInfo.phone_number)}</p>
              )}
            </div>
          </div>

          <div>
            <Label>Present Address *</Label>
            <div className="space-y-4 mt-2">
              <Textarea
                placeholder="Street Address"
                value={userInfo.present_address.street}
                onChange={(e) => handleAddressChange('present', 'street', e.target.value)}
              />
              <div className="grid md:grid-cols-3 gap-4">
                <Input
                  placeholder="City"
                  value={userInfo.present_address.city}
                  onChange={(e) => handleAddressChange('present', 'city', e.target.value)}
                />
                <Select value={userInfo.present_address.state} onValueChange={(value) => handleAddressChange('present', 'state', value)}>
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
                  value={userInfo.present_address.postal_code}
                  onChange={(e) => handleAddressChange('present', 'postal_code', e.target.value)}
                />
              </div>
              <Input
                placeholder="Country"
                value={userInfo.present_address.country}
                onChange={(e) => handleAddressChange('present', 'country', e.target.value)}
                defaultValue="India"
              />
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
                  value={userInfo.permanent_address.street}
                  onChange={(e) => handleAddressChange('permanent', 'street', e.target.value)}
                />
                <div className="grid md:grid-cols-3 gap-4">
                  <Input
                    placeholder="City"
                    value={userInfo.permanent_address.city}
                    onChange={(e) => handleAddressChange('permanent', 'city', e.target.value)}
                  />
                  <Select value={userInfo.permanent_address.state} onValueChange={(value) => handleAddressChange('permanent', 'state', value)}>
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
                    value={userInfo.permanent_address.postal_code}
                    onChange={(e) => handleAddressChange('permanent', 'postal_code', e.target.value)}
                  />
                </div>
                <Input
                  placeholder="Country"
                  value={userInfo.permanent_address.country}
                  onChange={(e) => handleAddressChange('permanent', 'country', e.target.value)}
                  defaultValue="India"
                />
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
              <Label htmlFor="annual_income">Annual Income</Label>
              <Select value={userInfo.annual_income} onValueChange={(value) => handleChange('annual_income', value)}>
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
            <Label htmlFor="user_type">User Type *</Label>
            <Select value={userInfo.user_type} onValueChange={(value: 'individual' | 'business' | 'NRI') => handleChange('user_type', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select user type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="individual">Individual</SelectItem>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="NRI">NRI</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {userInfo.user_type === 'individual' && (
              <>
                <div>
                  <Label htmlFor="pan_number">PAN Number *</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="pan_number"
                      value={userInfo.pan_number}
                      onChange={(e) => handleChange('pan_number', e.target.value.toUpperCase())}
                      placeholder="ABCDE1234F"
                      className={errors.pan || validateField('pan_number', userInfo.pan_number) ? 'border-red-500' : ''}
                      maxLength={10}
                    />
                    <Button
                      onClick={() => verifyPan()}
                      disabled={loading.pan || !userInfo.pan_number || !userInfo.name || !userInfo.surname || !validatePAN(userInfo.pan_number)}
                      className="flex items-center gap-2"
                    >
                      {loading.pan ? 'Verifying...' : verified.pan ? <CheckCircle className="w-4 h-4 text-green-500" /> : 'Verify'}
                    </Button>
                  </div>
                  {validateField('pan_number', userInfo.pan_number) && (
                    <p className="text-red-500 text-xs mt-1">{validateField('pan_number', userInfo.pan_number)}</p>
                  )}
                  {errors.pan && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" /> {errors.pan}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="aadhar_number">Aadhaar Number *</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="aadhar_number"
                      value={userInfo.aadhar_number}
                      onChange={(e) => handleChange('aadhar_number', e.target.value.replace(/\D/g, ''))}
                      placeholder="123456789012"
                      className={errors.aadhar || validateField('aadhar_number', userInfo.aadhar_number) ? 'border-red-500' : ''}
                      maxLength={12}
                    />
                    <Button
                      onClick={() => verifyAadhar()}
                      disabled={loading.aadhar || !userInfo.aadhar_number || !aadharFile || !validateAadhaar(userInfo.aadhar_number)}
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
                  {validateField('aadhar_number', userInfo.aadhar_number) && (
                    <p className="text-red-500 text-xs mt-1">{validateField('aadhar_number', userInfo.aadhar_number)}</p>
                  )}
                  {errors.aadhar && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" /> {errors.aadhar}
                    </p>
                  )}
                </div>
              </>
            )}
            {userInfo.user_type === 'business' && (
              <div>
                <Label htmlFor="gst_number">GST Number *</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="gst_number"
                    value={userInfo.gst_number}
                    onChange={(e) => handleChange('gst_number', e.target.value.toUpperCase())}
                    placeholder="07AABCU9603R1ZM"
                    className={errors.gst || validateField('gst_number', userInfo.gst_number) ? 'border-red-500' : ''}
                    maxLength={15}
                  />
                  <Button
                    onClick={() => verifyGST()}
                    disabled={loading.gst || !userInfo.gst_number || !validateGSTIN(userInfo.gst_number)}
                    className="flex items-center gap-2"
                  >
                    {loading.gst ? 'Verifying...' : verified.gst ? <CheckCircle className="w-4 h-4 text-green-500" /> : 'Verify'}
                  </Button>
                </div>
                {validateField('gst_number', userInfo.gst_number) && (
                  <p className="text-red-500 text-xs mt-1">{validateField('gst_number', userInfo.gst_number)}</p>
                )}
                {errors.gst && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> {errors.gst}
                  </p>
                )}
              </div>
            )}
            {userInfo.user_type === 'NRI' && (
              <div>
                <Label htmlFor="passport_number">Passport Number *</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="passport_number"
                    value={userInfo.passport_number}
                    onChange={(e) => handleChange('passport_number', e.target.value.toUpperCase())}
                    placeholder="A1234567"
                    className={errors.passport || validateField('passport_number', userInfo.passport_number) ? 'border-red-500' : ''}
                    maxLength={12}
                  />
                  <Button
                    onClick={() => verifyPassport()}
                    disabled={loading.passport || !userInfo.passport_number || !userInfo.name || !userInfo.surname || !userInfo.dob || !validatePassport(userInfo.passport_number)}
                    className="flex items-center gap-2"
                  >
                    {loading.passport ? 'Verifying...' : verified.passport ? <CheckCircle className="w-4 h-4 text-green-500" /> : 'Verify'}
                  </Button>
                </div>
                {validateField('passport_number', userInfo.passport_number) && (
                  <p className="text-red-500 text-xs mt-1">{validateField('passport_number', userInfo.passport_number)}</p>
                )}
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
                  <Label htmlFor="account_holder_name">Account Holder Name *</Label>
                  <Input
                    id="account_holder_name"
                    value={userInfo.account_details.account_holder_name}
                    onChange={(e) => handleBankDetailsChange('account_holder_name', e.target.value)}
                    placeholder="Enter account holder name"
                  />
                </div>
                <div>
                  <Label htmlFor="bank_account_name">Bank Name *</Label>
                  <Input
                    id="bank_account_name"
                    value={userInfo.account_details.bank_account_name}
                    onChange={(e) => handleBankDetailsChange('bank_account_name', e.target.value)}
                    placeholder="Enter bank name"
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="account_number">Account Number *</Label>
                  <Input
                    id="account_number"
                    value={userInfo.account_details.account_number}
                    onChange={(e) => handleBankDetailsChange('account_number', e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter account number"
                    className={validateField('account_number', userInfo.account_details.account_number) ? 'border-red-500' : ''}
                    maxLength={18}
                  />
                  {validateField('account_number', userInfo.account_details.account_number) && (
                    <p className="text-red-500 text-xs mt-1">{validateField('account_number', userInfo.account_details.account_number)}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="ifsc_code">IFSC Code *</Label>
                  <Input
                    id="ifsc_code"
                    value={userInfo.account_details.ifsc_code}
                    onChange={(e) => handleBankDetailsChange('ifsc_code', e.target.value.toUpperCase())}
                    placeholder="SBIN0000123"
                    className={validateField('ifsc_code', userInfo.account_details.ifsc_code) ? 'border-red-500' : ''}
                    maxLength={11}
                  />
                  {validateField('ifsc_code', userInfo.account_details.ifsc_code) && (
                    <p className="text-red-500 text-xs mt-1">{validateField('ifsc_code', userInfo.account_details.ifsc_code)}</p>
                  )}
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
                <Label htmlFor="joint-name">First Name *</Label>
                <Input
                  id="joint-name"
                  value={jointAccountInfo.name}
                  onChange={(e) => handleJointAccountChange('name', e.target.value)}
                  placeholder="Enter first name"
                />
              </div>
              <div>
                <Label htmlFor="joint-surname">Last Name *</Label>
                <Input
                  id="joint-surname"
                  value={jointAccountInfo.surname}
                  onChange={(e) => handleJointAccountChange('surname', e.target.value)}
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
                <Label htmlFor="joint-phone_number">Phone Number *</Label>
                <Input
                  id="joint-phone_number"
                  value={jointAccountInfo.phone_number}
                  onChange={(e) => handleJointAccountChange('phone_number', e.target.value)}
                  placeholder="+91 9876543210"
                  className={validateField('phone_number', jointAccountInfo.phone_number) ? 'border-red-500' : ''}
                />
                {validateField('phone_number', jointAccountInfo.phone_number) && (
                  <p className="text-red-500 text-xs mt-1">{validateField('phone_number', jointAccountInfo.phone_number)}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="joint-user_type">User Type *</Label>
              <Select value={jointAccountInfo.user_type} onValueChange={(value: 'individual' | 'business' | 'NRI') => handleJointAccountChange('user_type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select user type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Individual</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="NRI">NRI</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {jointAccountInfo.user_type === 'individual' && (
                <>
                  <div>
                    <Label htmlFor="joint-pan_number">PAN Number *</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="joint-pan_number"
                        value={jointAccountInfo.pan_number}
                        onChange={(e) => handleJointAccountChange('pan_number', e.target.value.toUpperCase())}
                        placeholder="ABCDE1234F"
                        className={errors.jointPan || validateField('pan_number', jointAccountInfo.pan_number) ? 'border-red-500' : ''}
                        maxLength={10}
                      />
                      <Button
                        onClick={() => verifyPan(true)}
                        disabled={loading.jointPan || !jointAccountInfo.pan_number || !jointAccountInfo.name || !jointAccountInfo.surname || !validatePAN(jointAccountInfo.pan_number)}
                        className="flex items-center gap-2"
                      >
                        {loading.jointPan ? 'Verifying...' : verified.jointPan ? <CheckCircle className="w-4 h-4 text-green-500" /> : 'Verify'}
                      </Button>
                    </div>
                    {validateField('pan_number', jointAccountInfo.pan_number) && (
                      <p className="text-red-500 text-xs mt-1">{validateField('pan_number', jointAccountInfo.pan_number)}</p>
                    )}
                    {errors.jointPan && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" /> {errors.jointPan}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="joint-aadhar_number">Aadhaar Number *</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="joint-aadhar_number"
                        value={jointAccountInfo.aadhar_number}
                        onChange={(e) => handleJointAccountChange('aadhar_number', e.target.value.replace(/\D/g, ''))}
                        placeholder="123456789012"
                        className={errors.jointAadhar || validateField('aadhar_number', jointAccountInfo.aadhar_number) ? 'border-red-500' : ''}
                        maxLength={12}
                      />
                      <Button
                        onClick={() => verifyAadhar(true)}
                        disabled={loading.jointAadhar || !jointAccountInfo.aadhar_number || !jointAadharFile || !validateAadhaar(jointAccountInfo.aadhar_number)}
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
                    {validateField('aadhar_number', jointAccountInfo.aadhar_number) && (
                      <p className="text-red-500 text-xs mt-1">{validateField('aadhar_number', jointAccountInfo.aadhar_number)}</p>
                    )}
                    {errors.jointAadhar && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" /> {errors.jointAadhar}
                      </p>
                    )}
                  </div>
                </>
              )}
              {jointAccountInfo.user_type === 'business' && (
                <div>
                  <Label htmlFor="joint-gst_number">GST Number *</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="joint-gst_number"
                      value={jointAccountInfo.gst_number}
                      onChange={(e) => handleJointAccountChange('gst_number', e.target.value.toUpperCase())}
                      placeholder="07AABCU9603R1ZM"
                      className={errors.jointGst || validateField('gst_number', jointAccountInfo.gst_number) ? 'border-red-500' : ''}
                      maxLength={15}
                    />
                    <Button
                      onClick={() => verifyGST(true)}
                      disabled={loading.jointGst || !jointAccountInfo.gst_number || !validateGSTIN(jointAccountInfo.gst_number)}
                      className="flex items-center gap-2"
                    >
                      {loading.jointGst ? 'Verifying...' : verified.jointGst ? <CheckCircle className="w-4 h-4 text-green-500" /> : 'Verify'}
                    </Button>
                  </div>
                  {validateField('gst_number', jointAccountInfo.gst_number) && (
                    <p className="text-red-500 text-xs mt-1">{validateField('gst_number', jointAccountInfo.gst_number)}</p>
                  )}
                  {errors.jointGst && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" /> {errors.jointGst}
                    </p>
                  )}
                </div>
              )}
              {jointAccountInfo.user_type === 'NRI' && (
                <div>
                  <Label htmlFor="joint-passport_number">Passport Number *</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="joint-passport_number"
                      value={jointAccountInfo.passport_number}
                      onChange={(e) => handleJointAccountChange('passport_number', e.target.value.toUpperCase())}
                      placeholder="A1234567"
                      className={errors.jointPassport || validateField('passport_number', jointAccountInfo.passport_number) ? 'border-red-500' : ''}
                      maxLength={12}
                    />
                    <Button
                      onClick={() => verifyPassport(true)}
                      disabled={loading.jointPassport || !jointAccountInfo.passport_number || !jointAccountInfo.name || !jointAccountInfo.surname || !jointAccountInfo.dob || !validatePassport(jointAccountInfo.passport_number)}
                      className="flex items-center gap-2"
                    >
                      {loading.jointPassport ? 'Verifying...' : verified.jointPassport ? <CheckCircle className="w-4 h-4 text-green-500" /> : 'Verify'}
                    </Button>
                  </div>
                  {validateField('passport_number', jointAccountInfo.passport_number) && (
                    <p className="text-red-500 text-xs mt-1">{validateField('passport_number', jointAccountInfo.passport_number)}</p>
                  )}
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
                    <Label htmlFor="joint-account_holder_name">Account Holder Name *</Label>
                    <Input
                      id="joint-account_holder_name"
                      value={jointAccountInfo.account_details.account_holder_name}
                      onChange={(e) => handleJointBankDetailsChange('account_holder_name', e.target.value)}
                      placeholder="Enter account holder name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="joint-bank_account_name">Bank Name *</Label>
                    <Input
                      id="joint-bank_account_name"
                      value={jointAccountInfo.account_details.bank_account_name}
                      onChange={(e) => handleJointBankDetailsChange('bank_account_name', e.target.value)}
                      placeholder="Enter bank name"
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="joint-account_number">Account Number *</Label>
                    <Input
                      id="joint-account_number"
                      value={jointAccountInfo.account_details.account_number}
                      onChange={(e) => handleJointBankDetailsChange('account_number', e.target.value.replace(/\D/g, ''))}
                      placeholder="Enter account number"
                      className={validateField('account_number', jointAccountInfo.account_details.account_number) ? 'border-red-500' : ''}
                      maxLength={18}
                    />
                    {validateField('account_number', jointAccountInfo.account_details.account_number) && (
                      <p className="text-red-500 text-xs mt-1">{validateField('account_number', jointAccountInfo.account_details.account_number)}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="joint-ifsc_code">IFSC Code *</Label>
                    <Input
                      id="joint-ifsc_code"
                      value={jointAccountInfo.account_details.ifsc_code}
                      onChange={(e) => handleJointBankDetailsChange('ifsc_code', e.target.value.toUpperCase())}
                      placeholder="SBIN0000123"
                      className={validateField('ifsc_code', jointAccountInfo.account_details.ifsc_code) ? 'border-red-500' : ''}
                      maxLength={11}
                    />
                    {validateField('ifsc_code', jointAccountInfo.account_details.ifsc_code) && (
                      <p className="text-red-500 text-xs mt-1">{validateField('ifsc_code', jointAccountInfo.account_details.ifsc_code)}</p>
                    )}
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