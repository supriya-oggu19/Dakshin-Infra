import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Plus, Users, UserPlus, Crown, Building } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import UserInfoForm from "@/forms/UserInfoForm";
import {
  UserInfo,
  JointAccountInfo,
  Account,
  UserInfoPageProps,
  APIUserProfileResponse,
} from "@/api/models/userInfo.model";
import { userProfileApi } from "@/api/userProfileApi";
import { Badge } from "@/components/ui/badge";

// Initial states with India default
const initialUserInfo: UserInfo = {
  surname: "",
  name: "",
  dob: "",
  gender: "male",
  present_address: {
    street: "",
    city: "",
    state: "",
    country: "India",
    postal_code: "",
  },
  permanent_address: {
    street: "",
    city: "",
    state: "",
    country: "India",
    postal_code: "",
  },
  sameAddress: false,
  occupation: "",
  annual_income: "",
  email: "",
  phone_number: "",
  user_type: "individual",
  pan_number: "",
  aadhar_number: "",
  gst_number: "",
  passport_number: "",
  account_details: {
    account_holder_name: "",
    bank_account_name: "",
    account_number: "",
    ifsc_code: "",
  },
};

const initialJointInfo: JointAccountInfo = {
  ...initialUserInfo,
  sameAddress: true,
};

// Extended props to include direct payment navigation
interface ExtendedUserInfoPageProps extends Omit<UserInfoPageProps, 'onSubmit'> {
  onSubmit?: (accounts: Account[]) => Promise<boolean>;
  onDirectToPayment?: (profileIds: string[]) => void;
  onContinueToKYC?: () => void;
  existingProfiles?: APIUserProfileResponse[];
  useExistingProfiles?: boolean;
  onUseExistingProfilesChange?: (value: boolean) => void;
  selectedProfileIds?: string[];
  onProfileSelection?: (profileIds: string[]) => void;
}

const UserInfoPage = ({
  accounts: initialAccounts,
  onSubmit,
  onAccountsChange,
  onDirectToPayment,
  onContinueToKYC,
  selectedProfileIds: propSelectedProfileIds = [],
  existingProfiles: propExistingProfiles = [],
  useExistingProfiles: propUseExistingProfiles = false,
  onUseExistingProfilesChange,
  onProfileSelection,
}: ExtendedUserInfoPageProps) => {
  const { toast } = useToast();
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts || []);
  const [loadingProfiles, setLoadingProfiles] = useState(false);
  const [hasFetchedProfiles, setHasFetchedProfiles] = useState(false);

  // Sync prop changes
  useEffect(() => {
    if (initialAccounts && initialAccounts.length > 0) {
      setAccounts(initialAccounts);
    }
  }, [initialAccounts]);

  // Fetch existing profiles when toggle is enabled and we don't have them
  useEffect(() => {
    const fetchExistingProfiles = async () => {
      if (propUseExistingProfiles && !hasFetchedProfiles && propExistingProfiles.length === 0) {
        setLoadingProfiles(true);
        try {
          const response = await userProfileApi.listUserProfiles();
          if (onProfileSelection && response && response.length > 0) {
            // Update parent with fetched profiles
            onProfileSelection([]); // Reset selection initially
          }
        } catch (error) {
          console.error("Error fetching profiles:", error);
          toast({
            title: "Error",
            description: "Failed to load existing profiles",
            variant: "destructive",
          });
        } finally {
          setLoadingProfiles(false);
          setHasFetchedProfiles(true);
        }
      }
    };

    fetchExistingProfiles();
  }, [propUseExistingProfiles, hasFetchedProfiles, propExistingProfiles.length, onProfileSelection, toast]);

  const addAccount = () => {
    if (accounts.length >= 5) {  // Legal max joints + primary
      toast({ title: "Limit Reached", description: "Max 4 joint holders allowed.", variant: "destructive" });
      return;
    }
    const newAccount: Account = {
      id: crypto.randomUUID(),  // Safer ID
      type: "joint",
      data: initialJointInfo,
      termsAccepted: false,
      verified: { pan: false, aadhar: false, gst: false, passport: false },
    };
    const newAccounts = [...accounts, newAccount];
    setAccounts(newAccounts);
    onAccountsChange?.(newAccounts);
  };

  const removeAccount = (id: string) => {
    if (id === "primary") {
      toast({
        title: "Cannot remove primary account",
        variant: "destructive",
      });
      return;
    }
    const newAccounts = accounts.filter((account) => account.id !== id);
    setAccounts(newAccounts);
    onAccountsChange?.(newAccounts);
  };

  const updateAccountData = (
    id: string,
    newData: UserInfo | JointAccountInfo
  ) => {
    const newAccounts = accounts.map((account) =>
      account.id === id ? { ...account, data: newData } : account
    );
    setAccounts(newAccounts);
    onAccountsChange?.(newAccounts);
  };

  const updateAccountTerms = (id: string, termsAccepted: boolean) => {
    const newAccounts = accounts.map((account) =>
      account.id === id ? { ...account, termsAccepted } : account
    );
    setAccounts(newAccounts);
    onAccountsChange?.(newAccounts);
  };

  const updateAccountVerified = (
    id: string,
    verified: Partial<Account["verified"]>
  ) => {
    const newAccounts = accounts.map((account) =>
      account.id === id
        ? { ...account, verified: { ...account.verified, ...verified } }
        : account
    );
    setAccounts(newAccounts);
    onAccountsChange?.(newAccounts);
  };

  const handleSubmit = async () => {
    const allTermsAccepted = accounts.every((account) => account.termsAccepted);
    if (!allTermsAccepted) {
      toast({
        title: "Error",
        description: "Please accept terms and conditions for all accounts",
        variant: "destructive",
      });
      return;
    }

    //validation
    const allFieldsValid = accounts.every((account) => {
      const data = account.data;
      return (
        data.surname &&
        data.name &&
        data.dob &&
        data.email &&
        data.phone_number &&
        data.occupation &&
        data.annual_income &&
        data.present_address?.street &&
        data.present_address?.city &&
        data.account_details?.account_number &&
        data.account_details?.ifsc_code
      );
    });

    if (!allFieldsValid) {
      toast({
        title: "Error",
        description: "Please fill all required fields for all accounts",
        variant: "destructive",
      });
      return;
    }

    // Call parent onSubmit if provided (parent handles navigation)
    if (onSubmit) {
      const success = await onSubmit(accounts);
      if (success) {
        toast({
          title: "Success",
          description: "Information saved successfully",
        });
      }
      return;  // Let parent navigate; no local onContinueToKYC
    }
  };

  interface InfoRowProps {
    label: string;
    value: string | null | undefined;
    monospace?: boolean;
    important?: boolean;
    capitalize?: boolean;
    fullWidth?: boolean;
  }

  const InfoRow: React.FC<InfoRowProps> = ({ 
    label, 
    value, 
    monospace = false, 
    important = false,
    capitalize = false,
    fullWidth = false
  }) => (
    <div className={`flex ${fullWidth ? 'flex-col' : 'flex-row items-center justify-between'} gap-2`}>
      <span className={`text-sm font-medium text-gray-600 ${fullWidth ? 'mb-1' : 'min-w-24'}`}>
        {label}:
      </span>
      <span 
        className={`
          text-sm font-semibold 
          ${monospace ? 'font-mono' : ''}
          ${important ? 'text-blue-700 bg-blue-50 px-2 py-1 rounded border border-blue-200' : 'text-gray-900'}
          ${capitalize ? 'capitalize' : ''}
          ${fullWidth ? 'break-words' : 'truncate'}
        `}
        title={value || undefined}
      >
        {value || "Not provided"}
      </span>
    </div>
  );

