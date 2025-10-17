import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Users } from "lucide-react";
import { Switch } from "@/components/ui/switch";

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
}

const UserInfoForm = ({ 
  userInfo, 
  setUserInfo, 
  termsAccepted, 
  setTermsAccepted,
  isJointAccount = false,
  setIsJointAccount,
  jointAccountInfo,
  setJointAccountInfo
}: UserInfoFormProps) => {
  const handleChange = (field: keyof UserInfo, value: string) => {
    setUserInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleAddressChange = (type: 'present' | 'permanent', field: string, value: string) => {
    setUserInfo(prev => ({
      ...prev,
      [`${type}Address`]: {
        ...prev[`${type}Address` as 'presentAddress' | 'permanentAddress'],
        [field]: value,
      },
    }));
  };

  const handleSameAddressChange = (checked: boolean) => {
    setUserInfo(prev => ({
      ...prev,
      sameAddress: checked,
      permanentAddress: checked ? { ...prev.presentAddress } : prev.permanentAddress,
    }));
  };

  const handleJointAccountChange = (field: keyof JointAccountInfo, value: string) => {
    if (setJointAccountInfo) {
      setJointAccountInfo(prev => ({ ...prev, [field]: value }));
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
                  <Input
                    id="panNumber"
                    value={userInfo.panNumber}
                    onChange={(e) => handleChange('panNumber', e.target.value.toUpperCase())}
                    placeholder="Enter PAN number"
                  />
                </div>
                <div>
                  <Label htmlFor="aadharNumber">Aadhar Number *</Label>
                  <Input
                    id="aadharNumber"
                    value={userInfo.aadharNumber}
                    onChange={(e) => handleChange('aadharNumber', e.target.value)}
                    placeholder="Enter Aadhar number"
                  />
                </div>
              </>
            )}
            {userInfo.userType === 'business' && (
              <div>
                <Label htmlFor="gstNumber">GST Number *</Label>
                <Input
                  id="gstNumber"
                  value={userInfo.gstNumber}
                  onChange={(e) => handleChange('gstNumber', e.target.value.toUpperCase())}
                  placeholder="Enter GST number"
                />
              </div>
            )}
            {userInfo.userType === 'nri' && (
              <div>
                <Label htmlFor="passportNumber">Passport Number *</Label>
                <Input
                  id="passportNumber"
                  value={userInfo.passportNumber}
                  onChange={(e) => handleChange('passportNumber', e.target.value)}
                  placeholder="Enter Passport number"
                />
              </div>
            )}
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

      {/* Joint Account Holder Information */}
      {isJointAccount && jointAccountInfo && setJointAccountInfo && (
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

            <div className="grid md:grid-cols-2 gap-4">
              {userInfo.userType === 'individual' && (
                <>
                  <div>
                    <Label htmlFor="joint-panNumber">PAN Number *</Label>
                    <Input
                      id="joint-panNumber"
                      value={jointAccountInfo.panNumber}
                      onChange={(e) => handleJointAccountChange('panNumber', e.target.value.toUpperCase())}
                      placeholder="Enter PAN number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="joint-aadharNumber">Aadhar Number *</Label>
                    <Input
                      id="joint-aadharNumber"
                      value={jointAccountInfo.aadharNumber}
                      onChange={(e) => handleJointAccountChange('aadharNumber', e.target.value)}
                      placeholder="Enter Aadhar number"
                    />
                  </div>
                </>
              )}
              {userInfo.userType === 'business' && (
                <div>
                  <Label htmlFor="joint-gstNumber">GST Number *</Label>
                  <Input
                    id="joint-gstNumber"
                    value={jointAccountInfo.gstNumber}
                    onChange={(e) => handleJointAccountChange('gstNumber', e.target.value.toUpperCase())}
                    placeholder="Enter GST number"
                  />
                </div>
              )}
              {userInfo.userType === 'nri' && (
                <div>
                  <Label htmlFor="joint-passportNumber">Passport Number *</Label>
                  <Input
                    id="joint-passportNumber"
                    value={jointAccountInfo.passportNumber}
                    onChange={(e) => handleJointAccountChange('passportNumber', e.target.value)}
                    placeholder="Enter Passport number"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default UserInfoForm;