import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Plus, Users, UserPlus, Crown } from "lucide-react";
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
  surname: "",
  name: "",
  dob: "",
  gender: "male",
  email: "",
  phone_number: "",
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
  sameAddress: true,
  occupation: "",
  annual_income: "",
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

// Extended props to include direct payment navigation
interface ExtendedUserInfoPageProps extends UserInfoPageProps {
  onDirectToPayment?: (profileIds: string[]) => void;
  onContinueToKYC?: () => void;
}

const UserInfoPage = ({
  accounts: initialAccounts,
  onSubmit,
  onAccountsChange,
  onDirectToPayment,
  onContinueToKYC,
}: ExtendedUserInfoPageProps) => {
  const { toast } = useToast();
  const [accounts, setAccounts] = useState<Account[]>(
    initialAccounts || [
      {
        id: "primary",
        type: "primary",
        data: initialUserInfo,
        termsAccepted: false,
        verified: { pan: false, aadhar: false, gst: false, passport: false },
      },
    ]
  );

  const [useExistingProfiles, setUseExistingProfiles] = useState(false);
  const [existingProfiles, setExistingProfiles] = useState<
    APIUserProfileResponse[]
  >([]);
  const [selectedProfileIds, setSelectedProfileIds] = useState<string[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(false);
  const [hasFetchedProfiles, setHasFetchedProfiles] = useState(false);

  // Fetch existing profiles when toggle is enabled
  useEffect(() => {
    const fetchExistingProfiles = async () => {
      if (useExistingProfiles && !hasFetchedProfiles) {
        setLoadingProfiles(true);
        try {
          const response = await userProfileApi.listUserProfiles();
          setExistingProfiles(response || []);
          setHasFetchedProfiles(true);
        } catch (error) {
          console.error("Error fetching profiles:", error);
          setExistingProfiles([]);
          toast({
            title: "Error",
            description: "Failed to load existing profiles",
            variant: "destructive",
          });
        } finally {
          setLoadingProfiles(false);
        }
      }
    };

    fetchExistingProfiles();
  }, [useExistingProfiles, hasFetchedProfiles, toast]);

  // Reset fetched profiles when toggle is turned off
  useEffect(() => {
    if (!useExistingProfiles) {
      setHasFetchedProfiles(false);
      setSelectedProfileIds([]);
    }
  }, [useExistingProfiles]);

  const addAccount = () => {
    const newAccount: Account = {
      id: Date.now().toString(),
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

    // Validate required fields
    const allFieldsValid = accounts.every((account) => {
      const data = account.data;
      return (
        data.surname &&
        data.name &&
        data.dob &&
        data.email &&
        data.phone_number &&
        data.occupation &&
        data.annual_income
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

    // Call parent onSubmit if provided
    if (onSubmit) {
      const success = await onSubmit(accounts);
      if (success && onContinueToKYC) {
        onContinueToKYC(); // Navigate to KYC
        return;
      }
    }

    // If no onSubmit prop or it doesn't handle navigation, navigate directly
    if (onContinueToKYC) {
      onContinueToKYC();
    } else {
      toast({
        title: "Success",
        description: "Information saved successfully",
      });
    }
  };

  const getJointIndex = (accountId: string) => {
    const joints = accounts.filter((a) => a.type === "joint");
    return joints.findIndex((a) => a.id === accountId) + 1;
  };

  // Handle profile selection from existing profiles
  const handleProfileToggle = (profileId: string) => {
    let newSelectedIds: string[];

    if (selectedProfileIds.includes(profileId)) {
      // Remove from selection
      newSelectedIds = selectedProfileIds.filter((id) => id !== profileId);
    } else {
      // Add to selection - if this is the first selection, it becomes primary
      newSelectedIds = [...selectedProfileIds, profileId];
    }

    setSelectedProfileIds(newSelectedIds);
  };

  // Get primary profile (first selected)
  const getPrimaryProfile = () => {
    if (selectedProfileIds.length === 0) return null;
    return existingProfiles.find(
      (p) => p.user_profile_id === selectedProfileIds[0]
    );
  };

  // Convert selected profiles to accounts AND go directly to payment
  const handleUseSelectedProfiles = () => {
    if (selectedProfileIds.length === 0) {
      toast({
        title: "No profiles selected",
        description: "Please select at least one profile",
        variant: "destructive",
      });
      return;
    }

    // Extract just the profile IDs for direct payment
    const profileIds = selectedProfileIds
      .map((profileId) => {
        const profile = existingProfiles.find(
          (p) => p.user_profile_id === profileId
        );
        return profile?.user_profile_id || "";
      })
      .filter((id) => id !== "");

    // Reset the form state
    setUseExistingProfiles(false);
    setSelectedProfileIds([]);
    setHasFetchedProfiles(false);

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

  const getVerificationBadge = (status: string) => {
    switch (status) {
      case "verified":
        return <Badge className="bg-green-100 text-green-800">Verified</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
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
              checked={useExistingProfiles}
              onCheckedChange={setUseExistingProfiles}
              className="thick-switch-thumb border-2 border-gray-400 data-[state=checked]:border-primary"
            />
          </div>

          {/* Profile Selection Section */}
          {useExistingProfiles && (
            <div className="mt-6 space-y-4">
              {loadingProfiles ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-muted-foreground mt-2">
                    Loading profiles...
                  </p>
                </div>
              ) : existingProfiles.length === 0 ? (
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
                    {existingProfiles.map((profile) => {
                      const isPrimary =
                        selectedProfileIds[0] === profile.user_profile_id;
                      const isSelected = selectedProfileIds.includes(
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
                          onClick={() =>
                            handleProfileToggle(profile.user_profile_id)
                          }
                        >
                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() =>
                                handleProfileToggle(profile.user_profile_id)
                              }
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

                              {/* Enhanced profile information with more important fields */}
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm text-muted-foreground">
                                {/* Contact Information */}
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1">
                                    <span className="font-medium text-gray-700">
                                      Email:
                                    </span>
                                    <span className="truncate">
                                      {profile.email}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <span className="font-medium text-gray-700">
                                      Phone:
                                    </span>
                                    <span>{profile.phone_number}</span>
                                  </div>
                                </div>

                                {/* Personal Details */}
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1">
                                    <span className="font-medium text-gray-700">
                                      DOB:
                                    </span>
                                    <span>
                                      {profile.dob
                                        ? new Date(
                                            profile.dob
                                          ).toLocaleDateString()
                                        : "Not provided"}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <span className="font-medium text-gray-700">
                                      Gender:
                                    </span>
                                    <span className="capitalize">
                                      {profile.gender || "Not provided"}
                                    </span>
                                  </div>
                                </div>

                                {/* Professional Information */}
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1">
                                    <span className="font-medium text-gray-700">
                                      Occupation:
                                    </span>
                                    <span>
                                      {profile.occupation || "Not provided"}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <span className="font-medium text-gray-700">
                                      Income:
                                    </span>
                                    <span>
                                      {profile.annual_income
                                        ? `₹${parseInt(
                                            profile.annual_income
                                          ).toLocaleString("en-IN")}`
                                        : "Not provided"}
                                    </span>
                                  </div>
                                </div>

                                {/* Identification Documents */}
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1">
                                    <span className="font-medium text-gray-700">
                                      PAN:
                                    </span>
                                    <span className="font-mono">
                                      {profile.pan_number || "Not provided"}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <span className="font-medium text-gray-700">
                                      Aadhar:
                                    </span>
                                    <span>
                                      {profile.aadhar_number
                                        ? `${profile.aadhar_number.substring(
                                            0,
                                            4
                                          )}XXXX${profile.aadhar_number.substring(
                                            8
                                          )}`
                                        : "Not provided"}
                                    </span>
                                  </div>
                                </div>

                                {/* Address Information */}
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1">
                                    <span className="font-medium text-gray-700">
                                      City:
                                    </span>
                                    <span>
                                      {profile.present_address?.city ||
                                        "Not provided"}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <span className="font-medium text-gray-700">
                                      State:
                                    </span>
                                    <span>
                                      {profile.present_address?.state ||
                                        "Not provided"}
                                    </span>
                                  </div>
                                </div>

                                {/* Account & KYC Status */}
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1">
                                    <span className="font-medium text-gray-700">
                                      Type:
                                    </span>
                                    <span className="capitalize">
                                      {profile.user_type}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Bank Account Details - Show if available */}
                              {profile.account_details?.account_number && (
                                <div className="mt-2 pt-2 border-t border-gray-200">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-sm text-gray-700">
                                      Bank Account:
                                    </span>
                                    <span className="text-sm font-mono">
                                      {
                                        profile.account_details
                                          .bank_account_name
                                      }{" "}
                                      •
                                      {profile.account_details.account_number.substring(
                                        0,
                                        4
                                      )}
                                      XXXX
                                      {profile.account_details.account_number.substring(
                                        profile.account_details.account_number
                                          .length - 3
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

                  {selectedProfileIds.length > 0 && (
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div>
                        <span className="font-medium text-blue-800">
                          {selectedProfileIds.length} profile
                          {selectedProfileIds.length > 1 ? "s" : ""} selected
                        </span>
                        <p className="text-sm text-blue-700">
                          First selected will be primary account holder
                        </p>
                      </div>
                      <Button onClick={handleUseSelectedProfiles}>
                        Use Selected Profiles & Continue to Payment
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ORIGINAL USER INFO FORM - MAIN FLOW - HIDDEN WHEN USING EXISTING PROFILES */}
      {!useExistingProfiles && (
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
      {!useExistingProfiles && (
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          <Button
            variant="outline"
            onClick={addAccount}
            className="flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Another Account Holder
          </Button>

          <Button
            onClick={handleSubmit}
            className="bg-green-600 hover:bg-green-700 text-white"
            size="lg"
          >
            Save & Continue to KYC
          </Button>
        </div>
      )}
    </div>
  );
};

export default UserInfoPage;
