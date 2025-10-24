import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { User, Users, X, CheckCircle, AlertCircle } from "lucide-react";
import { documentApi } from "@/api/documentApi";
import { UserInfo, JointAccountInfo, Address, AccountDetails, UserInfoFormProps } from "@/api/models/userInfo.model";
import { validatePAN, validateAadhaar, validateGSTIN, validatePassport, validatePhone, getFieldError } from "@/utils/validation";

const UserInfoForm = ({
  account,
  isPrimary,
  index,
  onUpdate,
  onTermsChange,
  onRemove,
  onVerifiedUpdate
}: UserInfoFormProps) => {
  const { toast } = useToast();
  const { getToken } = useAuth();
  const [loading, setLoading] = useState({
    pan: false,
    aadhar: false,
    gst: false,
    passport: false,
  });
  const [errors, setErrors] = useState({
    pan: '',
    aadhar: '',
    gst: '',
    passport: '',
  });
  const [aadharFile, setAadharFile] = useState<File | null>(null);

  const handleChange = (field: keyof (UserInfo | JointAccountInfo), value: string | boolean) => {
    onUpdate({
      ...account.data,
      [field]: value
    });
    if (field === 'aadhar_number') {
      setAadharFile(null);
    }
  };

  const handleAddressChange = (type: 'present' | 'permanent', field: keyof Address, value: string) => {
    if (!isPrimary) return;
    const addressField = `${type}_address` as const;
    const currentAddress = (account.data as UserInfo)[addressField];
    onUpdate({
      ...account.data,
      [addressField]: { ...currentAddress, [field]: value }
    } as UserInfo);
  };

  const handleBankDetailsChange = (field: keyof AccountDetails, value: string) => {
    onUpdate({
      ...account.data,
      account_details: {
        ...account.data.account_details,
        [field]: value,
      },
    });
  };

  const handleSameAddressChange = (checked: boolean) => {
    if (!isPrimary) return;
    const { present_address, permanent_address } = account.data as UserInfo;
    onUpdate({
      ...account.data,
      sameAddress: checked,
      permanent_address: checked ? { ...present_address } : permanent_address,
    } as UserInfo);
  };

  const verifyPan = async () => {
    const token = getToken();
    if (!token) {
      setErrors(prev => ({ ...prev, pan: 'Authentication token not found' }));
      toast({ title: 'Error', description: 'Please log in again', variant: 'destructive' });
      return;
    }

    const data = account.data;
    if (!data.pan_number) {
      setErrors(prev => ({ ...prev, pan: 'PAN number is required' }));
      toast({ title: 'Error', description: 'PAN number is required', variant: 'destructive' });
      return;
    }

    if (!validatePAN(data.pan_number)) {
      setErrors(prev => ({ ...prev, pan: 'Invalid PAN format' }));
      toast({ title: 'Error', description: 'Invalid PAN number format', variant: 'destructive' });
      return;
    }

    if (!data.name || !data.surname) {
      setErrors(prev => ({ ...prev, pan: 'Full name is required for PAN verification' }));
      toast({ title: 'Error', description: 'Full name is required', variant: 'destructive' });
      return;
    }

    setLoading(prev => ({ ...prev, pan: true }));
    try {
      const res = await documentApi.verifyPan({
        pan_number: data.pan_number,
        full_name: `${data.surname} ${data.name}`,
      });
      
      if (res.data.pan_status === 'VALID') {
        onVerifiedUpdate({ pan: true });
        setErrors(prev => ({ ...prev, pan: '' }));
        toast({ title: 'Success', description: 'PAN verified successfully' });
      } else {
        const errorMsg = res.data.message || res.data.detail || 'PAN verification failed';
        setErrors(prev => ({ ...prev, pan: errorMsg }));
        toast({ title: 'Error', description: errorMsg, variant: 'destructive' });
      }
    } catch (error: any) {
      setErrors(prev => ({ ...prev, pan: 'Error verifying PAN' }));
      toast({ title: 'Error', description: 'Error verifying PAN', variant: 'destructive' });
    } finally {
      setLoading(prev => ({ ...prev, pan: false }));
    }
  };

  const verifyAadhar = async () => {
    const token = getToken();
    if (!token) {
      setErrors(prev => ({ ...prev, aadhar: 'Authentication token not found' }));
      toast({ title: 'Error', description: 'Please log in again', variant: 'destructive' });
      return;
    }

    const data = account.data;
    if (!data.aadhar_number) {
      setErrors(prev => ({ ...prev, aadhar: 'Aadhaar number is required' }));
      toast({ title: 'Error', description: 'Aadhaar number is required', variant: 'destructive' });
      return;
    }

    if (!validateAadhaar(data.aadhar_number)) {
      setErrors(prev => ({ ...prev, aadhar: 'Aadhaar number must be exactly 12 digits' }));
      toast({ title: 'Error', description: 'Invalid Aadhaar number format', variant: 'destructive' });
      return;
    }

    if (!aadharFile) {
      setErrors(prev => ({ ...prev, aadhar: 'Aadhaar document image is required' }));
      toast({ title: 'Error', description: 'Aadhaar document is required', variant: 'destructive' });
      return;
    }

    if (aadharFile.size > 5 * 1024 * 1024 || !['image/jpeg', 'image/png'].includes(aadharFile.type)) {
      setErrors(prev => ({ ...prev, aadhar: 'File must be JPEG/PNG under 5MB' }));
      toast({ title: 'Error', description: 'Invalid file type or size', variant: 'destructive' });
      return;
    }

    setLoading(prev => ({ ...prev, aadhar: true }));
    try {
      const res = await documentApi.verifyAadhar(data.aadhar_number, aadharFile);
      
      if (res.data.aadhar_status === 'VALID') {
        onVerifiedUpdate({ aadhar: true });
        setErrors(prev => ({ ...prev, aadhar: '' }));
        toast({ title: 'Success', description: 'Aadhaar verified successfully' });
      } else {
        const errorMsg = res.data.message || res.data.detail || 'Aadhaar verification failed';
        setErrors(prev => ({ ...prev, aadhar: errorMsg }));
        toast({ title: 'Error', description: errorMsg, variant: 'destructive' });
      }
    } catch (error: any) {
      setErrors(prev => ({ ...prev, aadhar: 'Error verifying Aadhaar' }));
      toast({ title: 'Error', description: 'Error verifying Aadhaar', variant: 'destructive' });
    } finally {
      setLoading(prev => ({ ...prev, aadhar: false }));
    }
  };

  const verifyGST = async () => {
    const token = getToken();
    if (!token) {
      setErrors(prev => ({ ...prev, gst: 'Authentication token not found' }));
      toast({ title: 'Error', description: 'Please log in again', variant: 'destructive' });
      return;
    }

    const data = account.data;
    if (!data.gst_number) {
      setErrors(prev => ({ ...prev, gst: 'GST number is required' }));
      toast({ title: 'Error', description: 'GST number is required', variant: 'destructive' });
      return;
    }

    if (!validateGSTIN(data.gst_number)) {
      setErrors(prev => ({ ...prev, gst: 'Invalid GST format' }));
      toast({ title: 'Error', description: 'Invalid GST number format', variant: 'destructive' });
      return;
    }

    setLoading(prev => ({ ...prev, gst: true }));
    try {
      const res = await documentApi.verifyGstin({
        gst_number: data.gst_number,
      });
      
      if (res.data.detail === 'GST verified successfully') {
        onVerifiedUpdate({ gst: true });
        setErrors(prev => ({ ...prev, gst: '' }));
        toast({ title: 'Success', description: 'GST verified successfully' });
      } else {
        const errorMsg = res.data.message || res.data.detail || 'GST verification failed';
        setErrors(prev => ({ ...prev, gst: errorMsg }));
        toast({ title: 'Error', description: errorMsg, variant: 'destructive' });
      }
    } catch (error: any) {
      setErrors(prev => ({ ...prev, gst: 'Error verifying GST' }));
      toast({ title: 'Error', description: 'Error verifying GST', variant: 'destructive' });
    } finally {
      setLoading(prev => ({ ...prev, gst: false }));
    }
  };

  const verifyPassport = async () => {
    const token = getToken();
    if (!token) {
      setErrors(prev => ({ ...prev, passport: 'Authentication token not found' }));
      toast({ title: 'Error', description: 'Please log in again', variant: 'destructive' });
      return;
    }

    const data = account.data;
    if (!data.passport_number) {
      setErrors(prev => ({ ...prev, passport: 'Passport number is required' }));
      toast({ title: 'Error', description: 'Passport number is required', variant: 'destructive' });
      return;
    }

    if (!validatePassport(data.passport_number)) {
      setErrors(prev => ({ ...prev, passport: 'Invalid Passport format' }));
      toast({ title: 'Error', description: 'Invalid Passport number format', variant: 'destructive' });
      return;
    }

    if (!data.name || !data.surname || !data.dob) {
      setErrors(prev => ({ ...prev, passport: 'Full name and DOB are required for Passport verification' }));
      toast({ title: 'Error', description: 'Full name and DOB are required', variant: 'destructive' });
      return;
    }

    setLoading(prev => ({ ...prev, passport: true }));
    try {
      const res = await documentApi.verifyPassport({
        passport_number: data.passport_number,
        full_name: `${data.surname} ${data.name}`,
        dob: data.dob,
      });
      
      if (res.data.detail === 'Passport verified successfully') {
        onVerifiedUpdate({ passport: true });
        setErrors(prev => ({ ...prev, passport: '' }));
        toast({ title: 'Success', description: 'Passport verified successfully' });
      } else {
        const errorMsg = res.data.message || res.data.detail || 'Passport verification failed';
        setErrors(prev => ({ ...prev, passport: errorMsg }));
        toast({ title: 'Error', description: errorMsg, variant: 'destructive' });
      }
    } catch (error: any) {
      setErrors(prev => ({ ...prev, passport: 'Error verifying Passport' }));
      toast({ title: 'Error', description: 'Error verifying Passport', variant: 'destructive' });
    } finally {
      setLoading(prev => ({ ...prev, passport: false }));
    }
  };

  const hasAddressFields = isPrimary && 'present_address' in account.data && 'permanent_address' in account.data;

  const data = account.data;
  const verified = account.verified;

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          {isPrimary ? <User className="w-5 h-5" /> : <Users className="w-5 h-5" />}
          {isPrimary ? 'Primary Account Holder' : `Joint Account Holder ${index}`}
        </CardTitle>
        {!isPrimary && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Personal Information */}
        <div className="space-y-4">
          <Label>Personal Information</Label>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor={`surname-${account.id}`}>Surname *</Label>
              <Input
                id={`surname-${account.id}`}
                value={data.surname}
                onChange={(e) => handleChange('surname', e.target.value)}
                placeholder="Enter surname"
              />
            </div>
            <div>
              <Label htmlFor={`name-${account.id}`}>Name *</Label>
              <Input
                id={`name-${account.id}`}
                value={data.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Enter name"
              />
            </div>
            <div>
              <Label htmlFor={`dob-${account.id}`}>Date of Birth *</Label>
              <Input
                id={`dob-${account.id}`}
                type="date"
                value={data.dob}
                onChange={(e) => handleChange('dob', e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label htmlFor={`gender-${account.id}`}>Gender *</Label>
            <Select 
              value={data.gender} 
              onValueChange={(value) => handleChange('gender', value as 'male' | 'female' | 'other')}
            >
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

        {/* Address Section - Only for Primary */}
        {hasAddressFields && (
          <>
            <div className="space-y-4">
              <Label>Present Address *</Label>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`present-street-${account.id}`}>Street *</Label>
                  <Input
                    id={`present-street-${account.id}`}
                    value={data.present_address.street}
                    onChange={(e) => handleAddressChange('present', 'street', e.target.value)}
                    placeholder="Enter street"
                  />
                </div>
                <div>
                  <Label htmlFor={`present-city-${account.id}`}>City *</Label>
                  <Input
                    id={`present-city-${account.id}`}
                    value={data.present_address.city}
                    onChange={(e) => handleAddressChange('present', 'city', e.target.value)}
                    placeholder="Enter city"
                  />
                </div>
                <div>
                  <Label htmlFor={`present-state-${account.id}`}>State *</Label>
                  <Input
                    id={`present-state-${account.id}`}
                    value={data.present_address.state}
                    onChange={(e) => handleAddressChange('present', 'state', e.target.value)}
                    placeholder="Enter state"
                  />
                </div>
                <div>
                  <Label htmlFor={`present-country-${account.id}`}>Country *</Label>
                  <Input
                    id={`present-country-${account.id}`}
                    value={data.present_address.country}
                    onChange={(e) => handleAddressChange('present', 'country', e.target.value)}
                    placeholder="Enter country"
                  />
                </div>
                <div>
                  <Label htmlFor={`present-postal_code-${account.id}`}>Postal Code *</Label>
                  <Input
                    id={`present-postal_code-${account.id}`}
                    value={data.present_address.postal_code}
                    onChange={(e) => handleAddressChange('present', 'postal_code', e.target.value)}
                    placeholder="Enter postal code"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`same-address-${account.id}`}
                  checked={data.sameAddress}
                  onCheckedChange={handleSameAddressChange}
                />
                <Label htmlFor={`same-address-${account.id}`}>
                  Permanent address same as present
                </Label>
              </div>
              {!data.sameAddress && (
                <>
                  <Label>Permanent Address *</Label>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`permanent-street-${account.id}`}>Street *</Label>
                      <Input
                        id={`permanent-street-${account.id}`}
                        value={data.permanent_address.street}
                        onChange={(e) => handleAddressChange('permanent', 'street', e.target.value)}
                        placeholder="Enter street"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`permanent-city-${account.id}`}>City *</Label>
                      <Input
                        id={`permanent-city-${account.id}`}
                        value={data.permanent_address.city}
                        onChange={(e) => handleAddressChange('permanent', 'city', e.target.value)}
                        placeholder="Enter city"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`permanent-state-${account.id}`}>State *</Label>
                      <Input
                        id={`permanent-state-${account.id}`}
                        value={data.permanent_address.state}
                        onChange={(e) => handleAddressChange('permanent', 'state', e.target.value)}
                        placeholder="Enter state"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`permanent-country-${account.id}`}>Country *</Label>
                      <Input
                        id={`permanent-country-${account.id}`}
                        value={data.permanent_address.country}
                        onChange={(e) => handleAddressChange('permanent', 'country', e.target.value)}
                        placeholder="Enter country"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`permanent-postal_code-${account.id}`}>Postal Code *</Label>
                      <Input
                        id={`permanent-postal_code-${account.id}`}
                        value={data.permanent_address.postal_code}
                        onChange={(e) => handleAddressChange('permanent', 'postal_code', e.target.value)}
                        placeholder="Enter postal code"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`occupation-${account.id}`}>Occupation *</Label>
                <Input
                  id={`occupation-${account.id}`}
                  value={data.occupation}
                  onChange={(e) => handleChange('occupation', e.target.value)}
                  placeholder="Enter occupation"
                />
              </div>
              <div>
                <Label htmlFor={`annual_income-${account.id}`}>Annual Income *</Label>
                <Input
                  id={`annual_income-${account.id}`}
                  value={data.annual_income}
                  onChange={(e) => handleChange('annual_income', e.target.value)}
                  placeholder="Enter annual income"
                />
              </div>
            </div>
          </>
        )}

        {/* Contact Details */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor={`email-${account.id}`}>Email Address *</Label>
            <Input
              id={`email-${account.id}`}
              type="email"
              value={data.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="Enter email"
            />
          </div>
          <div>
            <Label htmlFor={`phone_number-${account.id}`}>Phone Number *</Label>
            <Input
              id={`phone_number-${account.id}`}
              value={data.phone_number}
              onChange={(e) => handleChange('phone_number', e.target.value)}
              placeholder="+91 9876543210"
              className={getFieldError('phone_number', data.phone_number) ? 'border-red-500' : ''}
            />
            {getFieldError('phone_number', data.phone_number) && (
              <p className="text-red-500 text-xs mt-1">
                {getFieldError('phone_number', data.phone_number)}
              </p>
            )}
          </div>
        </div>

        {/* User Type */}
        <div>
          <Label htmlFor={`user_type-${account.id}`}>User Type *</Label>
          <Select 
            value={data.user_type} 
            onValueChange={(value) => handleChange('user_type', value as 'individual' | 'business' | 'NRI')}
          >
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

        {/* Verification Fields */}
        <div className="grid md:grid-cols-2 gap-4">
          {data.user_type === 'individual' && (
            <>
              <div>
                <Label htmlFor={`pan_number-${account.id}`}>PAN Number *</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id={`pan_number-${account.id}`}
                    value={data.pan_number}
                    onChange={(e) => handleChange('pan_number', e.target.value.toUpperCase())}
                    placeholder="ABCDE1234F"
                    className={errors.pan || getFieldError('pan_number', data.pan_number) ? 'border-red-500' : ''}
                    maxLength={10}
                  />
                  <Button
                    onClick={verifyPan}
                    disabled={loading.pan || !data.pan_number || !data.name || !data.surname || !validatePAN(data.pan_number)}
                    className="flex items-center gap-2"
                  >
                    {loading.pan ? 'Verifying...' : verified.pan ? <CheckCircle className="w-4 h-4 text-green-500" /> : 'Verify'}
                  </Button>
                </div>
                {getFieldError('pan_number', data.pan_number) && (
                  <p className="text-red-500 text-xs mt-1">
                    {getFieldError('pan_number', data.pan_number)}
                  </p>
                )}
                {errors.pan && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> {errors.pan}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor={`aadhar_number-${account.id}`}>Aadhaar Number *</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id={`aadhar_number-${account.id}`}
                    value={data.aadhar_number}
                    onChange={(e) => handleChange('aadhar_number', e.target.value.replace(/\D/g, ''))}
                    placeholder="123456789012"
                    className={errors.aadhar || getFieldError('aadhar_number', data.aadhar_number) ? 'border-red-500' : ''}
                    maxLength={12}
                  />
                  <Button
                    onClick={verifyAadhar}
                    disabled={loading.aadhar || !data.aadhar_number || !aadharFile || !validateAadhaar(data.aadhar_number)}
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
                {getFieldError('aadhar_number', data.aadhar_number) && (
                  <p className="text-red-500 text-xs mt-1">
                    {getFieldError('aadhar_number', data.aadhar_number)}
                  </p>
                )}
                {errors.aadhar && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> {errors.aadhar}
                  </p>
                )}
              </div>
            </>
          )}
          {data.user_type === 'business' && (
            <div>
              <Label htmlFor={`gst_number-${account.id}`}>GST Number *</Label>
              <div className="flex items-center gap-2">
                <Input
                  id={`gst_number-${account.id}`}
                  value={data.gst_number}
                  onChange={(e) => handleChange('gst_number', e.target.value.toUpperCase())}
                  placeholder="07AABCU9603R1ZM"
                  className={errors.gst || getFieldError('gst_number', data.gst_number) ? 'border-red-500' : ''}
                  maxLength={15}
                />
                <Button
                  onClick={verifyGST}
                  disabled={loading.gst || !data.gst_number || !validateGSTIN(data.gst_number)}
                  className="flex items-center gap-2"
                >
                  {loading.gst ? 'Verifying...' : verified.gst ? <CheckCircle className="w-4 h-4 text-green-500" /> : 'Verify'}
                </Button>
              </div>
              {getFieldError('gst_number', data.gst_number) && (
                <p className="text-red-500 text-xs mt-1">
                  {getFieldError('gst_number', data.gst_number)}
                </p>
              )}
              {errors.gst && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" /> {errors.gst}
                </p>
              )}
            </div>
          )}
          {data.user_type === 'NRI' && (
            <div className="md:col-span-2">
              <Label htmlFor={`passport_number-${account.id}`}>Passport Number *</Label>
              <div className="flex items-center gap-2">
                <Input
                  id={`passport_number-${account.id}`}
                  value={data.passport_number}
                  onChange={(e) => handleChange('passport_number', e.target.value.toUpperCase())}
                  placeholder="A1234567"
                  className={errors.passport || getFieldError('passport_number', data.passport_number) ? 'border-red-500' : ''}
                  maxLength={12}
                />
                <Button
                  onClick={verifyPassport}
                  disabled={loading.passport || !data.passport_number || !data.name || !data.surname || !data.dob || !validatePassport(data.passport_number)}
                  className="flex items-center gap-2"
                >
                  {loading.passport ? 'Verifying...' : verified.passport ? <CheckCircle className="w-4 h-4 text-green-500" /> : 'Verify'}
                </Button>
              </div>
              {getFieldError('passport_number', data.passport_number) && (
                <p className="text-red-500 text-xs mt-1">
                  {getFieldError('passport_number', data.passport_number)}
                </p>
              )}
              {errors.passport && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" /> {errors.passport}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Bank Account Details */}
        <div>
          <Label>Bank Account Details *</Label>
          <div className="space-y-4 mt-2">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`account_holder_name-${account.id}`}>Account Holder Name *</Label>
                <Input
                  id={`account_holder_name-${account.id}`}
                  value={data.account_details.account_holder_name}
                  onChange={(e) => handleBankDetailsChange('account_holder_name', e.target.value)}
                  placeholder="Enter account holder name"
                />
              </div>
              <div>
                <Label htmlFor={`bank_account_name-${account.id}`}>Bank Name *</Label>
                <Input
                  id={`bank_account_name-${account.id}`}
                  value={data.account_details.bank_account_name}
                  onChange={(e) => handleBankDetailsChange('bank_account_name', e.target.value)}
                  placeholder="Enter bank name"
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`account_number-${account.id}`}>Account Number *</Label>
                <Input
                  id={`account_number-${account.id}`}
                  value={data.account_details.account_number}
                  onChange={(e) => handleBankDetailsChange('account_number', e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter account number"
                  className={getFieldError('account_number', data.account_details.account_number) ? 'border-red-500' : ''}
                  maxLength={18}
                />
                {getFieldError('account_number', data.account_details.account_number) && (
                  <p className="text-red-500 text-xs mt-1">
                    {getFieldError('account_number', data.account_details.account_number)}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor={`ifsc_code-${account.id}`}>IFSC Code *</Label>
                <Input
                  id={`ifsc_code-${account.id}`}
                  value={data.account_details.ifsc_code}
                  onChange={(e) => handleBankDetailsChange('ifsc_code', e.target.value.toUpperCase())}
                  placeholder="SBIN0000123"
                  className={getFieldError('ifsc_code', data.account_details.ifsc_code) ? 'border-red-500' : ''}
                  maxLength={11}
                />
                {getFieldError('ifsc_code', data.account_details.ifsc_code) && (
                  <p className="text-red-500 text-xs mt-1">
                    {getFieldError('ifsc_code', data.account_details.ifsc_code)}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Terms and Conditions */}
        <div className="pt-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`terms-${account.id}`}
              checked={account.termsAccepted}
              onCheckedChange={(checked) => onTermsChange(!!checked)}
            />
            <Label htmlFor={`terms-${account.id}`} className="text-sm">
              I agree to the{" "}
              <button className="text-primary hover:underline">Terms and Conditions</button>
              {" "}and{" "}
              <button className="text-primary hover:underline">Privacy Policy</button>
            </Label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserInfoForm;