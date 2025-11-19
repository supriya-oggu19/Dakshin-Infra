import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
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
  SchemeListRequest,
} from "@/api/models/purchase.model";
import {
  UserInfo,
  JointAccountInfo,
  KYCDocuments,
  CreateUserProfileRequest,
  Account,
  APIUserProfileResponse,
} from "@/api/models/userInfo.model";
import { validatePhone } from "@/utils/validation";

const MIN_PAYMENT_FLOOR = 0; 
const GATEWAY_MAX = 1_000_000;

const PurchaseFlow = () => {
  const { id, step: urlStep } = useParams<{ id: string; step?: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const orderSummaryRef = useRef<HTMLDivElement>(null);

  // Step mapping between URL and internal state
  const stepMapping = {
    plan: "plan-selection",
    "user-info": "user-info",
    kyc: "kyc",
    payment: "payment",
    confirmation: "confirmation",
  } as const;

  const reverseStepMapping = {
    "plan-selection": "plan",
    "user-info": "user-info",
    kyc: "kyc",
    payment: "payment",
    confirmation: "confirmation",
  } as const;

  // Add this function for mobile scrolling
  const scrollToOrderSummary = () => {
    if (orderSummaryRef.current && window.innerWidth < 1024) {
      orderSummaryRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  // Initialize currentStep from URL parameter
  const [currentStep, setCurrentStep] = useState<PurchaseStep>(() => {
    const mappedStep = urlStep
      ? stepMapping[urlStep as keyof typeof stepMapping]
      : null;
    return mappedStep || "plan-selection";
  });

  // Sync URL when step changes
  useEffect(() => {
    const stepParam =
      reverseStepMapping[currentStep as keyof typeof reverseStepMapping];

    if (stepParam && stepParam !== urlStep) {
      navigate(`/purchase/${id}/${stepParam}`, {
        replace: true,
        state: location.state,
      });
    }
  }, [currentStep, id, navigate, urlStep, location.state]);

  // State declarations
  const [selectedPlan, setSelectedPlan] = useState<PlanSelection | null>(null);
  const [selectedUnits, setSelectedUnits] = useState<number>(1);
  const [customPayment, setCustomPayment] = useState<number>(0);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [kycDocuments, setKycDocuments] = useState<KYCDocuments>({});
  const [kycAccepted, setKycAccepted] = useState(false);
  const [jointKycAccepted, setJointKycAccepted] = useState<boolean[]>([]);
  const [loading, setLoading] = useState(false);
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [totalInvestment, setTotalInvestment] = useState<number>(0);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [userProfileIds, setUserProfileIds] = useState<string[]>([]);
  const [existingProfiles, setExistingProfiles] = useState<APIUserProfileResponse[]>([]);
  const [hasExistingProfiles, setHasExistingProfiles] = useState<boolean>(false);
  const [useExistingProfiles, setUseExistingProfiles] = useState<boolean>(false);
  const [selectedProfileIds, setSelectedProfileIds] = useState<string[]>([]);
  const [projectName, setProjectName] = useState<string>(location.state?.projectName || "Project");
  const [restoringState, setRestoringState] = useState(true);

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

  function getInitialAccount(user: any): Account {
    return {
      id: "primary",
      type: "primary",
      data: getInitialUserInfo(user),
      termsAccepted: false,
      verified: { pan: false, aadhar: false, gst: false, passport: false },
    };
  }

  // Convert existing profile to Account format
  const convertProfileToAccount = (
    profile: APIUserProfileResponse,
    isPrimary: boolean = true
  ): Account => {
    return {
      id: `profile-${profile.user_profile_id}`,
      type: isPrimary ? "primary" : "joint",
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
        account_details: profile.account_details || {
          account_holder_name: "",
          bank_account_name: "",
          account_number: "",
          ifsc_code: "",
        },
      } as UserInfo,
      termsAccepted: true,
      verified: {
        pan: !!profile.pan_number,
        aadhar: !!profile.aadhar_number,
        gst: !!profile.gst_number,
        passport: !!profile.passport_number,
      },
    };
  };

  // STATE PERSISTENCE - Save state when it changes
  useEffect(() => {
    if (restoringState) return; // Don't save while restoring
    
    const stateToSave = {
      selectedPlan,
      selectedUnits,
      accounts,
      currentStep,
      userProfileIds,
      kycAccepted,
      jointKycAccepted,
      customPayment,
      selectedProfileIds,
      useExistingProfiles,
      existingProfiles, // Save existing profiles too
      projectName,
    };
    sessionStorage.setItem(`purchaseState_${id}`, JSON.stringify(stateToSave));
  }, [
    selectedPlan,
    selectedUnits,
    accounts,
    currentStep,
    userProfileIds,
    kycAccepted,
    jointKycAccepted,
    customPayment,
    selectedProfileIds,
    useExistingProfiles,
    id,
    restoringState,
    existingProfiles,
    projectName
  ]);

  // STATE PERSISTENCE - Restore state on component mount
  useEffect(() => {
    if (id) {
      sessionStorage.setItem("currentProjectId", id);
    }
    
    const savedState = sessionStorage.getItem(`purchaseState_${id}`);
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        console.log("Restoring state:", parsedState);
        
        // Restore all state with proper defaults
        setSelectedPlan(parsedState.selectedPlan || null);
        setSelectedUnits(parsedState.selectedUnits || 1);
        setAccounts(parsedState.accounts && parsedState.accounts.length > 0 
          ? parsedState.accounts 
          : [getInitialAccount(user)]);
        setUserProfileIds(parsedState.userProfileIds || []);
        setKycAccepted(parsedState.kycAccepted || false);
        setJointKycAccepted(parsedState.jointKycAccepted || []);
        setCustomPayment(parsedState.customPayment || 0);
        setUseExistingProfiles(parsedState.useExistingProfiles || false);
        setSelectedProfileIds(parsedState.selectedProfileIds || []);
        setExistingProfiles(parsedState.existingProfiles || []);
        setProjectName(parsedState.projectName || location.state?.projectName || "Project");
        // Restore current step if it exists and no URL step is specified
        if (parsedState.currentStep && !urlStep) {
          setCurrentStep(parsedState.currentStep);
        }
      } catch (error) {
        console.error("Error restoring state:", error);
        // Initialize with default state if restoration fails
        setAccounts([getInitialAccount(user)]);
      }
    } else {
      // Initialize with default state if no saved state
      setAccounts([getInitialAccount(user)]);
    }
    
    setRestoringState(false);
  }, [id, user]);

  // Update when accounts change
  useEffect(() => {
    const jointCount = accounts.filter(
      (account) => account.type === "joint"
    ).length;
    setJointKycAccepted(Array(jointCount).fill(false));
  }, [accounts]);

  // Check for existing profiles
  const checkExistingProfiles = async (): Promise<boolean> => {
    try {
      const response = await userProfileApi.listUserProfiles();
      if (response && response.length > 0) {
        setExistingProfiles(response);
        setHasExistingProfiles(true);
        return true;
      }
      setHasExistingProfiles(false);
      return false;
    } catch (error) {
      console.error("Error checking existing profiles:", error);
      setHasExistingProfiles(false);
      return false;
    }
  };

  // Helper to get the correct profile IDs based on flow
  const getProfileIdsForPayment = (): string[] => {
    if (useExistingProfiles) {
      return selectedProfileIds;
    } else {
      return userProfileIds;
    }
  };

  // Authentication check
  useEffect(() => {
    if (!isAuthenticated) {
      console.log("User not authenticated, redirecting to login");
      navigate("/login", { state: { from: `/purchase/${id}` } });
    }
  }, [isAuthenticated, navigate, id]);

  // Fetch schemes and check profiles on component mount
  useEffect(() => {
    const initializeData = async () => {
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

        // Fetch schemes
        const params: SchemeListRequest = {
          project_id: id,
          page: 1,
          limit: 100,
        };

        const schemeResponse = await purchaseApi.getInvestmentSchemes(params);

        if (schemeResponse.schemes && schemeResponse.schemes.length > 0) {
          setSchemes(schemeResponse.schemes);
          setTotalInvestment(schemeResponse.total_invertment_amount);
        } else {
          setSchemes([]);
          setFetchError("No investment schemes available for this project");
        }

        // Check for existing profiles if we don't have them in restored state
        if (existingProfiles.length === 0) {
          await checkExistingProfiles();
        } else {
          setHasExistingProfiles(true);
        }
      } catch (error: any) {
        console.error("Fetch error:", error);
        setFetchError(
          error.response?.data?.message ||
            error.message ||
            "Error fetching data. Please try again."
        );
        toast({
          title: "Error",
          description:
            error.response?.data?.message ||
            error.message ||
            "Error fetching data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (!restoringState) {
      initializeData();
    }
  }, [id, toast, restoringState, existingProfiles.length]);

  useEffect(() => {
    // Auto-select scheme if provided in navigation state and schemes are loaded
    if (location.state?.selectedSchemeId && schemes.length > 0 && !selectedPlan) {
      const schemeToSelect = schemes.find(scheme => scheme.id === location.state.selectedSchemeId);
      if (schemeToSelect) {
        handlePlanSelection(schemeToSelect, 1);
      }
    }
  }, [schemes, location.state?.selectedSchemeId, selectedPlan]);

  // Handle profile selection from existing profiles
  const handleProfileSelection = (selectedProfileIds: string[]) => {
    const selectedAccounts: Account[] = [];
    const newSelectedProfileIds = [...selectedProfileIds];

    // Add primary account (first selected profile)
    const primaryProfile = existingProfiles.find(
      (profile) => profile.user_profile_id === newSelectedProfileIds[0]
    );
    if (primaryProfile) {
      selectedAccounts.push(convertProfileToAccount(primaryProfile, true));
    }

    // Add joint accounts (remaining selected profiles)
    newSelectedProfileIds.slice(1).forEach((profileId) => {
      const jointProfile = existingProfiles.find(
        (profile) => profile.user_profile_id === profileId
      );
      if (jointProfile) {
        selectedAccounts.push(convertProfileToAccount(jointProfile, false));
      }
    });

    setAccounts(selectedAccounts);
    setSelectedProfileIds(newSelectedProfileIds);
  };

  // Handle use existing profiles toggle
  const handleUseExistingProfilesChange = (value: boolean) => {
    setUseExistingProfiles(value);
    
    if (!value) {
      // When turning off, reset to default account
      setAccounts([getInitialAccount(user)]);
      setSelectedProfileIds([]);
    } else {
      // When turning on, ensure we have existing profiles
      if (existingProfiles.length === 0) {
        checkExistingProfiles();
      }
    }
  };

  // Plan selection handlers
  const handlePlanSelection = (scheme: Scheme, units: number) => {
    const type =
      scheme.scheme_type === "single_payment" ? "single" : "installment";

    // Compute totalPrice and basePerUnit
    const totalPrice =
      type === "single"
        ? scheme.booking_advance * units
        : scheme.total_installments! *
          scheme.monthly_installment_amount! *
          units;
    const basePerUnit =
      scheme.booking_advance ||
      (type === "installment" ? scheme.monthly_installment_amount! : 0);

    // min payment per selected units (respect MIN_PAYMENT_FLOOR)
    const minPayment = Math.max(basePerUnit * units, MIN_PAYMENT_FLOOR);

    const monthlyAmount =
      type === "installment"
        ? scheme.monthly_installment_amount! * units
        : undefined;

    setSelectedPlan({
      type,
      planId: scheme.id,
      area: scheme.area_sqft,
      price: totalPrice,
      totalInvestment: totalInvestment,
      monthlyAmount: monthlyAmount,
      installments:
        type === "installment" ? scheme.total_installments! : undefined,
      rentalStart: scheme.rental_start_month
        ? `${scheme.rental_start_month}th Month`
        : "Next month after last installment",
      monthlyRental:
        (scheme.monthly_rental_income ||
          (type === "installment"
            ? scheme.monthly_installment_amount! * 0.3
            : scheme.booking_advance * 0.01)) * units,
      units: units,
      paymentAmount: minPayment,
    });

    setCustomPayment(minPayment);
  };

  const handleUnitsChange = (increment: boolean) => {
    const newUnits = increment
      ? selectedUnits + 1
      : Math.max(1, selectedUnits - 1);
    setSelectedUnits(newUnits);

    if (selectedPlan) {
      const scheme = schemes.find((s) => s.id === selectedPlan.planId);
      if (scheme) {
        handlePlanSelection(scheme, newUnits);
      }
    }
  };

  const handleCustomPaymentChange = (value: string) => {
    const numValue = parseInt(value) || 0;

    // If plan is installment, do not allow changing custom payment
    if (selectedPlan && selectedPlan.type === "installment") {
      toast({
        title: "Not allowed",
        description:
          "Installment payments are fixed (advance or monthly). Custom amount is only allowed for single payment plans.",
        variant: "destructive",
      });
      return;
    }

    // Enforce gateway max
    if (numValue > GATEWAY_MAX) {
      toast({
        title: "Amount too large",
        description: `Payment cannot exceed ${GATEWAY_MAX.toLocaleString()}`,
        variant: "destructive",
      });
      // still set to max to avoid confusion
      setCustomPayment(GATEWAY_MAX);
      if (selectedPlan) {
        setSelectedPlan({
          ...selectedPlan,
          paymentAmount: GATEWAY_MAX,
        });
      }
      return;
    }

    // enforce minimum
    const minPayment = getMinPayment();
    if (numValue < minPayment) {
      // allow input but mark invalid via isValidPaymentAmount; optionally show toast
      setCustomPayment(numValue);
      if (selectedPlan) {
        setSelectedPlan({
          ...selectedPlan,
          paymentAmount: numValue,
        });
      }
      return;
    }

    setCustomPayment(numValue);
    if (selectedPlan) {
      setSelectedPlan({
        ...selectedPlan,
        paymentAmount: numValue,
      });
    }
  };

  // Validation helpers
  const getMinPayment = () => {
    if (!selectedPlan) return MIN_PAYMENT_FLOOR;
    const scheme = schemes.find((s) => s.id === selectedPlan.planId);
    if (!scheme) return MIN_PAYMENT_FLOOR;
    const type =
      scheme.scheme_type === "single_payment" ? "single" : "installment";
    const basePerUnit =
      scheme.booking_advance ||
      (type === "installment" ? scheme.monthly_installment_amount! : 0);
    return Math.max(basePerUnit * selectedPlan.units, MIN_PAYMENT_FLOOR);
  };

  const isValidPaymentAmount = () => {
    if (!selectedPlan) return false;
    const minPayment = getMinPayment();

    // For installment, payment is fixed and must be within min/max bounds
    if (selectedPlan.type === "installment") {
      const amt = selectedPlan.paymentAmount ?? 0;
      return amt >= minPayment && amt <= GATEWAY_MAX;
    }

    // For single payment allow custom payment but enforce min/max
    return customPayment >= minPayment && customPayment <= GATEWAY_MAX;
  };

  const validateUserInfo = () => {
    for (const account of accounts) {
      const data = account.data as UserInfo;
      if (!data.surname || !data.name || !account.termsAccepted) return false;

      if (!data.dob || !data.email) return false;
      if (!data.phone_number || !validatePhone(data.phone_number)) return false;
      if (!data.present_address.street || !data.present_address.city)
        return false;
      if (!data.occupation || !data.annual_income) return false;
      if (
        !data.account_details.account_number ||
        !data.account_details.ifsc_code
      )
        return false;

      // verified
      switch (data.user_type) {
        case "individual":
          if (!account.verified.pan || !account.verified.aadhar) return false;
          break;
        case "business":
          if (!account.verified.gst) return false;
          break;
        case "NRI":
          if (!account.verified.passport) return false;
          break;
      }
    }
    return true;
  };

  const validateKYC = () => {
    if (!kycAccepted) return false;
    const primary = accounts[0]?.data as UserInfo;
    if (!primary) return false;
    if (
      primary.user_type === "individual" &&
      (!kycDocuments.pan || !kycDocuments.aadhar || !kycDocuments.photo)
    )
      return false;
    if (
      primary.user_type === "business" &&
      (!kycDocuments.gst || !kycDocuments.photo)
    )
      return false;
    if (
      primary.user_type === "NRI" &&
      (!kycDocuments.passport || !kycDocuments.photo)
    )
      return false;

    if (accounts.length > 1 && !jointKycAccepted.every(Boolean)) return false;

    const jointAccounts = accounts
      .filter((account) => account.type === "joint")
      .map((account) => account.data as JointAccountInfo);
    for (let i = 0; i < jointAccounts.length; i++) {
      const joint = jointAccounts[i];
      const idx = i + 1;
      const base = `joint${idx}`;
      if (
        joint.user_type === "individual" &&
        (!kycDocuments[`${base}Pan`] ||
          !kycDocuments[`${base}Aadhar`] ||
          !kycDocuments[`${base}Photo`])
      )
        return false;
      if (
        joint.user_type === "business" &&
        (!kycDocuments[`${base}Gst`] || !kycDocuments[`${base}Photo`])
      )
        return false;
      if (
        joint.user_type === "NRI" &&
        (!kycDocuments[`${base}Passport`] || !kycDocuments[`${base}Photo`])
      )
        return false;
    }

    return true;
  };

  // User profiles creation - one by one
  const createUserProfiles = async (): Promise<string[]> => {
    const ids: string[] = [];
    const jointAccounts = accounts
      .filter((account) => account.type === "joint")
      .map((account) => account.data as JointAccountInfo);

    // Primary
    const primary = accounts.find((a) => a.type === "primary")
      ?.data as UserInfo;
    if (!primary) throw new Error("Primary account data missing");

    const primaryData: CreateUserProfileRequest = {
      surname: primary.surname,
      name: primary.name,
      dob: primary.dob,
      gender: primary.gender,
      present_address: primary.present_address,
      permanent_address: primary.sameAddress
        ? primary.present_address
        : primary.permanent_address,
      occupation: primary.occupation,
      annual_income: primary.annual_income,
      user_type: primary.user_type,
      pan_number:
        primary.user_type === "individual" ? primary.pan_number : null,
      aadhar_number:
        primary.user_type === "individual" ? primary.aadhar_number : null,
      gst_number: primary.user_type === "business" ? primary.gst_number : null,
      passport_number:
        primary.user_type === "NRI" ? primary.passport_number : null,
      phone_number: primary.phone_number,
      email: primary.email,
      account_details: primary.account_details,
    };

    const primaryFormData = new FormData();
    primaryFormData.append("profile_data", JSON.stringify(primaryData));

    let primaryDoc1: File | null = null;
    let primaryDoc2: File | null = null;
    if (primary.user_type === "individual") {
      primaryDoc1 = kycDocuments.pan as File;
      primaryDoc2 = kycDocuments.aadhar as File;
    } else if (primary.user_type === "business") {
      primaryDoc1 = kycDocuments.gst as File;
    } else if (primary.user_type === "NRI") {
      primaryDoc1 = kycDocuments.passport as File;
    }

    if (!primaryDoc1)
      throw new Error("Missing required document for primary user");

    primaryFormData.append("document1", primaryDoc1);
    if (primaryDoc2) primaryFormData.append("document2", primaryDoc2);

    const primaryPhoto = kycDocuments.photo as File;
    if (!primaryPhoto) throw new Error("Missing photo for primary user");
    primaryFormData.append("photo", primaryPhoto);

    try {
      const primaryResponse = await userProfileApi.createUserProfile(
        primaryFormData
      );
      if (primaryResponse.data.user_profile_id) {
        ids.push(primaryResponse.data.user_profile_id);
      } else {
        throw new Error("No user profile ID returned for primary user");
      }
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to create primary user profile"
      );
    }

    // Joints
    for (let i = 0; i < jointAccounts.length; i++) {
      const joint = jointAccounts[i] as UserInfo;
      const jointIndex = i + 1;
      const baseKey = `joint${jointIndex}`;

      const jointData: CreateUserProfileRequest = {
        surname: joint.surname,
        name: joint.name,
        dob: joint.dob,
        gender: joint.gender,
        present_address: joint.present_address,
        permanent_address: joint.sameAddress
          ? joint.present_address
          : joint.permanent_address,
        occupation: joint.occupation,
        annual_income: joint.annual_income,
        user_type: joint.user_type,
        pan_number: joint.user_type === "individual" ? joint.pan_number : null,
        aadhar_number:
          joint.user_type === "individual" ? joint.aadhar_number : null,
        gst_number: joint.user_type === "business" ? joint.gst_number : null,
        passport_number:
          joint.user_type === "NRI" ? joint.passport_number : null,
        phone_number: joint.phone_number,
        email: joint.email,
        account_details: joint.account_details,
      };

      const jointFormData = new FormData();
      jointFormData.append("profile_data", JSON.stringify(jointData));

      let jointDoc1: File | null = null;
      let jointDoc2: File | null = null;
      if (joint.user_type === "individual") {
        jointDoc1 = kycDocuments[`${baseKey}Pan`] as File;
        jointDoc2 = kycDocuments[`${baseKey}Aadhar`] as File;
      } else if (joint.user_type === "business") {
        jointDoc1 = kycDocuments[`${baseKey}Gst`] as File;
      } else if (joint.user_type === "NRI") {
        jointDoc1 = kycDocuments[`${baseKey}Passport`] as File;
      }

      if (!jointDoc1)
        throw new Error(
          `Missing required document for joint user ${jointIndex}`
        );

      jointFormData.append("document1", jointDoc1);
      if (jointDoc2) jointFormData.append("document2", jointDoc2);
      
      const jointPhoto = kycDocuments[`${baseKey}Photo`] as File;
      if (!jointPhoto) throw new Error(`Missing photo for joint user ${jointIndex}`);
      jointFormData.append("photo", jointPhoto);

      try {
        const jointResponse = await userProfileApi.createUserProfile(
          jointFormData
        );
        if (jointResponse.data.user_profile_id) {
          ids.push(jointResponse.data.user_profile_id);
        } else {
          throw new Error(
            `No user profile ID returned for joint user ${jointIndex}`
          );
        }
      } catch (error: any) {
        throw new Error(
          error.response?.data?.message ||
            `Failed to create joint user ${jointIndex} profile`
        );
      }
    }

    return ids;
  };

  // Navigation handlers
  const nextStep = async () => {
    setLoading(true);

    try {
      if (currentStep === "plan-selection" && selectedPlan) {
        setCurrentStep("user-info");
      } else if (currentStep === "user-info" && validateUserInfo()) {
        if (useExistingProfiles) {
          setCurrentStep("payment");
          toast({ title: "Skipped", description: "Using existing profiles." });
        } else {
          setCurrentStep("kyc");
        }
      } else if (currentStep === "kyc" && validateKYC()) {
        if (!useExistingProfiles) {
          const newUserProfileIds = await createUserProfiles();
          setUserProfileIds(newUserProfileIds);
          toast({
            title: "Success",
            description: "User profiles created successfully",
          });
        }
        setCurrentStep("payment");
      } else if (currentStep === "payment") {
        // Final verification before proceeding to confirmation/payment success
        const paymentAmount =
          selectedPlan?.type === "installment"
            ? selectedPlan.paymentAmount ?? 0
            : customPayment;

        // check min/max
        const minPayment = getMinPayment();
        if (paymentAmount < minPayment) {
          throw new Error(
            `Payment amount is less than minimum required: ${minPayment}`
          );
        }
        if (paymentAmount > GATEWAY_MAX) {
          throw new Error(
            `Payment amount exceeds maximum allowed by gateway: ${GATEWAY_MAX}`
          );
        }

        // Validate we have profile IDs
        const profileIdsForPayment = getProfileIdsForPayment();
        if (!profileIdsForPayment || profileIdsForPayment.length === 0) {
          throw new Error("No user profiles found. Please complete previous steps.");
        }

        // Fake delay / payment processing
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
    return selectedPlan ? selectedPlan.paymentAmount! : 0;
  };

  const handlePurchaseSuccess = (data: any) => {
    console.log("Purchase successful:", data);
    setCurrentStep("confirmation");
    toast({
      title: "Payment Successful",
      description: "Your investment has been confirmed!",
    });
  };

  const handleUserInfoSubmit = async (
    submittedAccounts: Account[]
  ): Promise<boolean> => {
    setAccounts(submittedAccounts);

    // Validate the user info
    if (validateUserInfo()) {
      toast({
        title: "Success",
        description: "User info saved successfully",
      });

      // Automatically navigate to KYC step after successful submission
      setCurrentStep("kyc");
      return true;
    } else {
      toast({
        title: "Error",
        description: "Please fix validation errors before continuing",
        variant: "destructive",
      });
      return false;
    }
  };

  // Handle direct to payment with existing profiles
  const handleDirectToPayment = (profileIds: string[]) => {
    // Make sure we set both selectedProfileIds and useExistingProfiles
    setSelectedProfileIds(profileIds);
    setUseExistingProfiles(true);
    setCurrentStep("payment");
    toast({
      title: "Success",
      description: "Using existing verified profiles. Proceeding to payment.",
    });
  };

  // Render different steps
  const renderCurrentStep = () => {
    switch (currentStep) {
      case "plan-selection":
        return (
          <PlanSelectionStep
            schemes={schemes}
            totalInvestment={totalInvestment}
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
            onPlanSelected={scrollToOrderSummary}
          />
        );

      case "user-info":
        return (
          <div className="space-y-6">
            <UserInfoPage
              accounts={accounts}
              onSubmit={handleUserInfoSubmit}
              onAccountsChange={setAccounts}
              onDirectToPayment={handleDirectToPayment}
              onContinueToKYC={() => setCurrentStep("kyc")}
              existingProfiles={existingProfiles}
              useExistingProfiles={useExistingProfiles}
              onUseExistingProfilesChange={handleUseExistingProfilesChange}
              selectedProfileIds={selectedProfileIds}
              onProfileSelection={handleProfileSelection}
            />
          </div>
        );

      case "kyc":
        const jointAccounts = accounts
          .filter((account) => account.type === "joint")
          .map((account) => account.data as JointAccountInfo);

        return (
          <div className="space-y-6">
            <KYCForm
              projectName={projectName}
              kycDocuments={kycDocuments}
              setKycDocuments={setKycDocuments}
              kycAccepted={kycAccepted}
              setKycAccepted={setKycAccepted}
              userType={
                (accounts[0]?.data as UserInfo)?.user_type || "individual"
              }
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
              projectName={projectName}
              projectId={id!}
              schemeId={selectedPlan.planId}
              totalInvestmentOfProject={totalInvestment}
              isJointOwnership={accounts.length > 1}
              numberOfUnits={selectedUnits}
              onPurchaseSuccess={handlePurchaseSuccess}
              userProfileIds={getProfileIdsForPayment()}
              schemeData={schemes.find((s) => s.id === selectedPlan.planId)}
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
  if (restoringState) {
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
            <p className="text-muted-foreground">
              Complete your investment in a few simple steps
            </p>
          </div>

          <PurchaseProgress currentStep={currentStep} />

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left content - scrollable */}
            <div className="lg:col-span-2 lg:max-h-[calc(100vh-200px)] lg:overflow-y-auto">
              {renderCurrentStep()}
            </div>

            {/* Right sidebar - fixed/sticky */}
            <div className="lg:sticky lg:top-24 lg:h-fit">
              <OrderSummary
                ref={orderSummaryRef}
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
    </div>
  );
};

export default PurchaseFlow;