// Compact address formatter
const getCompactAddress = (address: any) => {
  if (!address) return "Not provided";
  
  const parts = [];
  if (address.street) parts.push(address.street);
  if (address.city) parts.push(address.city);
  if (address.state) parts.push(address.state);
  
  return parts.length > 0 ? parts.join(', ') : "Address not available";
};

  const getJointIndex = (accountId: string) => {
    const joints = accounts.filter((a) => a.type === "joint");
    return joints.findIndex((a) => a.id === accountId) + 1;
  };

  // Handle profile selection from existing profiles
  const handleProfileToggle = (profileId: string) => {
    let newSelectedIds: string[];

    if (propSelectedProfileIds.includes(profileId)) {
      // Remove from selection
      newSelectedIds = propSelectedProfileIds.filter((id) => id !== profileId);
    } else {
      // Add to selection - if this is the first selection, it becomes primary
      newSelectedIds = [...propSelectedProfileIds, profileId];
    }

    onProfileSelection?.(newSelectedIds);
  };

  // Get primary profile (first selected)
  const getPrimaryProfile = () => {
    if (propSelectedProfileIds.length === 0) return null;
    return propExistingProfiles.find(
      (p) => p.user_profile_id === propSelectedProfileIds[0]
    );
  };

  // Convert selected profiles to accounts AND go directly to payment
  const handleUseSelectedProfiles = () => {
    if (propSelectedProfileIds.length === 0) {
      toast({
        title: "No profiles selected",
        description: "Please select at least one profile",
        variant: "destructive",
      });
      return;
    }

    const profileIds = propSelectedProfileIds
      .map((profileId) => {
        const profile = propExistingProfiles.find(
          (p) => p.user_profile_id === profileId
        );
        return profile?.user_profile_id || "";
      })
      .filter((id) => id !== "");

    // Call the direct to payment callback with profile IDs
    if (onDirectToPayment) {
      onDirectToPayment(profileIds);
      toast({
        title: "Success",
        description: "Proceeding to payment with selected profiles.",
      });
    } else {
      toast({
        title: "Success",
        description:
          "Profiles selected successfully. Please continue to payment.",
      });
    }
  };

  // Handle use existing profiles toggle change
  const handleToggleChange = (value: boolean) => {
    onUseExistingProfilesChange?.(value);
  };

  return (
    <div className="container mx-auto space-y-6">
      {/* Select Account Holders Toggle - OPTIONAL FEATURE */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Select Account Holders (Optional)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="existing-profiles" className="text-base">
                Use existing profiles
              </Label>
              <p className="text-sm text-muted-foreground">
                Choose from your previously created profiles instead of filling
                new information
              </p>
            </div>
            <Switch
              id="existing-profiles"
              checked={propUseExistingProfiles}
              onCheckedChange={handleToggleChange}
              className="
                border-2 
                border-gray-400

                data-[state=unchecked]:bg-gray-300 
                data-[state=unchecked]:border-gray-500
                
                data-[state=checked]:bg-primary
                data-[state=checked]:border-primary
              "
            />
          </div>

          {/* Profile Selection Section */}
          {propUseExistingProfiles && (
            <div className="mt-6 space-y-4">
              {loadingProfiles ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-muted-foreground mt-2">
                    Loading profiles...
                  </p>
                </div>
              ) : propExistingProfiles.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed rounded-lg">
                  <UserPlus className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No existing profiles found
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Please fill in your information below
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid gap-3 max-h-96 overflow-y-auto p-2">
                    {propExistingProfiles.map((profile) => {
                      const isPrimary =
                        propSelectedProfileIds[0] === profile.user_profile_id;
                      const isSelected = propSelectedProfileIds.includes(
                        profile.user_profile_id
                      );
                      return (
                        <div
                          key={profile.user_profile_id}
                          className={`p-4 border rounded-lg cursor-pointer transition-all ${
                            isSelected
                              ? "border-primary bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() => handleProfileToggle(profile.user_profile_id)}
                        >
                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleProfileToggle(profile.user_profile_id)}
                              className="mt-1"
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold">
                                  {profile.surname} {profile.name}
                                </h4>
                                {isPrimary && (
                                  <Badge className="bg-amber-100 text-amber-800 flex items-center gap-1">
                                    <Crown className="w-3 h-3" />
                                    Primary Holder
                                  </Badge>
                                )}
                                {isSelected && !isPrimary && (
                                  <Badge variant="secondary">
                                    Joint Holder
                                  </Badge>
                                )}
                              </div>

                              {/* Simplified Information Grid */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1.2fr] gap-2 text-sm text-muted-foreground">
                                {/* Contact Information */}
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1">
                                    <span className="font-medium text-gray-700">Email:</span>
                                    <span className="truncate">{profile.email}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <span className="font-medium text-gray-700">Phone:</span>
                                    <span>{profile.phone_number}</span>
                                  </div>
                                </div>

                                {/* Personal Details */}
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1">
                                    <span className="font-medium text-gray-700">DOB:</span>
                                    <span>
                                      {profile.dob
                                        ? new Date(profile.dob).toLocaleDateString('en-IN')
                                        : "Not provided"}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <span className="font-medium text-gray-700">Type:</span>
                                    <span className="capitalize">{profile.user_type}</span>
                                  </div>
                                </div>

                                {/* Identification - SHOW FULL NUMBERS */}
                                <div className="space-y-1">
                                  {profile.user_type === "individual" && (
                                    <>
                                      <div className="flex items-center gap-1">
                                        <span className="font-medium text-gray-700">PAN:</span>
                                        <span className="font-mono text-blue-600">
                                          {profile.pan_number || "Not provided"}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <span className="font-medium text-gray-700">Aadhar:</span>
                                        <span className="text-blue-600">
                                          {profile.aadhar_number || "Not provided"}
                                        </span>
                                      </div>
                                    </>
                                  )}
                                  {profile.user_type === "business" && (
                                    <div className="flex items-center gap-1">
                                      <span className="font-medium text-gray-700">GST:</span>
                                      <span className="font-mono text-blue-600">
                                        {profile.gst_number || "Not provided"}
                                      </span>
                                    </div>
                                  )}
                                  {profile.user_type === "NRI" && (
                                    <div className="flex items-center gap-1">
                                      <span className="font-medium text-gray-700">Passport:</span>
                                      <span className="font-mono text-blue-600">
                                        {profile.passport_number || "Not provided"}
                                      </span>
                                    </div>
                                  )}
                                </div>

                                {/* Address Information */}
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1">
                                    <span className="font-medium text-gray-700">City:</span>
                                    <span>{profile.present_address?.city || "Not provided"}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <span className="font-medium text-gray-700">State:</span>
                                    <span>{profile.present_address?.state || "Not provided"}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Bank Account Details - Show full details without masking */}
                              {profile.account_details?.account_number && (
                                <div className="mt-2 pt-2 border-t border-gray-200">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-sm text-gray-700">Bank Account:</span>
                                    <span className="text-sm">
                                      {profile.account_details.bank_account_name} • 
                                      <span className="font-mono text-blue-600 ml-1">
                                        {profile.account_details.account_number}
                                      </span>
                                      {profile.account_details.ifsc_code && (
                                        <span className="font-mono text-blue-600 ml-2">
                                          (IFSC: {profile.account_details.ifsc_code})
                                        </span>
                                      )}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ORIGINAL USER INFO FORM - MAIN FLOW - HIDDEN WHEN USING EXISTING PROFILES */}
      {!propUseExistingProfiles && (
        <div className="space-y-6">
          {accounts.map((account) => (
            <UserInfoForm
              key={account.id}
              account={account}
              isPrimary={account.type === "primary"}
              index={account.type === "primary" ? 0 : getJointIndex(account.id)}
              onUpdate={updateAccountData.bind(null, account.id)}
              onTermsChange={updateAccountTerms.bind(null, account.id)}
              onRemove={() => removeAccount(account.id)}
              onVerifiedUpdate={updateAccountVerified.bind(null, account.id)}
            />
          ))}
        </div>
      )}

      {/* Add Account Button - HIDDEN WHEN USING EXISTING PROFILES */}
      {!propUseExistingProfiles && (
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          <Button
            variant="outline"
            onClick={addAccount}
            className="flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Another Account Holder
          </Button>
        </div>
      )}
    </div>
  );
};

export default UserInfoPage;