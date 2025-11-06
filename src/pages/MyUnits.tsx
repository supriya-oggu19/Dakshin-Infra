import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building2,
  Calendar,
  MapPin,
  TrendingUp,
  Clock,
  IndianRupee,
  Download,
  Eye,
  Loader2,
  CreditCard,
  Award,
  AlertTriangle,
} from "lucide-react";
import Navigation from "@/components/Navigation";
import { portfolioApi } from "../api/portfolio-api";
import { paymentApi } from "../api/paymentApi";
import {
  PortfolioItem,
  InvestmentSummaryResponse,
} from "../api/models/portfolio.model";
import PaymentModal from "@/components/PaymentModal";
import { Link } from "react-router-dom";

// Payment Data Interfaces
interface Payment {
  transaction_type: string;
  order_id: string;
  amount: number;
  payment_date: string;
  due_date: string | null;
  payment_method: string;
  payment_status: string;
  installment_number: number;
  penalty_amount: number;
  rebate_amount: number;
  receipt_id: string;
}

interface PaymentData {
  unit_number: string;
  total_payments: number;
  payments: Payment[];
  next_installment?: {
    installment_number: number;
    due_date: string;
    amount: number;
    status: string;
  };
}

// Enum types
type UnitStatus = 'payment_ongoing' | 'active' | 'rental_active' | 'none';
type PaymentStatus = 'advance_paid' | 'partially_paid' | 'fully_paid' | 'none';

