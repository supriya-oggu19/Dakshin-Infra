import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  CreditCard,
  Shield,
  User,
  FileText,
  Building,
  IndianRupee,
  Download,
  Eye,
  AlertCircle,
  Plus,
  Minus,
} from "lucide-react";
import Navigation from "@/components/Navigation";
import { useAuth } from "@/contexts/AuthContext";
import UserInfoForm from "@/pages/UserInfoForm";
import KYCForm from "./KYCForm";
import { useToast } from "@/components/ui/use-toast";
import PurchaseUnitConfirmation from "./PurchaseUnitConfirmation";
import { purchaseApi } from "@/api/purchaseApi";
import { userProfileApi } from "@/api/userProfileApi";
import { Scheme, PurchaseUnitRequest } from "@/api/models/purchase.model";
import { CreateUserProfileRequest } from "@/api/models/userProfile.model";

type PurchaseStep = "plan-selection" | "user-info" | "kyc" | "payment" | "confirmation";

interface PlanSelection {
  type: "single" | "installment";
  planId: string;
  area: number;
  price: number;
  monthlyAmount?: number;
  installments?: number;
  rentalStart?: string;
  monthlyRental: number;
  units: number;
  paymentAmount?: number;
}

interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
}

interface AccountDetails {
  account_holder_name: string;
  bank_account_name: string;
  account_number: string;
  ifsc_code: string;
}

interface UserInfo {
  surname: string;
  name: string;
  dob: string;
  gender: "male" | "female" | "other";
  present_address: Address;
  permanent_address: Address;
  occupation: string;
  annual_income: string;
  user_type: "individual" | "business" | "NRI";
  pan_number: string;
  aadhar_number: string;
  gst_number: string;
  passport_number: string;
  phone_number: string;
  email: string;
  account_details: AccountDetails;
  sameAddress: boolean;
}

interface JointAccountInfo {
  surname: string;
  name: string;
  dob: string;
  gender: "male" | "female" | "other";
  email: string;
  phone_number: string;
  user_type: "individual" | "business" | "NRI";
  pan_number: string;
  aadhar_number: string;
  gst_number: string;
  passport_number: string;
  account_details: AccountDetails;
}

interface KYCDocuments {
  panCard?: File | null;
  aadharCard?: File | null;
  gstDocument?: File | null;
  passportPhoto?: File | null;
  jointPanCard?: File | null;
  jointAadharCard?: File | null;
  jointGstDocument?: File | null;
  jointPassportPhoto?: File | null;
}

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
  const [userInfo, setUserInfo] = useState<UserInfo>({
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
  });
  const [isJointAccount, setIsJointAccount] = useState(false);
  const [jointAccountInfo, setJointAccountInfo] = useState<JointAccountInfo>({
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
  });
  const [verified, setVerified] = useState({
    pan: false,
    aadhar: false,
    gst: false,
    passport: false,
    jointPan: false,
    jointAadhar: false,
    jointGst: false,
    jointPassport: false,
  });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [jointTermsAccepted, setJointTermsAccepted] = useState(false);
  const [kycDocuments, setKycDocuments] = useState<KYCDocuments>({
    panCard: null,
    aadharCard: null,
    gstDocument: null,
    passportPhoto: null,
    jointPanCard: null,
    jointAadharCard: null,
    jointGstDocument: null,
    jointPassportPhoto: null,
  });
  const [kycAccepted, setKycAccepted] = useState(false);
  const [jointKycAccepted, setJointKycAccepted] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "netbanking" | "card">("upi");
  const [loading, setLoading] = useState(false);
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [userProfileId, setUserProfileId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      console.log("User not authenticated, redirecting to login");
      navigate("/login", { state: { from: `/purchase/${id}` } });
    }
  }, [isAuthenticated, navigate, id]);

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
        console.log(`Fetching schemes for project_id: ${id}`);
        
        const response = await purchaseApi.getInvestmentSchemes({
          project_id: id,
          page: 1,
          limit: 10
        });

        console.log("API response:", response.data);

        if (response.data.message === "Investment schemes for project retrieved successfully") {
          setSchemes(response.data.schemes || []);
          if (!response.data.schemes || response.data.schemes.length === 0) {
            setFetchError("No investment schemes available for this project");
            toast({
              title: "No Schemes",
              description: "No investment schemes available for this project",
              variant: "destructive",
            });
          }
        } else {
          setFetchError(response.data.message || "Failed to fetch investment schemes");
          toast({
            title: "Error",
            description: response.data.message || "Failed to fetch investment schemes",
            variant: "destructive",
          });
        }
      } catch (error: any) {
        console.error("Fetch error:", error);
        setFetchError(error.response?.data?.message || "Error fetching schemes. Please try again.");
        toast({
          title: "Error",
          description: error.response?.data?.message || "Error fetching schemes. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSchemes();
  }, [id, toast]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

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

  const getMinPayment = () => {
    return selectedPlan ? schemes.find((s) => s.id === selectedPlan.planId)?.booking_advance! * selectedPlan.units : 200000;
  };

  const isValidPaymentAmount = () => {
    if (!selectedPlan || selectedPlan.type !== "single") return true;
    const paymentAmount = parseInt(customPayment) || 0;
    return paymentAmount >= getMinPayment();
  };

  const validateUserInfo = () => {
    const requiredFields = ["name", "surname", "dob", "gender", "email", "phone_number", "occupation", "annual_income", "user_type"];
    const addressRequired = ["street", "city", "state", "postal_code", "country"];
    const bankRequired = ["account_holder_name", "bank_account_name", "account_number", "ifsc_code"];

    // Basic field validation
    const isUserValid = requiredFields.every(
      (field) => userInfo[field as keyof Omit<UserInfo, "present_address" | "permanent_address" | "sameAddress" | "account_details">].trim() !== ""
    );

    // Address validation
    const isPresentAddressValid = addressRequired.every((field) =>
      userInfo.present_address[field as keyof UserInfo["present_address"]].trim() !== ""
    );
    const isPermanentAddressValid = userInfo.sameAddress || addressRequired.every((field) =>
      userInfo.permanent_address[field as keyof UserInfo["permanent_address"]].trim() !== ""
    );

    // Bank validation with pattern matching
    const isBankValid = bankRequired.every((field) =>
      userInfo.account_details[field as keyof UserInfo["account_details"]].trim() !== ""
    );

    // User type specific validation
    let isTypeValid = false;
    if (userInfo.user_type === "individual") {
      isTypeValid = !!userInfo.pan_number && !!userInfo.aadhar_number && verified.pan && verified.aadhar;
    } else if (userInfo.user_type === "business") {
      isTypeValid = !!userInfo.gst_number && verified.gst;
    } else if (userInfo.user_type === "NRI") {
      isTypeValid = !!userInfo.passport_number && verified.passport;
    }

    // Joint account validation
    let isJointValid = true;
    if (isJointAccount) {
      const jointRequiredFields = ["name", "surname", "dob", "gender", "email", "phone_number", "user_type"];
      const jointBankRequired = ["account_holder_name", "bank_account_name", "account_number", "ifsc_code"];

      isJointValid =
        jointRequiredFields.every((field) =>
          jointAccountInfo[field as keyof Omit<JointAccountInfo, "account_details">].trim() !== ""
        ) &&
        jointBankRequired.every((field) =>
          jointAccountInfo.account_details[field as keyof JointAccountInfo["account_details"]].trim() !== ""
        ) &&
        (jointAccountInfo.user_type === "individual"
          ? !!jointAccountInfo.pan_number && !!jointAccountInfo.aadhar_number && verified.jointPan && verified.jointAadhar
          : jointAccountInfo.user_type === "business"
            ? !!jointAccountInfo.gst_number && verified.jointGst
            : !!jointAccountInfo.passport_number && verified.jointPassport) &&
        jointTermsAccepted;
    }

    return isUserValid && isPresentAddressValid && isPermanentAddressValid && isBankValid && isTypeValid && isJointValid && termsAccepted;
  };

  const validateKYC = () => {
    let requiredDocs = false;
    if (userInfo.user_type === "individual") {
      requiredDocs = !!kycDocuments.panCard && !!kycDocuments.aadharCard;
    } else if (userInfo.user_type === "business") {
      requiredDocs = !!kycDocuments.gstDocument;
    } else {
      requiredDocs = !!kycDocuments.passportPhoto;
    }
    
    let jointRequiredDocs = true;
    if (isJointAccount) {
      if (jointAccountInfo.user_type === "individual") {
        jointRequiredDocs = !!kycDocuments.jointPanCard && !!kycDocuments.jointAadharCard;
      } else if (jointAccountInfo.user_type === "business") {
        jointRequiredDocs = !!kycDocuments.jointGstDocument;
      } else {
        jointRequiredDocs = !!kycDocuments.jointPassportPhoto;
      }
    }
    
    const result = requiredDocs && kycAccepted && jointRequiredDocs && (isJointAccount ? jointKycAccepted : true);
    return result;
  };

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

    // Add primary user documents
    if (userInfo.user_type === "individual") {
      if (kycDocuments.panCard) formData.append("document1", kycDocuments.panCard);
      if (kycDocuments.aadharCard) formData.append("document2", kycDocuments.aadharCard);
    } else if (userInfo.user_type === "business") {
      if (kycDocuments.gstDocument) formData.append("document1", kycDocuments.gstDocument);
    } else if (userInfo.user_type === "NRI") {
      if (kycDocuments.passportPhoto) formData.append("document1", kycDocuments.passportPhoto);
    }

    // Add joint account documents
    if (isJointAccount) {
      if (jointAccountInfo.user_type === "individual") {
        if (kycDocuments.jointPanCard) formData.append("joint_document1", kycDocuments.jointPanCard);
        if (kycDocuments.jointAadharCard) formData.append("joint_document2", kycDocuments.jointAadharCard);
      } else if (jointAccountInfo.user_type === "business") {
        if (kycDocuments.jointGstDocument) formData.append("joint_document1", kycDocuments.jointGstDocument);
      } else if (jointAccountInfo.user_type === "NRI") {
        if (kycDocuments.jointPassportPhoto) formData.append("joint_document1", kycDocuments.jointPassportPhoto);
      }
    }

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
        // This step will be triggered by the onPurchaseSuccess callback
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStepStatus = (step: PurchaseStep) => {
    const steps = ["plan-selection", "user-info", "kyc", "payment", "confirmation"];
    const currentIndex = steps.indexOf(currentStep);
    const stepIndex = steps.indexOf(step);

    if (stepIndex < currentIndex) return "completed";
    if (stepIndex === currentIndex) return "active";
    return "pending";
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
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Project Details
            </button>
            <p className="text-muted-foreground">Complete your investment in a few simple steps</p>
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between max-w-4xl mx-auto">
              {[
                { key: "plan-selection", label: "Select Plan", icon: Building },
                { key: "user-info", label: "Your Information", icon: User },
                { key: "kyc", label: "KYC Documents", icon: FileText },
                { key: "payment", label: "Payment", icon: CreditCard },
                { key: "confirmation", label: "Confirmation", icon: CheckCircle },
              ].map((step, index) => {
                const Icon = step.icon;
                const status = getStepStatus(step.key as PurchaseStep);

                return (
                  <div key={step.key} className="flex items-center">
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${status === "completed"
                        ? "bg-primary border-primary text-primary-foreground"
                        : status === "active"
                          ? "border-primary text-primary bg-primary/10"
                          : "border-muted text-muted-foreground"
                        }`}
                    >
                      {status === "completed" ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <Icon className="w-5 h-5" />
                      )}
                    </div>
                    <span
                      className={`ml-2 text-sm font-medium hidden sm:block ${status === "active"
                        ? "text-primary"
                        : status === "completed"
                          ? "text-foreground"
                          : "text-muted-foreground"
                        }`}
                    >
                      {step.label}
                    </span>
                    {index < 4 && (
                      <div className={`w-8 sm:w-16 h-0.5 mx-2 sm:mx-4 ${status === "completed" ? "bg-primary" : "bg-muted"}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {currentStep === "plan-selection" && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Building className="w-5 h-5 mr-2" />
                        Select Number of Units
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center space-x-4">
                        <label className="text-sm font-medium">Number of Units:</label>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleUnitsChange(false)} disabled={selectedUnits <= 1}>
                            <Minus className="w-4 h-4" />
                          </Button>
                          <div className="w-16 text-center py-2 px-3 border rounded-md font-medium">{selectedUnits}</div>
                          <Button variant="outline" size="sm" onClick={() => handleUnitsChange(true)}>
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Total Area: {selectedPlan ? selectedPlan.area * selectedUnits : "Select a plan"} sqft
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Building className="w-5 h-5 mr-2" />
                        Choose Your Investment Plan
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {fetchError && (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{fetchError}</AlertDescription>
                        </Alert>
                      )}
                      {loading && (
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                          <p className="text-sm text-muted-foreground mt-2">Loading schemes...</p>
                        </div>
                      )}
                      {!loading && schemes.length === 0 && !fetchError && (
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>No investment schemes available for this project. Please contact support.</AlertDescription>
                        </Alert>
                      )}
                      {schemes.length > 0 && (
                        <>
                          <div>
                            <h3 className="text-lg font-semibold mb-4 text-primary">Single Payment Schemes</h3>
                            <div className="grid md:grid-cols-3 gap-4">
                              {schemes
                                .filter((s) => s.scheme_type === "single_payment")
                                .map((scheme) => (
                                  <div
                                    key={scheme.id}
                                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedPlan?.planId === scheme.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                                      }`}
                                    onClick={() => handlePlanSelection(scheme, selectedUnits)}
                                  >
                                    <div className="text-center">
                                      <div className="text-2xl font-bold text-primary mb-2">{scheme.area_sqft} sqft</div>
                                      <div className="text-sm text-muted-foreground mb-2">Booking Advance</div>
                                      <div className="text-lg font-bold text-primary mb-3">{formatCurrency(scheme.booking_advance)}</div>
                                      <div className="bg-primary/10 p-2 rounded mb-3">
                                        <div className="text-xs text-muted-foreground">Monthly Rental (per unit)</div>
                                        <div className="text-lg font-bold text-primary">
                                          {formatCurrency(
                                            scheme.monthly_installment_amount ? scheme.monthly_installment_amount * 0.3 : scheme.booking_advance * 0.01
                                          )}
                                        </div>
                                      </div>
                                      <div className="text-sm text-muted-foreground mb-2">
                                        Rental starts from: {scheme.rental_start_month ? `${scheme.rental_start_month}th Month` : "N/A"}
                                      </div>
                                      <div className="text-sm font-medium">Total per unit: {formatCurrency(scheme.booking_advance)}</div>
                                      <div className="mt-1 text-xs text-muted-foreground">
                                        Total for {selectedUnits} unit{selectedUnits > 1 ? "s" : ""}: {formatCurrency(scheme.booking_advance * selectedUnits)}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              {selectedPlan?.type === "single" && (
                                <div className="md:col-span-3 mt-4">
                                  <div className="p-4 bg-muted/30 rounded-lg">
                                    <label className="text-sm font-medium mb-2 block">Enter Payment Amount</label>
                                    <div className="flex items-center space-x-2">
                                      <IndianRupee className="w-5 h-5 text-muted-foreground" />
                                      <Input
                                        type="number"
                                        value={customPayment}
                                        onChange={(e) => handleCustomPaymentChange(e.target.value)}
                                        placeholder={`Minimum ${formatCurrency(getMinPayment())}`}
                                        className="text-sm"
                                      />
                                    </div>
                                    {!isValidPaymentAmount() && (
                                      <p className="text-xs text-red-600 mt-1">Payment must be at least {formatCurrency(getMinPayment())}</p>
                                    )}
                                    <div className="text-sm mt-2">
                                      <span className="text-muted-foreground">Minimum Payment: </span>
                                      <span className="font-medium">{formatCurrency(getMinPayment())}</span>
                                    </div>
                                    <div className="text-sm">
                                      <span className="text-muted-foreground">Additional Payment: </span>
                                      <span className="font-medium">{formatCurrency(Math.max(0, (parseInt(customPayment) || 0) - getMinPayment()))}</span>
                                    </div>
                                    <div className="text-sm">
                                      <span className="text-muted-foreground">Balance Due (within 90 days): </span>
                                      <span className="font-medium text-orange-600">{formatCurrency(selectedPlan.price - (parseInt(customPayment) || 0))}</span>
                                    </div>
                                  </div>
                                  <div className="text-xs text-muted-foreground p-3 bg-blue-50 rounded border-l-4 border-blue-400">
                                    <div className="font-medium text-blue-800 mb-1">Payment Structure:</div>
                                    <ul className="space-y-1 text-blue-700">
                                      <li>• Minimum advance: {formatCurrency(getMinPayment())} per unit (required now)</li>
                                      <li>• Any amount above minimum goes toward main payment</li>
                                      <li>• Remaining balance must be paid within {schemes.find((s) => s.id === selectedPlan.planId)?.balance_payment_days || 90} days</li>
                                      <li>• You can pay the full amount now to avoid future payment</li>
                                    </ul>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          <div>
                            <h3 className="text-lg font-semibold mb-4 text-primary">Installment Schemes</h3>
                            <div className="grid md:grid-cols-3 gap-4">
                              {schemes
                                .filter((s) => s.scheme_type === "installment")
                                .map((scheme) => (
                                  <div
                                    key={scheme.id}
                                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedPlan?.planId === scheme.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                                      }`}
                                    onClick={() => handlePlanSelection(scheme, selectedUnits)}
                                  >
                                    <div className="text-center">
                                      <div className="text-lg font-bold text-secondary mb-1">{scheme.total_installments} Installments</div>
                                      <div className="text-2xl font-bold text-primary mb-2">{scheme.area_sqft} sqft</div>
                                      <div className="text-sm text-muted-foreground mb-2">Booking Advance (per unit)</div>
                                      <div className="text-lg font-bold text-primary mb-3">{formatCurrency(scheme.booking_advance)}</div>
                                      <div className="bg-secondary/10 p-2 rounded mb-3">
                                        <div className="text-xs text-muted-foreground">Monthly Installment (per unit)</div>
                                        <div className="text-lg font-bold text-secondary">{formatCurrency(scheme.monthly_installment_amount!)}</div>
                                      </div>
                                      <div className="bg-primary/10 p-2 rounded mb-3">
                                        <div className="text-xs text-muted-foreground">Future Monthly Rental (per unit)</div>
                                        <div className="text-lg font-bold text-primary">{formatCurrency(scheme.monthly_installment_amount! * 0.3)}</div>
                                      </div>
                                      <div className="text-sm font-medium">
                                        Total per unit: {formatCurrency(scheme.total_installments! * scheme.monthly_installment_amount!)}
                                      </div>
                                      <div className="mt-1 text-xs text-muted-foreground">
                                        Total for {selectedUnits} unit{selectedUnits > 1 ? "s" : ""}:{" "}
                                        {formatCurrency(scheme.total_installments! * scheme.monthly_installment_amount! * selectedUnits)}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              {currentStep === "user-info" && (
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
              )}

              {currentStep === "kyc" && (
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
              )}

              {currentStep === "payment" && selectedPlan && (
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
              )}

              {currentStep === "confirmation" && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center text-green-600">
                        <CheckCircle className="w-6 h-6 mr-2" />
                        Investment Confirmed!
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <p className="text-green-800">
                          Thank you for your investment! Your purchase has been successfully processed.
                        </p>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <h4 className="font-semibold">Investment Details</h4>
                          <div className="text-sm">
                            <div className="flex justify-between">
                              <span>Project:</span>
                              <span className="font-medium">{id}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Units:</span>
                              <span className="font-medium">{selectedPlan?.units}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Total Area:</span>
                              <span className="font-medium">{selectedPlan?.area * selectedPlan?.units!} sqft</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Total Investment:</span>
                              <span className="font-medium">{formatCurrency(selectedPlan?.price || 0)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-semibold">Next Steps</h4>
                          <ul className="text-sm space-y-1">
                            <li>• You will receive a confirmation email shortly</li>
                            <li>• Legal documents will be processed within 3-5 business days</li>
                            <li>• Monthly rental payments will begin as per the selected plan</li>
                            <li>• You can track your investment in your dashboard</li>
                          </ul>
                        </div>
                      </div>
                      <div className="flex space-x-4 pt-4">
                        <Button onClick={() => navigate("/dashboard")}>Go to Dashboard</Button>
                        <Button variant="outline" onClick={() => navigate(`/projects/${id}`)}>
                          View Project Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedPlan ? (
                    <>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Plan Type</span>
                          <span className="font-medium capitalize">{selectedPlan.type}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Units</span>
                          <span className="font-medium">{selectedPlan.units}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Area per Unit</span>
                          <span className="font-medium">{selectedPlan.area} sqft</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Total Area</span>
                          <span className="font-medium">{selectedPlan.area * selectedPlan.units} sqft</span>
                        </div>
                        <Separator />
                        {selectedPlan.type === "installment" && (
                          <>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Monthly Installment</span>
                              <span className="font-medium">{formatCurrency(selectedPlan.monthlyAmount!)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Total Installments</span>
                              <span className="font-medium">{selectedPlan.installments}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Rental Starts</span>
                              <span className="font-medium">{selectedPlan.rentalStart}</span>
                            </div>
                          </>
                        )}
                        {selectedPlan.type === "single" && (
                          <>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Payment Amount</span>
                              <span className="font-medium">{formatCurrency(selectedPlan.paymentAmount || getMinPayment())}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Balance Due</span>
                              <span className="font-medium text-orange-600">
                                {formatCurrency(selectedPlan.price - (selectedPlan.paymentAmount || getMinPayment()))}
                              </span>
                            </div>
                          </>
                        )}
                        <Separator />
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Future Monthly Rental</span>
                          <span className="font-medium text-green-600">{formatCurrency(selectedPlan.monthlyRental)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between text-lg font-bold">
                          <span>Total Investment</span>
                          <span>{formatCurrency(selectedPlan.price)}</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center">No plan selected</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-sm">
                    <Shield className="w-4 h-4 mr-2" />
                    Secure Payment
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-xs text-muted-foreground">
                  <p>Your personal and payment information is encrypted and secure.</p>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-5 bg-green-600 rounded flex items-center justify-center">
                      <CheckCircle className="w-3 h-3 text-white" />
                    </div>
                    <span>256-bit SSL Encryption</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-5 bg-blue-600 rounded flex items-center justify-center">
                      <Shield className="w-3 h-3 text-white" />
                    </div>
                    <span>PCI DSS Compliant</span>
                  </div>
                </CardContent>
              </Card>

              {currentStep !== "confirmation" && currentStep !== "payment" && (
                <div className="flex space-x-3">
                  {currentStep !== "plan-selection" && (
                    <Button variant="outline" onClick={prevStep} className="flex-1" disabled={loading}>
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                  )}
                  <Button
                    onClick={nextStep}
                    className="flex-1"
                    disabled={
                      loading ||
                      !selectedPlan ||
                      (currentStep === "user-info" && !validateUserInfo()) ||
                      (currentStep === "kyc" && !validateKYC()) ||
                      (currentStep === "plan-selection" && selectedPlan?.type === "single" && !isValidPaymentAmount())
                    }
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        {currentStep === "confirmation" ? "Complete" : "Continue"}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseFlow;