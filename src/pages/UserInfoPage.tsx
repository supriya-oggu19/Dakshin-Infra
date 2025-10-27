import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import UserInfoForm from "@/forms/UserInfoForm"; // Adjust path as needed
import { UserInfo, JointAccountInfo, Account, UserInfoPageProps } from "@/api/models/userInfo.model";

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

const UserInfoPage = ({ accounts: initialAccounts, onSubmit, onAccountsChange }: UserInfoPageProps) => {
  const { toast } = useToast();
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts || [
    {
      id: 'primary',
      type: 'primary',
      data: initialUserInfo,
      termsAccepted: false,
      verified: { pan: false, aadhar: false, gst: false, passport: false }
    }
  ]);

  const addAccount = () => {
    const newAccount: Account = {
      id: Date.now().toString(),
      type: 'joint',
      data: initialJointInfo,
      termsAccepted: false,
      verified: { pan: false, aadhar: false, gst: false, passport: false }
    };
    const newAccounts = [...accounts, newAccount];
    setAccounts(newAccounts);
    onAccountsChange?.(newAccounts);
  };

  const removeAccount = (id: string) => {
    if (id === 'primary') {
      toast({
        title: "Cannot remove primary account",
        variant: "destructive",
      });
      return;
    }
    const newAccounts = accounts.filter(account => account.id !== id);
    setAccounts(newAccounts);
    onAccountsChange?.(newAccounts);
  };

  const updateAccountData = (id: string, newData: UserInfo | JointAccountInfo) => {
    const newAccounts = accounts.map(account =>
      account.id === id ? { ...account, data: newData } : account
    );
    setAccounts(newAccounts);
    onAccountsChange?.(newAccounts);
  };

  const updateAccountTerms = (id: string, termsAccepted: boolean) => {
    const newAccounts = accounts.map(account =>
      account.id === id ? { ...account, termsAccepted } : account
    );
    setAccounts(newAccounts);
    onAccountsChange?.(newAccounts);
  };

  const updateAccountVerified = (id: string, verified: Partial<Account['verified']>) => {
    const newAccounts = accounts.map(account =>
      account.id === id ? { ...account, verified: { ...account.verified, ...verified } } : account
    );
    setAccounts(newAccounts);
    onAccountsChange?.(newAccounts);
  };

  const handleSubmit = async () => {
    const allTermsAccepted = accounts.every(account => account.termsAccepted);
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
      const primaryAccount = accounts.find(acc => acc.type === 'primary');
      const jointAccounts = accounts.filter(acc => acc.type === 'joint');
      
      console.log('Primary Account:', primaryAccount?.data);
      console.log('Joint Accounts:', jointAccounts.map(acc => acc.data));
      
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
    const joints = accounts.filter(a => a.type === 'joint');
    return joints.findIndex(a => a.id === accountId) + 1;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Account Registration</h1>
        <p className="text-muted-foreground">Add multiple account holders as needed</p>
      </div>

      <div className="space-y-6">
        {accounts.map((account) => (
          <UserInfoForm
            key={account.id}
            account={account}
            isPrimary={account.type === 'primary'}
            index={account.type === 'primary' ? 0 : getJointIndex(account.id)}
            onUpdate={updateAccountData.bind(null, account.id)}
            onTermsChange={updateAccountTerms.bind(null, account.id)}
            onRemove={() => removeAccount(account.id)}
            onVerifiedUpdate={updateAccountVerified.bind(null, account.id)}
          />
        ))}
      </div>

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
        >
          Submit All Accounts
        </Button>
      </div>
    </div>
  );
};

export default UserInfoPage;