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

type PurchaseStep = "plan-selection" | "user-info" | "kyc" | "payment" | "confirmation";

// Validation patterns matching backend
const VALIDATION_PATTERNS = {
  PAN: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
  AADHAAR: /^\d{12}$/,
  GSTIN: /^[0-9A-Z]{15}$/,
  PASSPORT: /^[A-Z0-9]{6,12}$/,
  PHONE: /^\+?\d{1,3}[-.\s]?\d{6,10}$/,
  ACCOUNT_NUMBER: /^\d{9,18}$/,
  IFSC: /^[A-Z]{4}0[A-Z0-9]{6}$/,
};

// Validation functions
const validatePAN = (pan: string): boolean => {
  return VALIDATION_PATTERNS.PAN.test(pan);
};

const validateAadhaar = (aadhaar: string): boolean => {
  return VALIDATION_PATTERNS.AADHAAR.test(aadhaar);
};

const validateGSTIN = (gstin: string): boolean => {
  return VALIDATION_PATTERNS.GSTIN.test(gstin);
};

const validatePassport = (passport: string): boolean => {
  return VALIDATION_PATTERNS.PASSPORT.test(passport);
};

const validatePhone = (phone: string): boolean => {
  return VALIDATION_PATTERNS.PHONE.test(phone);
};

const validateAccountNumber = (accountNumber: string): boolean => {
  return VALIDATION_PATTERNS.ACCOUNT_NUMBER.test(accountNumber);
};

const validateIFSC = (ifsc: string): boolean => {
  return VALIDATION_PATTERNS.IFSC.test(ifsc);
};