const MyUnits = () => {
  const [portfolioData, setPortfolioData] = useState<PortfolioItem[]>([]);
  const [investmentSummary, setInvestmentSummary] =
    useState<InvestmentSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<PortfolioItem | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [customerInfo, setCustomerInfo] = useState<any>(null);
  const [loadingCustomerInfo, setLoadingCustomerInfo] = useState(false);

  // Payment data state for each unit
  const [paymentDataMap, setPaymentDataMap] = useState<
    Record<string, PaymentData>
  >({});
  const [loadingPayments, setLoadingPayments] = useState<
    Record<string, boolean>
  >({});
  const [activeTabs, setActiveTabs] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [portfolioResponse, summaryResponse] = await Promise.all([
        portfolioApi.getPortfolio(),
        portfolioApi.getInvestmentSummary(),
      ]);

      const portfolio = portfolioResponse.data.portfolio || [];
      setPortfolioData(portfolio);
      setInvestmentSummary(summaryResponse.data);

      // Initialize active tabs for each unit
      const initialTabs: Record<string, string> = {};
      portfolio.forEach((unit) => {
        initialTabs[unit.unit_number] = "overview";
      });
      setActiveTabs(initialTabs);
    } catch (err: any) {
      console.error("Error fetching user data:", err);
      setError(err.response?.data?.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentData = async (unitNumber: string) => {
    try {
      setLoadingPayments((prev) => ({ ...prev, [unitNumber]: true }));
      const response = await paymentApi.getPaymentList({ unit_number: unitNumber });
      const paymentData = response.data;
      setPaymentDataMap((prev) => ({
        ...prev,
        [unitNumber]: paymentData,
      }));
    } catch (err: any) {
      console.error("Error fetching payment data:", err);
      setPaymentDataMap((prev) => ({
        ...prev,
        [unitNumber]: {
          unit_number: unitNumber,
          total_payments: 0,
          payments: [],
        },
      }));
    } finally {
      setLoadingPayments((prev) => ({ ...prev, [unitNumber]: false }));
    }
  };

  const handleTabChange = (unitNumber: string, value: string) => {
    setActiveTabs((prev) => ({
      ...prev,
      [unitNumber]: value,
    }));

    // Fetch payment data when Payments tab is selected
    if (value === "payments" && !paymentDataMap[unitNumber]) {
      fetchPaymentData(unitNumber);
    }
  };

  const handleMakePayment = async (unit: PortfolioItem) => {
    setSelectedUnit(unit);
    setLoadingCustomerInfo(true);

    try {
      const response = await paymentApi.getCustomerInfo(unit.unit_number);
      const customerData = response.data;

      setCustomerInfo(customerData);
    } catch (err) {
      console.error("Error fetching customer info:", err);

      // fallback defaults
      setCustomerInfo({
        customer_name: "",
        customer_email: "",
        customer_phone: "",
      });
    } finally {
      setLoadingCustomerInfo(false);
      setShowPaymentModal(true);
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)}Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(1)}K`;
    }
    return `₹${amount}`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Not Available";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Validation functions using enums
  const isPaymentFullyPaid = (paymentStatus: PaymentStatus): boolean => {
    return paymentStatus === 'fully_paid';
  };

  const isPaymentOngoing = (paymentStatus: PaymentStatus): boolean => {
    return paymentStatus === 'advance_paid' || paymentStatus === 'partially_paid';
  };

  const isRentalActive = (unitStatus: UnitStatus): boolean => {
    return unitStatus === 'rental_active';
  };

  const isUnitActive = (unitStatus: UnitStatus): boolean => {
    return unitStatus === 'active';
  };

  const isPaymentNone = (paymentStatus: PaymentStatus): boolean => {
    return paymentStatus === 'none';
  };

  const isUnitStatusNone = (unitStatus: UnitStatus): boolean => {
    return unitStatus === 'none';
  };

  const getStatusColor = (paymentStatus: PaymentStatus, unitStatus: UnitStatus) => {
    if (isPaymentNone(paymentStatus) && isUnitStatusNone(unitStatus)) {
      return "bg-gray-100 text-gray-800 border-gray-200";
    } else if (isPaymentOngoing(paymentStatus)) {
      return "bg-blue-100 text-blue-800 border-blue-200";
    } else if (isPaymentFullyPaid(paymentStatus)) {
      return "bg-green-100 text-green-800 border-green-200";
    } else if (isRentalActive(unitStatus)) {
      return "bg-purple-100 text-purple-800 border-purple-200";
    } else if (isUnitActive(unitStatus)) {
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    }
    return "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getStatusText = (paymentStatus: PaymentStatus, unitStatus: UnitStatus) => {
    if (isPaymentNone(paymentStatus) && isUnitStatusNone(unitStatus)) {
      return "Not Started";
    } else if (paymentStatus === "advance_paid") {
      return "Advance Paid";
    } else if (paymentStatus === "partially_paid") {
      return "Payment Ongoing";
    } else if (isPaymentFullyPaid(paymentStatus)) {
      return "Fully Paid";
    } else if (isRentalActive(unitStatus)) {
      return "Rental Active";
    } else if (isUnitActive(unitStatus)) {
      return "Active";
    }
    return "Unknown";
  };

  // Calculate payment progress from payment data
  const calculatePaymentProgress = (
    unit: PortfolioItem,
    paymentData: PaymentData
  ) => {
    if (!paymentData || !unit.total_investment) return 0;

    const totalPaid =
      paymentData.payments
        ?.filter((payment) => payment.payment_status === "completed")
        ?.reduce((sum, payment) => sum + payment.amount, 0) || 0;

    return (totalPaid / unit.total_investment) * 100;
  };

  // Calculate totals from payment data
  const calculateTotals = (paymentData: PaymentData) => {
    if (!paymentData)
      return { totalRebates: 0, totalPenalties: 0, totalPaid: 0 };

    const totalRebates =
      paymentData.payments?.reduce(
        (sum, payment) => sum + (payment.rebate_amount || 0),
        0
      ) || 0;

    const totalPenalties =
      paymentData.payments?.reduce(
        (sum, payment) => sum + (payment.penalty_amount || 0),
        0
      ) || 0;

    const totalPaid =
      paymentData.payments
        ?.filter((payment) => payment.payment_status === "completed")
        ?.reduce((sum, payment) => sum + payment.amount, 0) || 0;

    return { totalRebates, totalPenalties, totalPaid };
  };

  const getTransactionTypeText = (type: string) => {
    switch (type) {
      case "advance":
        return "Advance Payment";
      case "installment":
        return "Installment";
      case "penalty":
        return "Penalty";
      case "rebate":
        return "Rebate";
      case "balance_payment":
        return "Balance Payment";
      default:
        return type;
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "failed":
        return "bg-red-500";
      case "pending":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  // Payment Progress Component for the Payments tab
  const PaymentProgressSection = ({ unit }: { unit: PortfolioItem }) => {
    const paymentData = paymentDataMap[unit.unit_number];
    const isLoading = loadingPayments[unit.unit_number];
    const isPaymentCompleted = isPaymentFullyPaid(unit.payment_status as PaymentStatus);

    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-32">
          <Loader2 className="w-6 h-6 animate-spin text-primary mr-2" />
          <span className="text-sm text-muted-foreground">
            Loading payment data...
          </span>
        </div>
      );
    }

    if (isPaymentCompleted) {
      return (
        <div className="space-y-4">
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <p className="text-green-800 font-medium mb-2 text-sm sm:text-base">
              ✓ Payment Completed
            </p>
            <p className="text-green-700 text-xs sm:text-sm">
              All payments have been successfully completed for this unit.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-1">
              <p className="text-xs sm:text-sm text-gray-600">Total Paid</p>
              <p className="text-sm sm:text-base font-medium text-gray-900">
                {formatCurrency(unit.user_paid)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs sm:text-sm text-gray-600">Advance Paid</p>
              <p className="text-sm sm:text-base font-medium text-gray-900">
                {formatCurrency(unit.scheme.booking_advance)}
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (!paymentData) {
      return (
        <div className="text-center text-muted-foreground py-8">
          <p>No payment data available</p>
        </div>
      );
    }

    const { totalRebates, totalPenalties, totalPaid } =
      calculateTotals(paymentData);
    const progress = calculatePaymentProgress(unit, paymentData);

    return (
      <div className="space-y-6">
        {/* Progress Bar */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs sm:text-sm font-medium text-foreground">
              Overall Progress
            </span>
            <span className="text-xs sm:text-sm text-muted-foreground">
              {paymentData.total_payments} payments
            </span>
          </div>
          <Progress value={progress} className="h-3 sm:h-4 mb-4" />
          <div className="flex justify-between text-xs sm:text-sm text-muted-foreground">
            <span>{formatCurrency(totalPaid)} paid</span>
            <span>{formatCurrency(unit.total_investment)} total</span>
          </div>
        </div>

        {/* Next Payment */}
        {paymentData.next_installment && (
          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div className="flex-1">
                <p className="font-medium text-amber-800 mb-1 text-sm sm:text-base">
                  Next Payment Due
                </p>
                <p className="text-xs sm:text-sm text-amber-700">
                  {formatDate(paymentData.next_installment.due_date)}
                </p>
                <p className="text-lg sm:text-xl font-bold text-amber-900 mt-2">
                  {formatCurrency(paymentData.next_installment.amount)}
                </p>
                <p className="text-xs sm:text-sm text-amber-700 mt-1">
                  Installment #{paymentData.next_installment.installment_number}
                </p>
              </div>
              <Button
                size="sm"
                className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600"
                onClick={() => handleMakePayment(unit)}
                disabled={isPaymentFullyPaid(unit.payment_status as PaymentStatus)}
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Pay Now
              </Button>
            </div>
          </div>
        )}

        {/* Rebate & Penalties */}
        {(totalRebates > 0 || totalPenalties > 0) && (
          <div className="grid grid-cols-2 gap-4">
            {totalRebates > 0 && (
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-green-600 mb-1">
                      Total Rebates
                    </p>
                    <p className="text-lg sm:text-xl font-bold text-green-800">
                      +{formatCurrency(totalRebates)}
                    </p>
                  </div>
                  <Award className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
                </div>
              </div>
            )}
            
            {totalPenalties > 0 && (
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-red-600 mb-1">
                      Total Penalties
                    </p>
                    <p className="text-lg sm:text-xl font-bold text-red-800">
                      {formatCurrency(totalPenalties)}
                    </p>
                  </div>
                  <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
                </div>
              </div>
            )}
          </div>
        )}

        {/* All Payments Section with Scroll */}
        {paymentData.payments && paymentData.payments.length > 0 && (
          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-3">
              <p className="text-sm font-medium text-foreground">
                All Payments ({paymentData.payments.length})
              </p>
              <p className="text-xs text-muted-foreground">
                Scroll to view more
              </p>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
              {paymentData.payments
                .slice()
                .reverse()
                .map((payment, index) => (
                  <div
                    key={`${payment.order_id}-${index}`}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg text-xs border"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div
                        className={`w-3 h-3 rounded-full flex-shrink-0 ${getPaymentStatusColor(payment.payment_status)}`}
                      />
                      <div className="min-w-0 flex-1">
                        <span className="font-medium block truncate">
                          {getTransactionTypeText(payment.transaction_type)}
                          {payment.installment_number > 0 &&
                            ` #${payment.installment_number}`}
                        </span>
                        <span className="text-muted-foreground block mt-1">
                          {formatDate(payment.payment_date)}
                          {payment.payment_method && ` • ${payment.payment_method.replace('_', ' ')}`}
                        </span>
                        {payment.receipt_id && (
                          <span className="text-xs text-blue-600 block mt-1">
                            Receipt: {payment.receipt_id}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right ml-4 flex-shrink-0">
                      <p className="font-semibold text-sm">
                        {formatCurrency(payment.amount)}
                      </p>
                      {payment.rebate_amount > 0 && (
                        <p className="text-green-600 text-xs">
                          +{formatCurrency(payment.rebate_amount)} rebate
                        </p>
                      )}
                      {payment.penalty_amount > 0 && (
                        <p className="text-red-600 text-xs">
                          +{formatCurrency(payment.penalty_amount)} penalty
                        </p>
                      )}
                      <p className={`text-xs mt-1 ${
                        payment.payment_status === 'completed' ? 'text-green-600' :
                        payment.payment_status === 'failed' ? 'text-red-600' :
                        'text-yellow-600'
                      }`}>
                        {payment.payment_status}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-16 sm:pt-20 pb-8 sm:pb-12">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-8">
            <div className="flex justify-center items-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-2 text-lg">Loading your units...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-16 sm:pt-20 pb-8 sm:pb-12">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-8">
            <div className="text-center text-red-600">
              <p>Error: {error}</p>
              <Button onClick={fetchUserData} className="mt-4">
                Retry
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="pt-16 sm:pt-20 pb-8 sm:pb-12">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-8">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
              My Units
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Manage and track your property investments and rental income
            </p>
          </div>

          {/* Summary Cards */}
          {investmentSummary && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
              <Card className="border-0 shadow-md">
                <CardContent className="p-3 sm:p-4 lg:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                        Total Units
                      </p>
                      <p className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">
                        {investmentSummary.total_units}
                      </p>
                    </div>
                    <Building2 className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md">
                <CardContent className="p-3 sm:p-4 lg:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                        Total Investment
                      </p>
                      <p className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">
                        {formatCurrency(investmentSummary.total_invested)}
                      </p>
                    </div>
                    <IndianRupee className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md">
                <CardContent className="p-3 sm:p-4 lg:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                        Amount Paid
                      </p>
                      <p className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">
                        {formatCurrency(investmentSummary.total_paid)}
                      </p>
                    </div>
                    <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md">
                <CardContent className="p-3 sm:p-4 lg:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                        Balance Amount
                      </p>
                      <p className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">
                        {formatCurrency(investmentSummary.total_balance)}
                      </p>
                    </div>
                    <Calendar className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Properties List */}
          <div className="space-y-4 sm:space-y-6">
            {portfolioData.length === 0 ? (
              <Card className="border-0 shadow-md">
                <CardContent className="p-8 text-center">
                  <Building2 className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Units Found</h3>
                  <p className="text-muted-foreground">
                    You haven't purchased any units yet. Explore our projects to
                    get started.
                  </p>
                </CardContent>
              </Card>
            ) : (
              portfolioData.map((property) => {
                const isPaymentCompleted = isPaymentFullyPaid(property.payment_status as PaymentStatus);
                const isPaymentInProgress = isPaymentOngoing(property.payment_status as PaymentStatus);
                const isRentalActiveStatus = isRentalActive(property.unit_status as UnitStatus);

                return (
                  <Card
                    key={property.unit_id}
                    className="border-0 shadow-md hover:shadow-lg transition-shadow"
                  >
                    <CardHeader className="border-b bg-card p-4 sm:p-6">
                      <div className="flex flex-col space-y-3 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
                        <div className="min-w-0">
                          <div className="mb-2">
                            <div className="text-sm text-muted-foreground mb-1">
                              Project Name
                            </div>
                            <div className="text-lg font-semibold text-card-foreground">
                              {property.project.project_name}
                            </div>
                          </div>
                          <div className="mb-3">
                            <div className="text-sm text-muted-foreground mb-1">
                              Unit Number
                            </div>
                            <div className="text-xl font-bold text-primary">
                              {property.unit_number}
                            </div>
                          </div>
                          <div className="flex items-start text-muted-foreground mb-2">
                            <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-sm break-words">
                              {property.project.project_code} - Floor{" "}
                              {property.project.floor_number}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                          <Badge
                            className={getStatusColor(
                              property.payment_status as PaymentStatus,
                              property.unit_status as UnitStatus
                            )}
                          >
                            {getStatusText(
                              property.payment_status as PaymentStatus,
                              property.unit_status as UnitStatus
                            )}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="p-4 sm:p-6">
                      <Tabs
                        value={activeTabs[property.unit_number] || "overview"}
                        onValueChange={(value) =>
                          handleTabChange(property.unit_number, value)
                        }
                        className="w-full"
                      >
                        <TabsList className="grid w-full grid-cols-3 mb-4 sm:mb-6 h-auto">
                          <TabsTrigger
                            value="overview"
                            className="text-xs sm:text-sm py-2"
                          >
                            Overview
                          </TabsTrigger>
                          <TabsTrigger
                            value="payments"
                            className="text-xs sm:text-sm py-2"
                          >
                            Payments
                          </TabsTrigger>
                          <TabsTrigger
                            value="rental"
                            className="text-xs sm:text-sm py-2"
                          >
                            Rental
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview">
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                            <div className="space-y-1">
                              <p className="text-xs sm:text-sm text-muted-foreground">
                                Purchase Date
                              </p>
                              <p className="text-sm sm:text-base text-foreground font-medium">
                                {formatDate(property.purchase_date)}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs sm:text-sm text-muted-foreground">
                                Investment Scheme
                              </p>
                              <p className="text-sm sm:text-base text-foreground font-medium break-words">
                                {property.scheme.scheme_name}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs sm:text-sm text-muted-foreground">
                                Total Investment
                              </p>
                              <p className="text-sm sm:text-base text-foreground font-medium">
                                {formatCurrency(property.total_investment)}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs sm:text-sm text-muted-foreground">
                                Unit Area
                              </p>
                              <p className="text-sm sm:text-base text-foreground font-medium">
                                {property.total_area_sqft} sqft
                              </p>
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="payments">
                          <PaymentProgressSection unit={property} />
                        </TabsContent>

                        <TabsContent value="rental">
                          <div className="space-y-4">
                            {isRentalActiveStatus ? (
                              <>
                                <div className="bg-purple-50 p-3 sm:p-4 rounded-lg border border-purple-200">
                                  <p className="text-purple-800 font-medium mb-2 text-sm sm:text-base">
                                    💰 Rental Income Active
                                  </p>
                                  <p className="text-purple-700 text-xs sm:text-sm">
                                    Monthly rental income:{" "}
                                    {formatCurrency(property.monthly_rental)}
                                  </p>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                                  <div className="space-y-1">
                                    <p className="text-xs sm:text-sm text-gray-600">
                                      Monthly Rental
                                    </p>
                                    <p className="text-sm sm:text-base font-medium text-gray-900">
                                      {formatCurrency(property.monthly_rental)}
                                    </p>
                                  </div>
                                  <div className="space-y-1">
                                    <p className="text-xs sm:text-sm text-gray-600">
                                      Rental Start Date
                                    </p>
                                    <p className="text-sm sm:text-base font-medium text-gray-900">
                                      {formatDate(property.rental_start_date)}
                                    </p>
                                  </div>
                                  <div className="space-y-1">
                                    <p className="text-xs sm:text-sm text-gray-600">
                                      Total Received
                                    </p>
                                    <p className="text-sm sm:text-base font-medium text-gray-900">
                                      Not Available
                                    </p>
                                  </div>
                                </div>
                              </>
                            ) : (
                              <div className="bg-orange-50 p-3 sm:p-4 rounded-lg border border-orange-200">
                                <p className="text-orange-800 font-medium mb-2 text-sm sm:text-base flex items-center gap-1.5">
                                  <Clock className="w-4 h-4 text-orange-800" />
                                  Rental Pending
                                </p>
                                <p className="text-orange-700 text-xs sm:text-sm">
                                  Rental income will start from{" "}
                                  {formatDate(property.rental_start_date)} after
                                  payment completion.
                                </p>
                                <p className="text-orange-700 text-xs sm:text-sm mt-2">
                                  Expected monthly rental:{" "}
                                  {formatCurrency(property.monthly_rental)}
                                </p>
                              </div>
                            )}
                          </div>
                        </TabsContent>
                      </Tabs>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full sm:w-auto border-gray-400"
                          asChild
                        >
                          <Link to={`/sip?unit=${property.unit_number}`}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full sm:w-auto border-gray-400"
                          asChild
                        >
                          <Link to={`/agreements?unit=${property.unit_number}`}>
                            <Download className="w-4 h-4 mr-2" />
                            View Agreement
                          </Link>
                        </Button>
                        {!isPaymentCompleted && (
                          <Button
                            size="sm"
                            className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600"
                            onClick={() => handleMakePayment(property)}
                            disabled={loadingCustomerInfo || isPaymentFullyPaid(property.payment_status as PaymentStatus)}
                          >
                            {loadingCustomerInfo ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <CreditCard className="w-4 h-4 mr-2" />
                            )}
                            Make Payment
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedUnit && (
        <PaymentModal
          unit={selectedUnit}
          customerInfo={customerInfo}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedUnit(null);
            setCustomerInfo(null);
          }}
        />
      )}
    </div>
  );
};

export default MyUnits;