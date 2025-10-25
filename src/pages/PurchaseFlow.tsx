import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import UserInfoPage from "@/pages/UserInfoPage";
import KYCForm from "./KYCForm";
import PurchaseUnitConfirmation from "./PurchaseUnitConfirmation";

// Import our new components
import PlanSelectionStep from "@/components/purchase/PlanSelectionStep";
import ConfirmationStep from "@/components/purchase/ConfirmationStep";
import OrderSummary from "@/components/purchase/OrderSummary";
import PurchaseProgress from "@/components/purchase/PurchaseProgress";

// Import APIs and models
import { purchaseApi } from "@/api/purchaseApi";
import { userProfileApi } from "@/api/userProfileApi";
import { 
  Scheme, 
  PurchaseStep, 
  PlanSelection,
  SchemeListRequest 
} from "@/api/models/purchase.model";
import { 
  UserInfo, 
  JointAccountInfo, 
  KYCDocuments,
  CreateUserProfileRequest,
  Account 
} from "@/api/models/userInfo.model"; // Standardized to userInfo.model
import { validatePhone } from "@/utils/validation"; // Assuming this exists

const PurchaseFlow = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();

  // State declarations
  const [currentStep, setCurrentStep] = useState<PurchaseStep>("plan-selection");
  const [selectedPlan, setSelectedPlan] = useState<PlanSelection | null>(null);
  const [selectedUnits, setSelectedUnits] = useState<number>(1);
  const [customPayment, setCustomPayment] = useState<string>("");
  const [accounts, setAccounts] = useState<Account[]>([
    {
      id: 'primary',
      type: 'primary',
      data: getInitialUserInfo(user),
      termsAccepted: false,
      verified: { pan: false, aadhar: false, gst: false, passport: false }
    }
  ]);
  const [kycDocuments, setKycDocuments] = useState<KYCDocuments>({});
  const [kycAccepted, setKycAccepted] = useState(false);
  const [jointKycAccepted, setJointKycAccepted] = useState<boolean[]>([]);
  const [loading, setLoading] = useState(false);
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [userProfileId, setUserProfileId] = useState<string | null>(null);

  // Update when accounts change
  useEffect(() => {
    const jointCount = accounts.filter(account => account.type === 'joint').length;
    setJointKycAccepted(Array(jointCount).fill(false));
  }, [accounts]);

  // Helper functions for initial state
  function getInitialUserInfo(user: any): UserInfo {
    return {
      surname: "",
      name: "",
      dob: "",
      gender: "male",
      email: user?.email || "",
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
      occupation: "",
      annual_income: "",
      pan_number: "",
      aadhar_number: "",
      gst_number: "",
      passport_number: "",
      sameAddress: true,
      user_type: "individual",
      account_details: {
        account_holder_name: "",
        bank_account_name: "",
        account_number: "",
        ifsc_code: "",
      },
    };
  }

  function getInitialJointInfo(): JointAccountInfo {
    return {
      surname: "",
      name: "",
      dob: "",
      gender: "male",
      email: "",
      phone_number: "",
      pan_number: "",
      aadhar_number: "",
      gst_number: "",
      passport_number: "",
      user_type: "individual",
      account_details: {
        account_holder_name: "",
        bank_account_name: "",
        account_number: "",
        ifsc_code: "",
      },
    };
  }

  // Authentication check
  useEffect(() => {
    if (!isAuthenticated) {
      console.log("User not authenticated, redirecting to login");
      navigate("/login", { state: { from: `/purchase/${id}` } });
    }
  }, [isAuthenticated, navigate, id]);

  // Fetch schemes
  useEffect(() => {
    const fetchSchemes = async () => {
      if (!id) {
        setFetchError("Invalid project ID");
        toast({
          title: "Error",
          description: "Invalid project ID",
          variant: "destructive",
        });
        return;
      }

      try {
        setLoading(true);
        setFetchError(null);

        const params: SchemeListRequest = {
          project_id: id,
          page: 1,
          limit: 10
        };

        const response = await purchaseApi.getInvestmentSchemes(params);
        console.log("API response:", response);

        if (response.schemes && response.schemes.length > 0) {
          setSchemes(response.schemes);
        } else {
          setSchemes([]);
          setFetchError("No investment schemes available for this project");
          toast({
            title: "No Schemes",
            description: "No investment schemes available for this project",
            variant: "destructive",
          });
        }
      } catch (error: any) {
        console.error("Fetch error:", error);
        setFetchError(error.response?.data?.message || error.message || "Error fetching schemes. Please try again.");
        toast({
          title: "Error",
          description: error.response?.data?.message || error.message || "Error fetching schemes. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSchemes();
  }, [id, toast]);

  // Plan selection handlers (unchanged)
  const handlePlanSelection = (scheme: Scheme, units: number) => {
    const type = scheme.scheme_type === "single_payment" ? "single" : "installment";
    const totalPrice =
      type === "single"
        ? scheme.booking_advance * units
        : scheme.total_installments! * scheme.monthly_installment_amount! * units;
    const minPayment = scheme.booking_advance * units;

    setSelectedPlan({
      type,
      planId: scheme.id,
      area: scheme.area_sqft,
      price: totalPrice,
      monthlyAmount: type === "installment" ? scheme.monthly_installment_amount! * units : undefined,
      installments: type === "installment" ? scheme.total_installments! : undefined,
      rentalStart: scheme.rental_start_month
        ? `${scheme.rental_start_month}th Month`
        : "Next month after last installment",
      monthlyRental: scheme.monthly_installment_amount
        ? scheme.monthly_installment_amount * units * 0.3
        : scheme.booking_advance * units * 0.01,
      units: units,
      paymentAmount: type === "single" ? minPayment : undefined,
    });

    if (type === "single") {
      setCustomPayment(minPayment.toString());
    }
  };

  const handleUnitsChange = (increment: boolean) => {
    const newUnits = increment ? selectedUnits + 1 : Math.max(1, selectedUnits - 1);
    setSelectedUnits(newUnits);

    if (selectedPlan) {
      const scheme = schemes.find((s) => s.id === selectedPlan.planId);
      if (scheme) {
        handlePlanSelection(scheme, newUnits);
      }
    }
  };

  const handleCustomPaymentChange = (value: string) => {
    setCustomPayment(value);
    if (selectedPlan && selectedPlan.type === "single") {
      const paymentAmount = parseInt(value) || 0;
      setSelectedPlan({
        ...selectedPlan,
        paymentAmount,
      });
    }
  };

  // Validation helpers
  const getMinPayment = () => {
    return selectedPlan ? schemes.find((s) => s.id === selectedPlan.planId)?.booking_advance! * selectedPlan.units : 200000;
  };

  const isValidPaymentAmount = () => {
    if (!selectedPlan || selectedPlan.type !== "single") return true;
    const paymentAmount = parseInt(customPayment) || 0;
    return paymentAmount >= getMinPayment();
  };

  const validateUserInfo = () => {
    const primary = accounts.find(a => a.type === 'primary');
    if (!primary) return false;
    const data = primary.data as UserInfo;
    if (!data.surname || !data.name || !data.dob || !data.email || !primary.termsAccepted) return false;
    if (!data.phone_number || !validatePhone(data.phone_number)) return false;
    if (!data.present_address.street || !data.present_address.city) return false;
    if (!data.account_details.account_number || !data.account_details.ifsc_code) return false;
    const joint = accounts.find(a => a.type === 'joint');
    if (joint && (!joint.termsAccepted || !joint.data.surname || !joint.data.name)) return false;
    if (data.user_type === 'individual' && !primary.verified.pan) return false;
    if (data.user_type === 'business' && !primary.verified.gst) return false;
    if (data.user_type === 'NRI' && !primary.verified.passport) return false;
    return true;
  };

  const validateKYC = () => {
    if (!kycAccepted) return false;
    const primary = accounts[0]?.data as UserInfo;
    if (!primary) return false;
    if (primary.user_type === 'individual' && (!kycDocuments.pan || !kycDocuments.aadhar)) return false;
    if (primary.user_type === 'business' && !kycDocuments.gst) return false;
    if (primary.user_type === 'NRI' && !kycDocuments.passport) return false;
    if (accounts.length > 1 && !jointKycAccepted) return false;
    return true;
  };

  // User profile creation
  const createUserProfile = async (): Promise<string> => {
    const primary = accounts.find(a => a.type === 'primary')?.data as UserInfo;
    const joint = accounts.find(a => a.type === 'joint')?.data as JointAccountInfo;

    if (!primary) throw new Error("Primary account data missing");

    const profileData: CreateUserProfileRequest = {
      surname: primary.surname,
      name: primary.name,
      dob: primary.dob,
      gender: primary.gender,
      present_address: primary.present_address,
      permanent_address: primary.sameAddress ? primary.present_address : primary.permanent_address,
      occupation: primary.occupation,
      annual_income: primary.annual_income,
      user_type: primary.user_type,
      pan_number: primary.user_type === "individual" ? primary.pan_number : null,
      aadhar_number: primary.user_type === "individual" ? primary.aadhar_number : null,
      gst_number: primary.user_type === "business" ? primary.gst_number : null,
      passport_number: primary.user_type === "NRI" ? primary.passport_number : null,
      phone_number: primary.phone_number,
      email: primary.email,
      account_details: primary.account_details,
      joint_account: joint ? {
        surname: joint.surname,
        name: joint.name,
        dob: joint.dob,
        gender: joint.gender,
        email: joint.email,
        phone_number: joint.phone_number,
        user_type: joint.user_type,
        pan_number: joint.user_type === "individual" ? joint.pan_number : null,
        aadhar_number: joint.user_type === "individual" ? joint.aadhar_number : null,
        gst_number: joint.user_type === "business" ? joint.gst_number : null,
        passport_number: joint.user_type === "NRI" ? joint.passport_number : null,
        account_details: joint.account_details,
      } : null,
    };

    const formData = new FormData();
    formData.append("profile_data", JSON.stringify(profileData));

    Object.entries(kycDocuments).forEach(([key, file]) => {
      if (file instanceof File) {
        formData.append(key, file);
      }
    });

    try {
      const response = await userProfileApi.createUserProfile(formData);
      
      if (response.data.user_profile_id) {
        return response.data.user_profile_id;
      } else {
        throw new Error("No user profile ID returned from server");
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to create user profile");
    }
  };

  // Navigation handlers
  const nextStep = async () => {
    setLoading(true);

    try {
      if (currentStep === "plan-selection" && selectedPlan) {
        setCurrentStep("user-info");
      } else if (currentStep === "user-info" && validateUserInfo()) {
        setCurrentStep("kyc");
      } else if (currentStep === "kyc" && validateKYC()) {
        const userProfileId = await createUserProfile();
        setUserProfileId(userProfileId);

        toast({
          title: "Success",
          description: "User profile created successfully",
        });
        setCurrentStep("payment");
      } else if (currentStep === "payment") {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        setCurrentStep("confirmation");
        toast({
          title: "Payment Successful",
          description: "Your investment has been confirmed!",
        });
      }
    } catch (error: any) {
      console.error("Next step error:", error);
      setFetchError(error.message || "An error occurred");
      toast({
        title: "Error",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const prevStep = () => {
    if (currentStep === "user-info") {
      setCurrentStep("plan-selection");
    } else if (currentStep === "kyc") {
      setCurrentStep("user-info");
    } else if (currentStep === "payment") {
      setCurrentStep("kyc");
    }
  };

  // Utility functions
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getCurrentPaymentAmount = () => {
    if (!selectedPlan) return 0;

    if (selectedPlan.type === "installment") {
      return selectedPlan.monthlyAmount!;
    } else {
      return selectedPlan.paymentAmount || getMinPayment();
    }
  };

  const handlePurchaseSuccess = (data: any) => {
    console.log('Purchase successful:', data);
    setCurrentStep("confirmation");
    toast({
      title: "Payment Successful",
      description: "Your investment has been confirmed!",
    });
  };

  const handleUserInfoSubmit = async (submittedAccounts: Account[]) => {
    setAccounts(submittedAccounts);
    if (validateUserInfo()) {
      toast({ title: "Success", description: "User info saved" });
    } else {
      toast({ title: "Error", description: "Please fix validation errors", variant: "destructive" });
    }
  };

  // Render different steps
  const renderCurrentStep = () => {
    switch (currentStep) {
      case "plan-selection":
        return (
          <PlanSelectionStep
            schemes={schemes}
            selectedPlan={selectedPlan}
            selectedUnits={selectedUnits}
            customPayment={customPayment}
            loading={loading}
            fetchError={fetchError}
            onPlanSelect={handlePlanSelection}
            onUnitsChange={handleUnitsChange}
            onCustomPaymentChange={handleCustomPaymentChange}
            isValidPaymentAmount={isValidPaymentAmount}
            getMinPayment={getMinPayment}
            formatCurrency={formatCurrency}
          />
        );

      case "user-info":
        return (
          <div className="space-y-6">
            <UserInfoPage
              accounts={accounts}
              onSubmit={handleUserInfoSubmit}
              onAccountsChange={setAccounts}
            />
          </div>
        );

      // In your PurchaseFlow component, update the KYC form usage:
      case "kyc":
        const jointAccounts = accounts
          .filter(account => account.type === 'joint')
          .map(account => account.data as JointAccountInfo);
        
        return (
          <div className="space-y-6">
            <KYCForm
              kycDocuments={kycDocuments}
              setKycDocuments={setKycDocuments}
              kycAccepted={kycAccepted}
              setKycAccepted={setKycAccepted}
              userType={(accounts[0]?.data as UserInfo)?.user_type || "individual"}
              isJointAccount={jointAccounts.length > 0}
              jointAccounts={jointAccounts}
              jointKycAccepted={jointKycAccepted}
              setJointKycAccepted={setJointKycAccepted}
              userInfo={accounts[0]?.data as UserInfo}
              setCurrentStep={setCurrentStep}
            />
          </div>
        );

      case "payment":
        return selectedPlan ? (
          <div className="space-y-6">
            <PurchaseUnitConfirmation
              projectId={id!}
              schemeId={selectedPlan.planId}
              isJointOwnership={accounts.length > 1}
              numberOfUnits={selectedUnits}
              onPurchaseSuccess={handlePurchaseSuccess}
              userProfileId={userProfileId}
              schemeData={schemes.find(s => s.id === selectedPlan.planId)}
              paymentAmount={getCurrentPaymentAmount()}
            />
          </div>
        ) : null;

      case "confirmation":
        return (
          <ConfirmationStep
            projectId={id!}
            selectedPlan={selectedPlan}
            formatCurrency={formatCurrency}
          />
        );

      default:
        return null;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="pt-20 px-4 pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <button
              onClick={() => navigate(`/projects/${id}`)}
              className="flex items-center text-muted-foreground hover:text-foreground mb-4"
            >
              Back to Project Details
            </button>
            <p className="text-muted-foreground">Complete your investment in a few simple steps</p>
          </div>

          <PurchaseProgress currentStep={currentStep} />

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {renderCurrentStep()}
            </div>

            <OrderSummary
              selectedPlan={selectedPlan}
              currentStep={currentStep}
              loading={loading}
              onNextStep={nextStep}
              onPrevStep={prevStep}
              getMinPayment={getMinPayment}
              validateUserInfo={validateUserInfo}
              validateKYC={validateKYC}
              isValidPaymentAmount={isValidPaymentAmount}
              formatCurrency={formatCurrency}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseFlow;