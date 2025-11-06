import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Plus, Users, UserPlus } from "lucide-react";
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

const UserInfoPage = ({
  accounts: initialAccounts,
  onSubmit,
  onAccountsChange,
}: UserInfoPageProps) => {
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

  // Fetch existing profiles when toggle is enabled
  useEffect(() => {
    const fetchExistingProfiles = async () => {
      if (useExistingProfiles) {
        setLoadingProfiles(true);
        try {
          const response = await userProfileApi.listUserProfiles();
          setExistingProfiles(response || []);
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
  }, [useExistingProfiles, toast]);

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

    if (onSubmit) {
      await onSubmit(accounts);
      return;
    }

    try {
      const primaryAccount = accounts.find((acc) => acc.type === "primary");
      const jointAccounts = accounts.filter((acc) => acc.type === "joint");

      console.log("Primary Account:", primaryAccount?.data);
      console.log(
        "Joint Accounts:",
        jointAccounts.map((acc) => acc.data)
      );

      toast({
        title: "Success",
        description: "All accounts submitted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit accounts",
        variant: "destructive",
      });
    }
  };

  const getJointIndex = (accountId: string) => {
    const joints = accounts.filter((a) => a.type === "joint");
    return joints.findIndex((a) => a.id === accountId) + 1;
  };

  // Handle profile selection from existing profiles
  const handleProfileToggle = (profileId: string) => {
    const newSelectedIds = selectedProfileIds.includes(profileId)
      ? selectedProfileIds.filter((id) => id !== profileId)
      : [...selectedProfileIds, profileId];

    setSelectedProfileIds(newSelectedIds);
  };

  // Convert selected profiles to accounts
  const handleUseSelectedProfiles = () => {
    if (selectedProfileIds.length === 0) {
      toast({
        title: "No profiles selected",
        description: "Please select at least one profile",
        variant: "destructive",
      });
      return;
    }

    const selectedAccounts: Account[] = selectedProfileIds
      .map((profileId, index) => {
        const profile = existingProfiles.find(
          (p) => p.user_profile_id === profileId
        );
        if (!profile) return null;

        return {
          id: `profile-${profile.user_profile_id}`,
          type: index === 0 ? "primary" : "joint",
          data: {
            surname: profile.surname,
            name: profile.name,
            dob: profile.dob,
            gender: profile.gender,
            email: profile.email,
            phone_number: profile.phone_number,
            present_address: profile.present_address,
            permanent_address: profile.permanent_address,
            occupation: profile.occupation,
            annual_income: profile.annual_income,
            user_type: profile.user_type,
            pan_number: profile.pan_number || "",
            aadhar_number: profile.aadhar_number || "",
            gst_number: profile.gst_number || "",
            passport_number: profile.passport_number || "",
            sameAddress:
              JSON.stringify(profile.present_address) ===
              JSON.stringify(profile.permanent_address),
            account_details: profile.account_details,
          } as UserInfo,
          termsAccepted: true,
          verified: {
            pan: !!profile.pan_number,
            aadhar: !!profile.aadhar_number,
            gst: !!profile.gst_number,
            passport: !!profile.passport_number,
          },
        };
      })
      .filter(Boolean) as Account[];

    setAccounts(selectedAccounts);
    setUseExistingProfiles(false);
    setSelectedProfileIds([]);

    toast({
      title: "Success",
      description: "Profiles loaded successfully",
    });
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
                    {existingProfiles.map((profile) => (
                      <div
                        key={profile.user_profile_id}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          selectedProfileIds.includes(profile.user_profile_id)
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
                            checked={selectedProfileIds.includes(
                              profile.user_profile_id
                            )}
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
                              {getVerificationBadge(
                                profile.kyc_verification_status
                              )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-1 text-sm text-muted-foreground">
                              <div>Email: {profile.email}</div>
                              <div>Phone: {profile.phone_number}</div>
                              <div>Type: {profile.user_type}</div>
                              <div>
                                PAN: {profile.pan_number || "Not provided"}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
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
                        Use Selected Profiles
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ORIGINAL USER INFO FORM - MAIN FLOW */}
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

      {/* Add Account Button */}
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
    </div>
  );
};

export default UserInfoPage;
