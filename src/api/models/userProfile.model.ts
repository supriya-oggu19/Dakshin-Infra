/** --- Address Interface --- */
export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
}

/** --- Account Details Interface --- */
export interface AccountDetails {
  account_holder_name: string;
  bank_account_name: string;
  account_number: string;
  ifsc_code: string;
}

/** --- User Profile Request --- */
export interface CreateUserProfileRequest {
  surname: string;
  name: string;
  dob: string;
  gender: "male" | "female" | "other";
  present_address: Address;
  permanent_address: Address;
  occupation: string;
  annual_income: string;
  user_type: "individual" | "business" | "NRI";
  pan_number: string | null;
  aadhar_number: string | null;
  gst_number: string | null;
  passport_number: string | null;
  phone_number: string;
  email: string;
  account_details: AccountDetails;
  joint_account: JointAccountInfo | null;
}

export interface UpdateUserProfileRequest extends CreateUserProfileRequest {
  id: string;
}

/** --- Joint Account Interface --- */
export interface JointAccountInfo {
  surname: string;
  name: string;
  dob: string;
  gender: "male" | "female" | "other";
  email: string;
  phone_number: string;
  user_type: "individual" | "business" | "NRI";
  pan_number: string | null;
  aadhar_number: string | null;
  gst_number: string | null;
  passport_number: string | null;
  account_details: AccountDetails;
}

/** --- User Profile Response --- */
export interface UserProfileResponse {
  status: "success" | "error";
  message: string;
  user_profile_id?: string;
  user_profile?: any;
}