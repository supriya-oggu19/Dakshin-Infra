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
  Minus
} from "lucide-react";
import Navigation from "@/components/Navigation";
import { useAuth } from "@/contexts/AuthContext";
import UserInfoForm from "@/pages/UserInfoForm";
import KYCForm from "./KYCForm";
import { useToast } from "@/components/ui/use-toast";

type PurchaseStep = 'plan-selection' | 'user-info' | 'kyc' | 'payment' | 'confirmation';

interface Scheme {
  id: string;
  project_id: string;
  scheme_type: 'single_payment' | 'installment';
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
  type: 'single' | 'installment';
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

interface UserInfo {
  firstName: string;
  lastName: string;
  dob: string;
  gender: 'male' | 'female' | 'other';
  email: string;
  phone: string;
  presentAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  permanentAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  occupation: string;
  annualIncome: string;
  panNumber: string;
  aadharNumber: string;
  gstNumber: string;
  passportNumber: string;
  sameAddress: boolean;
  userType: 'individual' | 'business' | 'nri';
}

interface KYCDocuments {
  panCard?: File | null;
  aadharCard?: File | null;
  gstDocument?: File | null;
  passportPhoto?: File | null;
}

const PurchaseFlow = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState<PurchaseStep>('plan-selection');
  const [selectedPlan, setSelectedPlan] = useState<PlanSelection | null>(null);
  const [selectedUnits, setSelectedUnits] = useState<number>(1);
  const [customPayment, setCustomPayment] = useState<string>('');
  const [userInfo, setUserInfo] = useState<UserInfo>({
    firstName: '',
    lastName: '',
    dob: '',
    gender: 'male',
    email: user?.email || '',
    phone: '',
    presentAddress: {
      street: '',
      city: '',
      state: '',
      pincode: '',
    },
    permanentAddress: {
      street: '',
      city: '',
      state: '',
      pincode: '',
    },
    occupation: '',
    annualIncome: '',
    panNumber: '',
    aadharNumber: '',
    gstNumber: '',
    passportNumber: '',
    sameAddress: true,
    userType: 'individual',
  });
  const [kycDocuments, setKycDocuments] = useState<KYCDocuments>({
    panCard: null,
    aadharCard: null,
    gstDocument: null,
    passportPhoto: null
  });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [kycAccepted, setKycAccepted] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'netbanking' | 'card'>('upi');
  const [loading, setLoading] = useState(false);
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      console.log('User not authenticated, redirecting to login');
      navigate('/login', { state: { from: `/purchase/${id}` } });
    }
  }, [isAuthenticated, navigate, id]);

  // Fetch schemes for the project
  useEffect(() => {
    const fetchSchemes = async () => {
      if (!id) {
        setFetchError('Invalid project ID');
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
        const response = await fetch(`http://127.0.0.1:8001/api/investment-schemes/project?project_id=${id}&page=1&limit=5`);
        const data = await response.json();
        console.log('API response:', data);

        if (response.ok && data.message === 'Investment schemes for project retrieved successfully') {
          setSchemes(data.schemes || []);
          if (!data.schemes || data.schemes.length === 0) {
            setFetchError('No investment schemes available for this project');
            toast({
              title: "No Schemes",
              description: "No investment schemes available for this project",
              variant: "destructive",
            });
          }
        } else {
          setFetchError(data.message || 'Failed to fetch investment schemes');
          toast({
            title: "Error",
            description: data.message || 'Failed to fetch investment schemes',
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Fetch error:', error);
        setFetchError('Error fetching schemes. Please try again.');
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
    const type = scheme.scheme_type === 'single_payment' ? 'single' : 'installment';
    const totalPrice = type === 'single'
      ? scheme.booking_advance * units
      : (scheme.total_installments! * scheme.monthly_installment_amount! * units);
    const minPayment = scheme.booking_advance * units;

    setSelectedPlan({
      type,
      planId: scheme.id,
      area: scheme.area_sqft,
      price: totalPrice,
      monthlyAmount: type === 'installment' ? scheme.monthly_installment_amount! * units : undefined,
      installments: type === 'installment' ? scheme.total_installments! : undefined,
      rentalStart: scheme.rental_start_month
        ? `${scheme.rental_start_month}th Month`
        : 'Next month after last installment',
      monthlyRental: scheme.monthly_installment_amount
        ? scheme.monthly_installment_amount * units * 0.3
        : scheme.booking_advance * units * 0.01,
      units: units,
      paymentAmount: type === 'single' ? minPayment : undefined
    });

    if (type === 'single') {
      setCustomPayment(minPayment.toString());
    }
  };

  const handleUnitsChange = (increment: boolean) => {
    const newUnits = increment ? selectedUnits + 1 : Math.max(1, selectedUnits - 1);
    setSelectedUnits(newUnits);

    if (selectedPlan) {
      const scheme = schemes.find(s => s.id === selectedPlan.planId);
      if (scheme) {
        handlePlanSelection(scheme, newUnits); // Pass newUnits directly
      }
    }
  };

  // const handlePlanSelection = (scheme: Scheme) => {
  //   const type = scheme.scheme_type === 'single_payment' ? 'single' : 'installment';
  //   const totalPrice = type === 'single'
  //     ? scheme.booking_advance * selectedUnits
  //     : (scheme.total_installments! * scheme.monthly_installment_amount! * selectedUnits);
  //   const minPayment = scheme.booking_advance * selectedUnits;

  //   setSelectedPlan({
  //     type,
  //     planId: scheme.id,
  //     area: scheme.area_sqft,
  //     price: totalPrice,
  //     monthlyAmount: type === 'installment' ? scheme.monthly_installment_amount! * selectedUnits : undefined,
  //     installments: type === 'installment' ? scheme.total_installments! : undefined,
  //     rentalStart: scheme.rental_start_month
  //       ? `${scheme.rental_start_month}th Month`
  //       : 'Next month after last installment',
  //     monthlyRental: scheme.monthly_installment_amount
  //       ? scheme.monthly_installment_amount * selectedUnits * 0.3
  //       : scheme.booking_advance * selectedUnits * 0.01,
  //     units: selectedUnits,
  //     paymentAmount: type === 'single' ? minPayment : undefined
  //   });

  //   if (type === 'single') {
  //     setCustomPayment(minPayment.toString());
  //   }
  // };

  // const handleUnitsChange = (increment: boolean) => {
  //   const newUnits = increment ? selectedUnits + 1 : Math.max(1, selectedUnits - 1);
  //   setSelectedUnits(newUnits);

  //   if (selectedPlan) {
  //     const scheme = schemes.find(s => s.id === selectedPlan.planId);
  //     if (scheme) {
  //       handlePlanSelection(scheme);
  //     }
  //   }
  // };

  const handleCustomPaymentChange = (value: string) => {
    setCustomPayment(value);
    if (selectedPlan && selectedPlan.type === 'single') {
      const paymentAmount = parseInt(value) || 0;
      setSelectedPlan({
        ...selectedPlan,
        paymentAmount
      });
    }
  };

  const getMinPayment = () => {
    return selectedPlan ? schemes.find(s => s.id === selectedPlan.planId)?.booking_advance! * selectedPlan.units : 200000;
  };

  const isValidPaymentAmount = () => {
    if (!selectedPlan || selectedPlan.type !== 'single') return true;
    const paymentAmount = parseInt(customPayment) || 0;
    return paymentAmount >= getMinPayment();
  };

  const validateUserInfo = () => {
    const requiredFields = ['firstName', 'lastName', 'dob', 'gender', 'email', 'phone', 'occupation', 'annualIncome'];
    const addressRequired = ['street', 'city', 'state', 'pincode'];
    const isUserValid = requiredFields.every(field => userInfo[field as keyof Omit<UserInfo, 'presentAddress' | 'permanentAddress' | 'sameAddress' | 'userType' | 'gstNumber' | 'passportNumber'>]);
    const isPresentAddressValid = addressRequired.every(field => userInfo.presentAddress[field as keyof UserInfo['presentAddress']].trim() !== '');
    const isPermanentAddressValid = userInfo.sameAddress || addressRequired.every(field => userInfo.permanentAddress[field as keyof UserInfo['permanentAddress']].trim() !== '');
    let isTypeValid = false;
    if (userInfo.userType === 'individual') {
      isTypeValid = !!userInfo.panNumber && !!userInfo.aadharNumber;
    } else if (userInfo.userType === 'business') {
      isTypeValid = !!userInfo.gstNumber;
    } else if (userInfo.userType === 'nri') {
      isTypeValid = !!userInfo.passportNumber;
    }
    return isUserValid && isPresentAddressValid && isPermanentAddressValid && isTypeValid;
  };

  const validateKYC = () => {
    let requiredDocs = false;
    if (userInfo.userType === 'individual') {
      requiredDocs = !!kycDocuments.panCard && !!kycDocuments.aadharCard;
    } else if (userInfo.userType === 'business') {
      requiredDocs = !!kycDocuments.gstDocument;
    } else {
      requiredDocs = !!kycDocuments.passportPhoto;
    }
    return requiredDocs && kycAccepted;
  };

  const nextStep = async () => {
    setLoading(true);

    try {
      if (currentStep === 'plan-selection' && selectedPlan) {
        setCurrentStep('user-info');
      } else if (currentStep === 'user-info' && validateUserInfo() && termsAccepted) {
        setCurrentStep('kyc');
      } else if (currentStep === 'kyc' && validateKYC()) {
        const token = localStorage.getItem('authToken');
        if (!token) {
          throw new Error('Authentication token not found');
        }

        const profileData = {
          surname: userInfo.lastName,
          name: userInfo.firstName,
          dob: userInfo.dob,
          gender: userInfo.gender,
          present_address: {
            street: userInfo.presentAddress.street,
            city: userInfo.presentAddress.city,
            state: userInfo.presentAddress.state,
            country: 'India',
            postal_code: userInfo.presentAddress.pincode,
          },
          permanent_address: {
            street: userInfo.sameAddress ? userInfo.presentAddress.street : userInfo.permanentAddress.street,
            city: userInfo.sameAddress ? userInfo.presentAddress.city : userInfo.permanentAddress.city,
            state: userInfo.sameAddress ? userInfo.presentAddress.state : userInfo.permanentAddress.state,
            country: 'India',
            postal_code: userInfo.sameAddress ? userInfo.presentAddress.pincode : userInfo.permanentAddress.pincode,
          },
          occupation: userInfo.occupation,
          annual_income: userInfo.annualIncome,
          user_type: userInfo.userType,
          pan_number: userInfo.userType === 'individual' ? userInfo.panNumber : null,
          aadhar_number: userInfo.userType === 'individual' ? userInfo.aadharNumber : null,
          gst_number: userInfo.userType === 'business' ? userInfo.gstNumber : null,
          passport_number: userInfo.userType === 'nri' ? userInfo.passportNumber : null,
          phone_number: userInfo.phone,
          email: userInfo.email,
        };

        const formData = new FormData();
        formData.append('profile_data', JSON.stringify(profileData));

        if (userInfo.userType === 'individual') {
          if (kycDocuments.panCard) formData.append('document1', kycDocuments.panCard);
          if (kycDocuments.aadharCard) formData.append('document2', kycDocuments.aadharCard);
        } else if (userInfo.userType === 'business') {
          if (kycDocuments.gstDocument) formData.append('document1', kycDocuments.gstDocument);
        } else if (userInfo.userType === 'nri') {
          if (kycDocuments.passportPhoto) formData.append('document1', kycDocuments.passportPhoto);
        }

        const response = await fetch('http://localhost:8000/api/user_profile/create', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        const responseData = await response.json();
        if (!response.ok) {
          throw new Error(responseData.message || 'Failed to create user profile');
        }

        toast({
          title: "Success",
          description: "User profile created successfully",
        });
        setCurrentStep('payment');
      } else if (currentStep === 'payment') {
        await new Promise(resolve => setTimeout(resolve, 2000));
        setCurrentStep('confirmation');
        toast({
          title: "Payment Successful",
          description: "Your investment has been confirmed!",
        });
      }
    } catch (error) {
      console.error('Next step error:', error);
      setFetchError((error as Error).message || 'An error occurred');
      toast({
        title: "Error",
        description: (error as Error).message || 'An error occurred',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const prevStep = () => {
    if (currentStep === 'user-info') setCurrentStep('plan-selection');
    else if (currentStep === 'kyc') setCurrentStep('user-info');
    else if (currentStep === 'payment') setCurrentStep('kyc');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStepStatus = (step: PurchaseStep) => {
    const steps = ['plan-selection', 'user-info', 'kyc', 'payment', 'confirmation'];
    const currentIndex = steps.indexOf(currentStep);
    const stepIndex = steps.indexOf(step);

    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'pending';
  };

  const getCurrentPaymentAmount = () => {
    if (!selectedPlan) return 0;

    if (selectedPlan.type === 'installment') {
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
                { key: 'plan-selection', label: 'Select Plan', icon: Building },
                { key: 'user-info', label: 'Your Information', icon: User },
                { key: 'kyc', label: 'KYC Documents', icon: FileText },
                { key: 'payment', label: 'Payment', icon: CreditCard },
                { key: 'confirmation', label: 'Confirmation', icon: CheckCircle }
              ].map((step, index) => {
                const Icon = step.icon;
                const status = getStepStatus(step.key as PurchaseStep);

                return (
                  <div key={step.key} className="flex items-center">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${status === 'completed' ? 'bg-primary border-primary text-primary-foreground' :
                      status === 'active' ? 'border-primary text-primary bg-primary/10' :
                        'border-muted text-muted-foreground'
                      }`}>
                      {status === 'completed' ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <Icon className="w-5 h-5" />
                      )}
                    </div>
                    <span className={`ml-2 text-sm font-medium hidden sm:block ${status === 'active' ? 'text-primary' :
                      status === 'completed' ? 'text-foreground' : 'text-muted-foreground'
                      }`}>
                      {step.label}
                    </span>
                    {index < 4 && (
                      <div className={`w-8 sm:w-16 h-0.5 mx-2 sm:mx-4 ${status === 'completed' ? 'bg-primary' : 'bg-muted'
                        }`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {currentStep === 'plan-selection' && (
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
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUnitsChange(false)}
                            disabled={selectedUnits <= 1}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <div className="w-16 text-center py-2 px-3 border rounded-md font-medium">
                            {selectedUnits}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUnitsChange(true)}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Total Area: {selectedPlan ? selectedPlan.area * selectedUnits : 'Select a plan'} sqft
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
                              {schemes.filter(s => s.scheme_type === 'single_payment').map((scheme) => (
                                <div
                                  key={scheme.id}
                                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedPlan?.planId === scheme.id
                                    ? 'border-primary bg-primary/5'
                                    : 'border-border hover:border-primary/50'
                                    }`}
                                  onClick={() => handlePlanSelection(scheme, selectedUnits)} // Pass selectedUnits
                                >
                                  <div className="text-center">
                                    <div className="text-2xl font-bold text-primary mb-2">{scheme.area_sqft} sqft</div>
                                    <div className="text-sm text-muted-foreground mb-2">Booking Advance</div>
                                    <div className="text-lg font-bold text-primary mb-3">{formatCurrency(scheme.booking_advance)}</div>
                                    <div className="bg-primary/10 p-2 rounded mb-3">
                                      <div className="text-xs text-muted-foreground">Monthly Rental (per unit)</div>
                                      <div className="text-lg font-bold text-primary">
                                        {formatCurrency(scheme.monthly_installment_amount
                                          ? scheme.monthly_installment_amount * 0.3
                                          : scheme.booking_advance * 0.01)}
                                      </div>
                                    </div>
                                    <div className="text-sm text-muted-foreground mb-2">
                                      Rental starts from: {scheme.rental_start_month ? `${scheme.rental_start_month}th Month` : 'N/A'}
                                    </div>
                                    <div className="text-sm font-medium">
                                      Total per unit: {formatCurrency(scheme.booking_advance)}
                                    </div>
                                    <div className="mt-1 text-xs text-muted-foreground">
                                      Total for {selectedUnits} unit{selectedUnits > 1 ? 's' : ''}: {formatCurrency(scheme.booking_advance * selectedUnits)}
                                    </div>
                                  </div>
                                </div>
                              ))}
                              {selectedPlan?.type === 'single' && (
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
                                      <p className="text-xs text-red-600 mt-1">
                                        Payment must be at least {formatCurrency(getMinPayment())}
                                      </p>
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
                                      <li>• Remaining balance must be paid within {schemes.find(s => s.id === selectedPlan.planId)?.balance_payment_days || 90} days</li>
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
                              {schemes.filter(s => s.scheme_type === 'installment').map((scheme) => (
                                <div
                                  key={scheme.id}
                                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedPlan?.planId === scheme.id
                                    ? 'border-primary bg-primary/5'
                                    : 'border-border hover:border-primary/50'
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
                                      Total for {selectedUnits} unit{selectedUnits > 1 ? 's' : ''}: {formatCurrency(scheme.total_installments! * scheme.monthly_installment_amount! * selectedUnits)}
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

              {currentStep === 'user-info' && (
                <div className="space-y-6">
                  <UserInfoForm
                    userInfo={userInfo}
                    setUserInfo={setUserInfo}
                    termsAccepted={termsAccepted}
                    setTermsAccepted={setTermsAccepted}
                  />
                </div>
              )}

              {currentStep === 'kyc' && (
                <div className="space-y-6">
                  <KYCForm
                    kycDocuments={kycDocuments}
                    setKycDocuments={setKycDocuments}
                    kycAccepted={kycAccepted}
                    setKycAccepted={setKycAccepted}
                    userType={userInfo.userType}
                  />
                </div>
              )}

              {currentStep === 'payment' && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <CreditCard className="w-5 h-5 mr-2" />
                        Payment Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <label className="text-sm font-medium mb-3 block">Select Payment Method</label>
                        <div className="grid grid-cols-3 gap-4">
                          {[
                            { key: 'upi', label: 'UPI', icon: '📱' },
                            { key: 'netbanking', label: 'Net Banking', icon: '🏦' },
                            { key: 'card', label: 'Credit/Debit Card', icon: '💳' }
                          ].map((method) => (
                            <div
                              key={method.key}
                              className={`p-4 border-2 rounded-lg cursor-pointer text-center transition-all ${paymentMethod === method.key
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-primary/50'
                                }`}
                              onClick={() => setPaymentMethod(method.key as 'upi' | 'netbanking' | 'card')}
                            >
                              <div className="text-2xl mb-2">{method.icon}</div>
                              <div className="text-sm font-medium">{method.label}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {paymentMethod === 'upi' && (
                        <div className="text-center p-6 bg-muted/30 rounded-lg">
                          <div className="text-lg font-medium mb-2">Scan QR Code to Pay</div>
                          <div className="w-48 h-48 bg-white mx-auto mb-4 flex items-center justify-center border">
                            <div className="text-xs text-muted-foreground">QR Code will appear here</div>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Or use UPI ID: payment@kapilbusinesspark.com
                          </p>
                        </div>
                      )}

                      {paymentMethod === 'netbanking' && (
                        <div className="space-y-4">
                          <div>
                            <label htmlFor="bank">Select Your Bank</label>
                            <select id="bank" className="w-full p-2 border rounded-md">
                              <option>Choose your bank</option>
                              <option value="sbi">State Bank of India</option>
                              <option value="hdfc">HDFC Bank</option>
                              <option value="icici">ICICI Bank</option>
                              <option value="axis">Axis Bank</option>
                              <option value="pnb">Punjab National Bank</option>
                            </select>
                          </div>
                        </div>
                      )}

                      {paymentMethod === 'card' && (
                        <div className="space-y-4">
                          <div>
                            <label htmlFor="cardNumber">Card Number</label>
                            <input
                              id="cardNumber"
                              className="w-full p-2 border rounded-md"
                              placeholder="1234 5678 9012 3456"
                              maxLength={19}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label htmlFor="expiryDate">Expiry Date</label>
                              <input
                                id="expiryDate"
                                className="w-full p-2 border rounded-md"
                                placeholder="MM/YY"
                                maxLength={5}
                              />
                            </div>
                            <div>
                              <label htmlFor="cvv">CVV</label>
                              <input
                                id="cvv"
                                className="w-full p-2 border rounded-md"
                                placeholder="123"
                                maxLength={3}
                                type="password"
                              />
                            </div>
                          </div>
                          <div>
                            <label htmlFor="cardholderName">Cardholder Name</label>
                            <input
                              id="cardholderName"
                              className="w-full p-2 border rounded-md"
                              placeholder="Enter name as on card"
                            />
                          </div>
                        </div>
                      )}

                      <div className="flex items-center space-x-2 p-4 bg-blue-50 rounded-lg">
                        <Shield className="w-5 h-5 text-blue-600" />
                        <span className="text-sm text-blue-800">
                          Your payment is secured with 256-bit SSL encryption
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {currentStep === 'confirmation' && (
                <div className="space-y-6">
                  <Card>
                    <CardContent className="text-center py-12">
                      <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                      <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
                      <p className="text-muted-foreground mb-6">
                        Your investment in Kapil Business Park has been confirmed.
                      </p>
                      <div className="bg-muted/30 p-4 rounded-lg mb-6">
                        <div className="text-sm text-muted-foreground">Transaction ID</div>
                        <div className="font-mono text-lg">KBP{Date.now()}</div>
                      </div>
                      <div className="space-y-2">
                        <Button className="w-full" onClick={() => navigate('/my-units')}>
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
                        <span className="text-sm font-medium">
                          {selectedPlan.type === 'single' ? 'Single Payment' : 'Installment'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Number of Units</span>
                        <span className="text-sm font-medium"></span>
                        ({selectedPlan.units})
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Area per Unit</span>
                        <span className="text-sm font-medium">{selectedPlan.area} sq ft</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Total Area</span>
                        <span className="text-sm font-medium">{selectedPlan.area * selectedPlan.units} sq ft</span>
                      </div>
                      {selectedPlan.type === 'installment' && (
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
                      {selectedPlan.type === 'single' && (
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
                        <span>
                          {currentStep === 'plan-selection' || currentStep === 'user-info'
                            ? (selectedPlan.type === 'single' ? 'Payment Now' : 'First Installment')
                            : 'Total Amount'}
                        </span>
                        <span className="text-primary">
                          {formatCurrency(getCurrentPaymentAmount())}
                        </span>
                      </div>
                    </div>

                    {selectedPlan.type === 'single' && currentStep !== 'confirmation' && getCurrentPaymentAmount() < selectedPlan.price && (
                      <div className="text-xs text-orange-700 p-3 bg-orange-50 rounded border-l-4 border-orange-400">
                        <div className="font-medium mb-1">Payment Schedule:</div>
                        <div>• Now: {formatCurrency(getCurrentPaymentAmount())}</div>
                        <div>• Within {schemes.find(s => s.id === selectedPlan.planId)?.balance_payment_days || 90} days: {formatCurrency(selectedPlan.price - getCurrentPaymentAmount())}</div>
                        <div className="mt-1 text-orange-600">* Balance payment is mandatory within {schemes.find(s => s.id === selectedPlan.planId)?.balance_payment_days || 90} days</div>
                      </div>
                    )}

                    {currentStep !== 'confirmation' && (
                      <div className="pt-4 space-y-2">
                        {currentStep !== 'plan-selection' && (
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
                            (currentStep === 'plan-selection' && (!selectedPlan || (selectedPlan.type === 'single' && !isValidPaymentAmount()))) ||
                            (currentStep === 'user-info' && (!validateUserInfo() || !termsAccepted)) ||
                            (currentStep === 'kyc' && !validateKYC())
                          }
                        >
                          {loading ? (
                            <div className="flex items-center">
                              <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                              Processing...
                            </div>
                          ) : (
                            <>
                              {currentStep === 'payment' ? 'Complete Payment' : 'Continue'}
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