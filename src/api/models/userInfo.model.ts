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
  // Optional for type compatibility in forms (not used for joints)
  present_address?: Address;
  permanent_address?: Address;
  sameAddress?: boolean;
  occupation?: string;
  annual_income?: string;
}

export interface KYCDocuments {
  pan?: File;
  aadhar?: File;
  gst?: File;
  passport?: File;
  photo?: File;
  // Add joint if needed
  jointPan?: File;
  jointAadhar?: File;
  jointGst?: File;
  jointPassport?: File;
}

export interface CreateUserProfileRequest {
  surname: string;
  name: string;
  dob: string;
  gender: 'male' | 'female' | 'other';
  present_address: Address;
  permanent_address: Address;
  occupation: string;
  annual_income: string;
  user_type: 'individual' | 'business' | 'NRI';
  pan_number: string | null;
  aadhar_number: string | null;
  gst_number: string | null;
  passport_number: string | null;
  phone_number: string;
  email: string;
  account_details: AccountDetails;
  joint_account?: {
    surname: string;
    name: string;
    dob: string;
    gender: 'male' | 'female' | 'other';
    email: string;
    phone_number: string;
    user_type: 'individual' | 'business' | 'NRI';
    pan_number: string | null;
    aadhar_number: string | null;
    gst_number: string | null;
    passport_number: string | null;
    account_details: AccountDetails;
  } | null;
  sameAddress?: boolean;
}

export interface Account {
  id: string;
  type: 'primary' | 'joint';
  data: UserInfo | JointAccountInfo;
  termsAccepted: boolean;
  verified: {
    pan: boolean;
    aadhar: boolean;
    gst: boolean;
    passport: boolean;
  };
}

export interface UserInfoPageProps {
  accounts?: Account[];
  onSubmit?: (accounts: Account[]) => Promise<void>;
  onAccountsChange?: (accounts: Account[]) => void;
}

export interface UserInfoFormProps {
  account: Account;
  isPrimary: boolean;
  index: number;
  onUpdate: (data: UserInfo | JointAccountInfo) => void;
  onTermsChange: (accepted: boolean) => void;
  onRemove: () => void;
  onVerifiedUpdate: (verified: Partial<Account['verified']>) => void;
}

// Legacy props (kept for reference)
export interface LegacyUserInfoFormProps {
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

export type PurchaseStep = "plan-selection" | "user-info" | "kyc" | "payment" | "confirmation";

export interface KYCFormProps {
  kycDocuments: KYCDocuments;
  setKycDocuments: React.Dispatch<React.SetStateAction<KYCDocuments>>;
  kycAccepted: boolean;
  setKycAccepted: React.Dispatch<React.SetStateAction<boolean>>;
  userType: 'individual' | 'business' | 'NRI';
  isJointAccount?: boolean;
  jointAccounts?: JointAccountInfo[]; // Changed from single jointAccountInfo to array
  jointKycAccepted?: boolean[];
  setJointKycAccepted?: React.Dispatch<React.SetStateAction<boolean[]>>;
  userInfo?: UserInfo;
  setCurrentStep: (step: PurchaseStep) => void; // Fixed: Changed string to PurchaseStep
}