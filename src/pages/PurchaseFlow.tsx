import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import UserInfoForm from "@/pages/UserInfoForm";
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
  CreateUserProfileRequest 
} from "@/api/models/userProfile.model";

const PurchaseFlow = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();

  // State declarations
  const [currentStep, setCurrentStep] = useState<PurchaseStep>("plan-selection");
  const [selectedPlan, setSelectedPlan] = useState<PlanSelection | null>(null);
  const [selectedUnits, setSelectedUnits] = useState<number>(1);
  const [customPayment, setCustomPayment] = useState<string>("");
  const [userInfo, setUserInfo] = useState<UserInfo>(getInitialUserInfo(user));
  const [isJointAccount, setIsJointAccount] = useState(false);
  const [jointAccountInfo, setJointAccountInfo] = useState<JointAccountInfo>(getInitialJointInfo());
  const [verified, setVerified] = useState(getInitialVerifiedState());
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [jointTermsAccepted, setJointTermsAccepted] = useState(false);
  const [kycDocuments, setKycDocuments] = useState<KYCDocuments>({});
  const [kycAccepted, setKycAccepted] = useState(false);
  const [jointKycAccepted, setJointKycAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [userProfileId, setUserProfileId] = useState<string | null>(null);

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

  function getInitialVerifiedState() {
    return {
      pan: false,
      aadhar: false,
      gst: false,
      passport: false,
      jointPan: false,
      jointAadhar: false,
      jointGst: false,
      jointPassport: false,
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

        if (!id) throw new Error("Invalid project ID");

        const params: SchemeListRequest = {
          project_id: id,
          page: 1,
          limit: 10
        };

        const response = await purchaseApi.getInvestmentSchemes(params);
        console.log("API response:", response);

        if (response.schemes && response.schemes.length > 0) {
          // Success: schemes exist
          setSchemes(response.schemes);
        } else {
          // No schemes returned
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

  // Plan selection handlers
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
    // Your existing validation logic here
    // Return boolean based on validation
    return true; // Simplified for example
  };

  const validateKYC = () => {
    // Your existing KYC validation logic here
    // Return boolean based on validation
    return true; // Simplified for example
  };

  // User profile creation
  const createUserProfile = async (): Promise<string> => {
    const profileData: CreateUserProfileRequest = {
      surname: userInfo.surname,
      name: userInfo.name,
      dob: userInfo.dob,
      gender: userInfo.gender,
      present_address: userInfo.present_address,
      permanent_address: userInfo.sameAddress ? userInfo.present_address : userInfo.permanent_address,
      occupation: userInfo.occupation,
      annual_income: userInfo.annual_income,
      user_type: userInfo.user_type,
      pan_number: userInfo.user_type === "individual" ? userInfo.pan_number : null,
      aadhar_number: userInfo.user_type === "individual" ? userInfo.aadhar_number : null,
      gst_number: userInfo.user_type === "business" ? userInfo.gst_number : null,
      passport_number: userInfo.user_type === "NRI" ? userInfo.passport_number : null,
      phone_number: userInfo.phone_number,
      email: userInfo.email,
      account_details: userInfo.account_details,
      joint_account: isJointAccount
        ? {
            surname: jointAccountInfo.surname,
            name: jointAccountInfo.name,
            dob: jointAccountInfo.dob,
            gender: jointAccountInfo.gender,
            email: jointAccountInfo.email,
            phone_number: jointAccountInfo.phone_number,
            user_type: jointAccountInfo.user_type,
            pan_number: jointAccountInfo.user_type === "individual" ? jointAccountInfo.pan_number : null,
            aadhar_number: jointAccountInfo.user_type === "individual" ? jointAccountInfo.aadhar_number : null,
            gst_number: jointAccountInfo.user_type === "business" ? jointAccountInfo.gst_number : null,
            passport_number: jointAccountInfo.user_type === "NRI" ? jointAccountInfo.passport_number : null,
            account_details: jointAccountInfo.account_details,
          }
        : null,
    };

    const formData = new FormData();
    formData.append("profile_data", JSON.stringify(profileData));

    // Add documents (simplified for example)
    // Your existing document handling logic here

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
        // Payment is handled in PurchaseUnitConfirmation component
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
            <UserInfoForm
              userInfo={userInfo}
              setUserInfo={setUserInfo}
              termsAccepted={termsAccepted}
              setTermsAccepted={setTermsAccepted}
              isJointAccount={isJointAccount}
              setIsJointAccount={setIsJointAccount}
              jointAccountInfo={jointAccountInfo}
              setJointAccountInfo={setJointAccountInfo}
              jointTermsAccepted={jointTermsAccepted}
              setJointTermsAccepted={setJointTermsAccepted}
              verified={verified}
              setVerified={setVerified}
            />
          </div>
        );

      case "kyc":
        return (
          <div className="space-y-6">
            <KYCForm
              kycDocuments={kycDocuments}
              setKycDocuments={setKycDocuments}
              kycAccepted={kycAccepted}
              setKycAccepted={setKycAccepted}
              userType={userInfo.user_type}
              isJointAccount={isJointAccount}
              jointUserType={jointAccountInfo.user_type}
              jointKycAccepted={jointKycAccepted}
              setJointKycAccepted={setJointKycAccepted}
              userInfo={userInfo}
              jointAccountInfo={jointAccountInfo}
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
              isJointOwnership={isJointAccount}
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
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate(`/projects/${id}`)}
              className="flex items-center text-muted-foreground hover:text-foreground mb-4"
            >
              Back to Project Details
            </button>
            <p className="text-muted-foreground">Complete your investment in a few simple steps</p>
          </div>

          {/* Progress Stepper */}
          <PurchaseProgress currentStep={currentStep} />

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Content - Steps */}
            <div className="lg:col-span-2">
              {renderCurrentStep()}
            </div>

            {/* Right Sidebar - Order Summary */}
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