interface Scheme {
  id: string;
  project_id: string;
  scheme_type: "single_payment" | "installment";
  scheme_name: string;
  area_sqft: number;
  booking_advance: number;
  balance_payment_days: number | null;
  total_installments: number | null;
  monthly_installment_amount: number | null;
  rental_start_month: number | null;
  start_date: string;
  end_date: string | null;
}

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
        const response = await fetch(
          `http://127.0.0.1:8001/api/investment-schemes/project?project_id=${id}&page=1&limit=5`
        );
        const data = await response.json();
        console.log("API response:", data);

        if (response.ok && data.message === "Investment schemes for project retrieved successfully") {
          setSchemes(data.schemes || []);
          if (!data.schemes || data.schemes.length === 0) {
            setFetchError("No investment schemes available for this project");
            toast({
              title: "No Schemes",
              description: "No investment schemes available for this project",
              variant: "destructive",
            });
          }
        } else {
          setFetchError(data.message || "Failed to fetch investment schemes");
          toast({
            title: "Error",
            description: data.message || "Failed to fetch investment schemes",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Fetch error:", error);
        setFetchError("Error fetching schemes. Please try again.");
        toast({
          title: "Error",
          description: "Error fetching schemes. Please try again.",
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
    ) &&
      validateAccountNumber(userInfo.account_details.account_number) &&
      validateIFSC(userInfo.account_details.ifsc_code);

    // User type specific validation
    let isTypeValid = false;
    if (userInfo.user_type === "individual") {
      isTypeValid = !!userInfo.pan_number && !!userInfo.aadhar_number &&
        validatePAN(userInfo.pan_number) && validateAadhaar(userInfo.aadhar_number) &&
        verified.pan && verified.aadhar;
    } else if (userInfo.user_type === "business") {
      isTypeValid = !!userInfo.gst_number && validateGSTIN(userInfo.gst_number) && verified.gst;
    } else if (userInfo.user_type === "NRI") {
      isTypeValid = !!userInfo.passport_number && validatePassport(userInfo.passport_number) && verified.passport;
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
        validateAccountNumber(jointAccountInfo.account_details.account_number) &&
        validateIFSC(jointAccountInfo.account_details.ifsc_code) &&
        (jointAccountInfo.user_type === "individual"
          ? !!jointAccountInfo.pan_number && !!jointAccountInfo.aadhar_number &&
          validatePAN(jointAccountInfo.pan_number) && validateAadhaar(jointAccountInfo.aadhar_number) &&
          verified.jointPan && verified.jointAadhar
          : jointAccountInfo.user_type === "business"
            ? !!jointAccountInfo.gst_number && validateGSTIN(jointAccountInfo.gst_number) && verified.jointGst
            : !!jointAccountInfo.passport_number && validatePassport(jointAccountInfo.passport_number) && verified.jointPassport) &&
        jointTermsAccepted;
    }

    return isUserValid && isPresentAddressValid && isPermanentAddressValid && isBankValid && isTypeValid && isJointValid && termsAccepted;
  };

  const validateKYC = () => {
    let requiredDocs = false;
    if (userInfo.user_type === "individual") {
      requiredDocs = !!kycDocuments.panCard && !!kycDocuments.aadharCard;
      console.log('Individual docs:', { panCard: !!kycDocuments.panCard, aadharCard: !!kycDocuments.aadharCard });
    } else if (userInfo.user_type === "business") {
      requiredDocs = !!kycDocuments.gstDocument;
      console.log('Business doc:', { gstDocument: !!kycDocuments.gstDocument });
    } else {
      requiredDocs = !!kycDocuments.passportPhoto;
      console.log('NRI doc:', { passportPhoto: !!kycDocuments.passportPhoto });
    }
    let jointRequiredDocs = true;
    if (isJointAccount) {
      if (jointAccountInfo.user_type === "individual") {
        jointRequiredDocs = !!kycDocuments.jointPanCard && !!kycDocuments.jointAadharCard;
        console.log('Joint Individual docs:', { jointPanCard: !!kycDocuments.jointPanCard, jointAadharCard: !!kycDocuments.jointAadharCard });
      } else if (jointAccountInfo.user_type === "business") {
        jointRequiredDocs = !!kycDocuments.jointGstDocument;
        console.log('Joint Business doc:', { jointGstDocument: !!kycDocuments.jointGstDocument });
      } else {
        jointRequiredDocs = !!kycDocuments.jointPassportPhoto;
        console.log('Joint NRI doc:', { jointPassportPhoto: !!kycDocuments.jointPassportPhoto });
      }
    }
    const result = requiredDocs && kycAccepted && jointRequiredDocs && (isJointAccount ? jointKycAccepted : true);
    console.log('Validate KYC result:', result);
    return result;
  };

  const updateUserProfile = async () => {
    if (!userProfileId) {
      throw new Error("User profile ID not found");
    }

    const token = sessionStorage.getItem("auth_token");
    if (!token) {
      throw new Error("Authentication token not found");
    }

    const profileData = {
      surname: userInfo.surname,
      name: userInfo.name,
      dob: userInfo.dob,
      gender: userInfo.gender,
      present_address: {
        street: userInfo.present_address.street,
        city: userInfo.present_address.city,
        state: userInfo.present_address.state,
        country: "India",
        postal_code: userInfo.present_address.postal_code,
      },
      permanent_address: {
        street: userInfo.sameAddress ? userInfo.present_address.street : userInfo.permanent_address.street,
        city: userInfo.sameAddress ? userInfo.present_address.city : userInfo.permanent_address.city,
        state: userInfo.sameAddress ? userInfo.present_address.state : userInfo.permanent_address.state,
        country: "India",
        postal_code: userInfo.sameAddress ? userInfo.present_address.postal_code : userInfo.permanent_address.postal_code,
      },
      occupation: userInfo.occupation,
      annual_income: userInfo.annual_income,
      user_type: userInfo.user_type,
      pan_number: userInfo.user_type === "individual" ? userInfo.pan_number : null,
      aadhar_number: userInfo.user_type === "individual" ? userInfo.aadhar_number : null,
      gst_number: userInfo.user_type === "business" ? userInfo.gst_number : null,
      passport_number: userInfo.user_type === "NRI" ? userInfo.passport_number : null,
      phone_number: userInfo.phone_number,
      email: userInfo.email,
      account_details: {
        account_holder_name: userInfo.account_details.account_holder_name,
        bank_account_name: userInfo.account_details.bank_account_name,
        account_number: userInfo.account_details.account_number,
        ifsc_code: userInfo.account_details.ifsc_code,
      },
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
          account_details: {
            account_holder_name: jointAccountInfo.account_details.account_holder_name,
            bank_account_name: jointAccountInfo.account_details.bank_account_name,
            account_number: jointAccountInfo.account_details.account_number,
            ifsc_code: jointAccountInfo.account_details.ifsc_code,
          },
        }
        : null,
    };

    const formData = new FormData();
    formData.append("profile_data", JSON.stringify(profileData));

    if (kycDocuments.panCard) formData.append("document1", kycDocuments.panCard);
    if (kycDocuments.aadharCard) formData.append("document2", kycDocuments.aadharCard);
    if (kycDocuments.gstDocument) formData.append("document1", kycDocuments.gstDocument);
    if (kycDocuments.passportPhoto) formData.append("document1", kycDocuments.passportPhoto);
    if (isJointAccount) {
      if (kycDocuments.jointPanCard) formData.append("joint_document1", kycDocuments.jointPanCard);
      if (kycDocuments.jointAadharCard) formData.append("joint_document2", kycDocuments.jointAadharCard);
      if (kycDocuments.jointGstDocument) formData.append("joint_document1", kycDocuments.jointGstDocument);
      if (kycDocuments.jointPassportPhoto) formData.append("joint_document1", kycDocuments.jointPassportPhoto);
    }

    const response = await fetch(`http://127.0.0.1:8000/api/user_profile/update/${userProfileId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const responseData = await response.json();
    if (!response.ok) {
      throw new Error(responseData.message || "Failed to update user profile");
    }

    toast({
      title: "Success",
      description: "User profile updated successfully",
    });
  };

  const nextStep = async () => {
    setLoading(true);

    try {
      if (currentStep === "plan-selection" && selectedPlan) {
        setCurrentStep("user-info");
      } else if (currentStep === "user-info" && validateUserInfo()) {
        setCurrentStep("kyc");
      } else if (currentStep === "kyc" && validateKYC()) {
        const token = sessionStorage.getItem("auth_token");
        if (!token) {
          throw new Error("Authentication token not found");
        }

        const profileData = {
          surname: userInfo.surname,
          name: userInfo.name,
          dob: userInfo.dob,
          gender: userInfo.gender,
          present_address: {
            street: userInfo.present_address.street,
            city: userInfo.present_address.city,
            state: userInfo.present_address.state,
            country: "India",
            postal_code: userInfo.present_address.postal_code,
          },
          permanent_address: {
            street: userInfo.sameAddress ? userInfo.present_address.street : userInfo.permanent_address.street,
            city: userInfo.sameAddress ? userInfo.present_address.city : userInfo.permanent_address.city,
            state: userInfo.sameAddress ? userInfo.present_address.state : userInfo.permanent_address.state,
            country: "India",
            postal_code: userInfo.sameAddress ? userInfo.present_address.postal_code : userInfo.permanent_address.postal_code,
          },
          occupation: userInfo.occupation,
          annual_income: userInfo.annual_income,
          user_type: userInfo.user_type,
          pan_number: userInfo.user_type === "individual" ? userInfo.pan_number : null,
          aadhar_number: userInfo.user_type === "individual" ? userInfo.aadhar_number : null,
          gst_number: userInfo.user_type === "business" ? userInfo.gst_number : null,
          passport_number: userInfo.user_type === "NRI" ? userInfo.passport_number : null,
          phone_number: userInfo.phone_number,
          email: userInfo.email,
          account_details: {
            account_holder_name: userInfo.account_details.account_holder_name,
            bank_account_name: userInfo.account_details.bank_account_name,
            account_number: userInfo.account_details.account_number,
            ifsc_code: userInfo.account_details.ifsc_code,
          },
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
              account_details: {
                account_holder_name: jointAccountInfo.account_details.account_holder_name,
                bank_account_name: jointAccountInfo.account_details.bank_account_name,
                account_number: jointAccountInfo.account_details.account_number,
                ifsc_code: jointAccountInfo.account_details.ifsc_code,
              },
            }
            : null,
        };

        const formData = new FormData();
        formData.append("profile_data", JSON.stringify(profileData));

        if (userInfo.user_type === "individual") {
          if (kycDocuments.panCard) formData.append("document1", kycDocuments.panCard);
          if (kycDocuments.aadharCard) formData.append("document2", kycDocuments.aadharCard);
        } else if (userInfo.user_type === "business") {
          if (kycDocuments.gstDocument) formData.append("document1", kycDocuments.gstDocument);
        } else if (userInfo.user_type === "NRI") {
          if (kycDocuments.passportPhoto) formData.append("document1", kycDocuments.passportPhoto);
        }

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

        const response = await fetch("http://127.0.0.1:8000/api/user_profile/create", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        const responseData = await response.json();
        if (!response.ok) {
          throw new Error(responseData.message || "Failed to create user profile");
        }

        const userProfileIdFromResponse = responseData.user_profile_id;
        if (!userProfileIdFromResponse) {
          console.warn("No user_profile_id in response, using hardcoded ID as fallback");
          setUserProfileId("abbb3392-3c6a-4361-9957-1ecc44b825d3");
        } else {
          setUserProfileId(userProfileIdFromResponse);
        }

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
    } catch (error) {
      console.error("Next step error:", error);
      setFetchError((error as Error).message || "An error occurred");
      toast({
        title: "Error",
        description: (error as Error).message || "An error occurred",
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
      if (userProfileId) {
        updateUserProfile().catch((error) => {
          console.error("Update profile error:", error);
          toast({
            title: "Error",
            description: (error as Error).message || "Failed to update user profile",
            variant: "destructive",
          });
        });
      } else {
        console.warn("No userProfileId available, skipping profile update");
        toast({
          title: "Warning",
          description: "User profile ID not found. Please ensure the profile was created successfully.",
          variant: "default",
        });
      }
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
            <h1 className="text-3xl font-bold mb-2">Purchase Kapil Business Park Unit</h1>
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
                      {!loading && schemes.length === 0 && (
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
                    onPurchaseSuccess={(data) => {
                      console.log('Purchase successful:', data);
                      // Don't move to next page, stay on payment step
                    }}
                    userProfileId={userProfileId}
                    projectData={project} // Pass the project data you already have
                    schemeData={schemes.find(s => s.id === selectedPlan.planId)} // Pass the scheme data
                  />
                </div>
              )}

              {currentStep === "confirmation" && (
                <div className="space-y-6">
                  <Card>
                    <CardContent className="text-center py-12">
                      <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                      <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
                      <p className="text-muted-foreground mb-6">Your investment in Kapil Business Park has been confirmed.</p>
                      <div className="bg-muted/30 p-4 rounded-lg mb-6">
                        <div className="text-sm text-muted-foreground">Transaction ID</div>
                        <div className="font-mono text-lg">KBP{Date.now()}</div>
                      </div>
                      <div className="space-y-2">
                        <Button className="w-full" onClick={() => navigate("/my-units")}>
                          <Eye className="w-4 h-4 mr-2" />
                          View My Investment Dashboard
                        </Button>
                        <Button variant="outline" className="w-full">
                          <Download className="w-4 h-4 mr-2" />
                          Download Draft Purchase Agreement
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>

            <div className="space-y-6">
              {selectedPlan && (
                <Card className="sticky top-24">
                  <CardHeader>
                    <CardTitle className="text-lg">Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="font-medium text-foreground">Kapil Business Park</div>
                      <div className="text-sm text-muted-foreground">Commercial Office Space</div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Plan Type</span>
                        <span className="text-sm font-medium">{selectedPlan.type === "single" ? "Single Payment" : "Installment"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Number of Units</span>
                        <span className="text-sm font-medium">{selectedPlan.units}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Area per Unit</span>
                        <span className="text-sm font-medium">{selectedPlan.area} sq ft</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Total Area</span>
                        <span className="text-sm font-medium">{selectedPlan.area * selectedPlan.units} sq ft</span>
                      </div>
                      {selectedPlan.type === "installment" && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-sm">Installments</span>
                            <span className="text-sm font-medium">{selectedPlan.installments}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Monthly Amount</span>
                            <span className="text-sm font-medium">{formatCurrency(selectedPlan.monthlyAmount!)}</span>
                          </div>
                        </>
                      )}
                      <div className="flex justify-between">
                        <span className="text-sm">Total Monthly Rental</span>
                        <span className="text-sm font-medium">{formatCurrency(selectedPlan.monthlyRental)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Rental Starts</span>
                        <span className="text-sm font-medium">{selectedPlan.rentalStart}</span>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Total Investment</span>
                        <span className="text-sm">{formatCurrency(selectedPlan.price)}</span>
                      </div>
                      {selectedPlan.type === "single" && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-sm">Advance Amount</span>
                            <span className="text-sm">{formatCurrency(getMinPayment())}</span>
                          </div>
                          {getCurrentPaymentAmount() > getMinPayment() && (
                            <div className="flex justify-between">
                              <span className="text-sm">Additional Payment</span>
                              <span className="text-sm">{formatCurrency(getCurrentPaymentAmount() - getMinPayment())}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-orange-600">
                            <span className="text-sm">Balance Due (90 days)</span>
                            <span className="text-sm font-medium">{formatCurrency(selectedPlan.price - getCurrentPaymentAmount())}</span>
                          </div>
                        </>
                      )}
                      <div className="flex justify-between text-lg font-bold">
                        <span>{currentStep === "plan-selection" || currentStep === "user-info" ? (selectedPlan.type === "single" ? "Payment Now" : "First Installment") : "Total Amount"}</span>
                        <span className="text-primary">{formatCurrency(getCurrentPaymentAmount())}</span>
                      </div>
                    </div>

                    {selectedPlan.type === "single" && currentStep !== "confirmation" && getCurrentPaymentAmount() < selectedPlan.price && (
                      <div className="text-xs text-orange-700 p-3 bg-orange-50 rounded border-l-4 border-orange-400">
                        <div className="font-medium mb-1">Payment Schedule:</div>
                        <div>• Now: {formatCurrency(getCurrentPaymentAmount())}</div>
                        <div>• Within {schemes.find((s) => s.id === selectedPlan.planId)?.balance_payment_days || 90} days: {formatCurrency(selectedPlan.price - getCurrentPaymentAmount())}</div>
                        <div className="mt-1 text-orange-600">
                          * Balance payment is mandatory within {schemes.find((s) => s.id === selectedPlan.planId)?.balance_payment_days || 90} days
                        </div>
                      </div>
                    )}

                    {currentStep !== "confirmation" && (
                      <div className="pt-4 space-y-2">
                        {currentStep !== "plan-selection" && (
                          <Button variant="outline" onClick={prevStep} className="w-full" disabled={loading}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Previous Step
                          </Button>
                        )}
                        <Button
                          onClick={nextStep}
                          className="w-full"
                          disabled={
                            loading ||
                            (currentStep === "plan-selection" && (!selectedPlan || (selectedPlan.type === "single" && !isValidPaymentAmount()))) ||
                            (currentStep === "user-info" && !validateUserInfo()) ||
                            (currentStep === "kyc" && !validateKYC())
                          }
                        >
                          {loading ? (
                            <div className="flex items-center">
                              <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                              Processing...
                            </div>
                          ) : (
                            <>
                              {currentStep === "payment" ? "Complete Payment" : "Continue"}
                              <ArrowRight className="w-4 h-4 ml-2" />
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseFlow;