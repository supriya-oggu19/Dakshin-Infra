// File: src/models/userInfo.model.ts
export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
}

export interface AccountDetails {
  account_holder_name: string;
  bank_account_name: string;
  account_number: string;
  ifsc_code: string;
}

export interface UserInfo {
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

export interface JointAccountInfo {
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

export interface UserInfoFormProps {
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