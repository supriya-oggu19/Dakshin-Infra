import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  TrendingUp,
  Award,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  CreditCard,
  Download,
  Loader2,
  Building2,
  Eye,
  ChevronDown,
  ChevronUp,
  Calendar,
  CheckCircle2,
  Receipt,
  RefreshCw,
  Sparkles,
  Star,
  XCircle,
} from "lucide-react";
import Navigation from "@/components/Navigation";
import { paymentApi } from "../api/paymentApi";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import {
  PortfolioItem,
} from "../api/models/portfolio.model";
import { portfolioApi } from "../api/portfolio-api";
import PaymentModal from "@/components/PaymentModal";
import { PDFDownloadLink } from '@react-pdf/renderer';
import { pdf } from '@react-pdf/renderer';
import ReceiptDocument from '../forms/ReceiptDocument';

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
type PaymentStatus = 'advance_paid' | 'partially_paid' | 'fully_paid' | 'none';
type UnitStatus = 'payment_ongoing' | 'active' | 'rental_active' | 'none';

const SipTracker = () => {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const urlUnit = searchParams.get('unit');
  
  const [selectedUnit, setSelectedUnit] = useState("");
  const [portfolioData, setPortfolioData] = useState<PortfolioItem[]>([]);
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAllUnits, setShowAllUnits] = useState(false);

  // Payment modal states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedUnitForPayment, setSelectedUnitForPayment] = useState<PortfolioItem | null>(null);
  const [customerInfo, setCustomerInfo] = useState<any>(null);
  const [loadingCustomerInfo, setLoadingCustomerInfo] = useState(false);

  // Constants for unit display
  const MAX_UNITS_VISIBLE = 3;

  useEffect(() => {
    fetchPortfolioData();
  }, []);

  useEffect(() => {
    if (portfolioData.length > 0) {
      // Priority: URL unit > first unit in portfolio
      const unitToSelect = urlUnit || portfolioData[0]?.unit_number;
      if (unitToSelect && portfolioData.some(unit => unit.unit_number === unitToSelect)) {
        setSelectedUnit(unitToSelect);
      } else if (portfolioData[0]) {
        setSelectedUnit(portfolioData[0].unit_number);
      }
    }
  }, [portfolioData, urlUnit]);

  useEffect(() => {
    if (selectedUnit) {
      fetchPaymentData(selectedUnit);
    }
  }, [selectedUnit]);

  const fetchPortfolioData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await portfolioApi.getPortfolio();
      const portfolio = response.data.portfolio || [];
      setPortfolioData(portfolio);
    } catch (err: any) {
      console.error("Error fetching portfolio data:", err);
      setError(err.message || "Failed to fetch portfolio data");
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentData = async (unitNumber: string) => {

    try {
      setLoading(true);
      const response = await paymentApi.getPaymentList({ unit_number: unitNumber });
      setPaymentData(response.data);
    } catch (err: any) {
      console.error("Error fetching payment data:", err);
      setError(err.message || "Failed to fetch payment data");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!paymentData?.payments?.length) return;

    const worksheetData = paymentData.payments.map((p, index) => ({
      "S.No": index + 1,
      "Transaction Type": getTransactionTypeText(p.transaction_type),
      "Installment #": p.installment_number || "-",
      "Amount": p.amount,
      "Penalty": p.penalty_amount,
      "Rebate": p.rebate_amount,
      "Payment Date": formatDate(p.payment_date),
      "Due Date": formatDate(p.due_date || ""),
      "Method": p.payment_method,
      "Status": p.payment_status,
      "Receipt ID": p.receipt_id,
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Payments");

    XLSX.writeFile(workbook, `${paymentData.unit_number || "payments"}.xlsx`);
  };

  const handlePayNow = async (unit: PortfolioItem) => {
    setSelectedUnitForPayment(unit);
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

  const handleDownloadReceipt = async (orderId: string) => {
    try {
      // Fetch raw receipt data from backend
      const receiptData = await paymentApi.getReceipt(orderId);
      
      // Generate PDF blob
      const blob = await pdf(<ReceiptDocument data={receiptData} />).toBlob();
      
      // Download the file
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `receipt_${receiptData.receipt_id}.pdf`;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Receipt Downloaded",
        description: `Receipt ${receiptData.receipt_id} downloaded successfully.`,
        duration: 3000,
      });
    } catch (err) {
      console.error("Error generating receipt:", err);
      toast({
        title: "Download Failed",
        description: "Failed to generate receipt. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (amount: number) => {
    if (!amount) return "₹0";
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)}Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(1)}K`;
    }
    return `₹${amount.toLocaleString("en-IN")}`;
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

  // Status functions using enums
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

  const getStatusColor = (paymentStatus: PaymentStatus, unitStatus: UnitStatus) => {
    if (isPaymentOngoing(paymentStatus)) {
      return "bg-blue-100 text-blue-800 border-blue-200";
    } else if (isPaymentFullyPaid(paymentStatus)) {
      if (isRentalActive(unitStatus)) {
        return "bg-purple-100 text-purple-800 border-purple-200";
      } else if (isUnitActive(unitStatus)) {
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      }
      return "bg-green-100 text-green-800 border-green-200";
    }
    return "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getStatusText = (paymentStatus: PaymentStatus, unitStatus: UnitStatus) => {
    if (paymentStatus === "advance_paid") {
      return "Advance Paid";
    } else if (paymentStatus === "partially_paid") {
      return "Payment Ongoing";
    } else if (isPaymentFullyPaid(paymentStatus)) {
      if (isRentalActive(unitStatus)) {
        return "Rental Active";
      } else if (isUnitActive(unitStatus)) {
        return "Active";
      }
      return "Fully Paid";
    }
    return "Not Started";
  };

  const getTransactionTypeText = (type: string) => {
    switch (type) {
      case "advance":
        return "Advance Payment";
      case "installment":
        return "Monthly Installment";
      case "penalty":
        return "Penalty Payment";
      case "rebate":
        return "Rebate Adjustment";
      default:
        return type;
    }
  };

  const calculatePaymentProgress = () => {
    if (!paymentData || !selectedUnit) return 0;

    const unit = portfolioData.find((u) => u.unit_number === selectedUnit);
    if (!unit || !unit.total_investment) return 0;

    const totalPaid =
      paymentData.payments
        ?.filter((payment) => payment.payment_status === "completed")
        ?.reduce((sum, payment) => sum + payment.amount, 0) || 0;
    return (totalPaid / unit.total_investment) * 100;
  };

  const calculateTotals = () => {
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

  // Get visible units based on showAllUnits state
  const visibleUnits = showAllUnits 
    ? portfolioData 
    : portfolioData.slice(0, MAX_UNITS_VISIBLE);

  if (loading && !paymentData) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-20 pb-12">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex justify-center items-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-2 text-lg">Loading investment data...</span>
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
        <div className="pt-20 pb-12">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="text-center text-red-600">
              <p>Error: {error}</p>
              <Button onClick={fetchPortfolioData} className="mt-4">
                Retry
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!portfolioData.length) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-20 pb-12">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="text-center">
              <Building2 className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No Investment Units Found
              </h3>
              <p className="text-muted-foreground">
                You haven't purchased any units yet. Explore our projects to get
                started.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentUnit = portfolioData.find((u) => u.unit_number === selectedUnit);
  const { totalRebates, totalPenalties, totalPaid } = calculateTotals();
  const progress = calculatePaymentProgress();
  const balanceAmount = currentUnit
    ? currentUnit.total_investment - totalPaid
    : 0;
  
  const isPaymentCompleted = currentUnit && 
    isPaymentFullyPaid(currentUnit.payment_status as PaymentStatus);

  // Check if current unit is installment scheme
  const isInstallmentScheme =
    currentUnit?.scheme?.scheme_type === "installment";

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
              Investment Tracker
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Track your installment payments, rebates, and penalties
            </p>
          </div>

          {/* Unit Selector */}
          <div className="mb-6 sm:mb-8">
            <label className="block text-sm font-medium text-muted-foreground mb-3">
            Select Booking ID
            </label>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {visibleUnits.map((unit) => (
                <button
                  key={unit.unit_id}
                  onClick={() => setSelectedUnit(unit.unit_number)}
                  className={`px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg border transition-all text-sm sm:text-base ${
                    selectedUnit === unit.unit_number
                      ? "bg-primary/10 border-primary text-primary shadow-sm"
                      : "bg-card border-border text-card-foreground hover:bg-accent hover:border-accent-foreground/20"
                  }`}
                >
                  {unit.unit_number}
                </button>
              ))}
              
              {/* Show More/Less Button */}
              {portfolioData.length > MAX_UNITS_VISIBLE && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAllUnits(!showAllUnits)}
                  className="flex items-center gap-1"
                >
                  {showAllUnits ? (
                    <>
                      <ChevronUp className="w-4 h-4" />
                      Show Less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      View More
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Summary Cards */}
          {currentUnit && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
              <Card className="border-0 shadow-md card-luxury">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="mb-2 sm:mb-0">
                      <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                        Total Amount
                      </p>
                      <p className="text-lg sm:text-xl font-bold text-foreground">
                        {formatCurrency(currentUnit.total_investment)}
                      </p>
                    </div>
                    <Target className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md card-luxury">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="mb-2 sm:mb-0">
                      <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                        Paid Amount
                      </p>
                      <p className="text-lg sm:text-xl font-bold text-primary">
                        {formatCurrency(totalPaid)}
                      </p>
                    </div>
                    <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md card-luxury">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="mb-2 sm:mb-0">
                      <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                        Balance
                      </p>
                      <p className="text-lg sm:text-xl font-bold text-foreground">
                        {formatCurrency(balanceAmount)}
                      </p>
                    </div>
                    <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-secondary" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md card-luxury">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="mb-2 sm:mb-0">
                      <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                        Progress
                      </p>
                      <p className="text-lg sm:text-xl font-bold text-primary">
                        {progress.toFixed(1)}%
                      </p>
                    </div>
                    <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Main Content */}
          <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Progress Section */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-0 shadow-md card-luxury">
                <CardHeader className="border-b bg-card p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <CardTitle className="text-lg sm:text-xl text-card-foreground">
                      Payment Progress
                    </CardTitle>
                    {currentUnit && (
                      <Badge
                        className={getStatusColor(
                          currentUnit.payment_status as PaymentStatus,
                          currentUnit.unit_status as UnitStatus
                        )}
                      >
                        {getStatusText(
                          currentUnit.payment_status as PaymentStatus,
                          currentUnit.unit_status as UnitStatus
                        )}
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="p-4 sm:p-6">
                  <div className="space-y-6">
                    {/* Progress Bar */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs sm:text-sm font-medium text-foreground">
                          Overall Progress
                        </span>
                        <span className="text-xs sm:text-sm text-muted-foreground">
                          {paymentData?.total_payments || 0} payments
                        </span>
                      </div>
                      <Progress value={progress} className="h-3 sm:h-4 mb-4" />
                      <div className="flex justify-between text-xs sm:text-sm text-muted-foreground">
                        <span>{formatCurrency(totalPaid)} paid</span>
                        <span>
                          {formatCurrency(currentUnit?.total_investment)} total
                        </span>
                      </div>
                    </div>

                    {/* Next Payment - Only show for installment schemes */}
                    {isInstallmentScheme &&
                      paymentData?.next_installment &&
                      !isPaymentCompleted && (
                        <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                            <div className="flex-1">
                              <p className="font-medium text-amber-800 mb-1 text-sm sm:text-base">
                                Next Payment Due
                              </p>
                              <p className="text-xs sm:text-sm text-amber-700">
                                {formatDate(
                                  paymentData.next_installment.due_date
                                )}
                              </p>
                              <p className="text-lg sm:text-xl font-bold text-amber-900 mt-2">
                                {formatCurrency(
                                  paymentData.next_installment.amount
                                )}
                              </p>
                              <p className="text-xs sm:text-sm text-amber-700 mt-1">
                                Installment #
                                {
                                  paymentData.next_installment
                                    .installment_number
                                }
                              </p>
                            </div>
                            <Button
                              size="sm"
                              variant="luxury"
                              onClick={() =>
                                currentUnit && handlePayNow(currentUnit)
                              }
                              disabled={loadingCustomerInfo}
                              className="w-full sm:w-auto"
                            >
                              {loadingCustomerInfo ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              ) : (
                                <CreditCard className="w-4 h-4 mr-2" />
                              )}
                              Pay Now
                            </Button>
                          </div>
                        </div>
                      )}

                    {/* Payment Completed Message */}
                    {isPaymentCompleted && (
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-6 h-6 text-green-600" />
                          <div>
                            <p className="text-green-800 font-medium text-sm sm:text-base">
                              Payment Completed
                            </p>
                            <p className="text-green-700 text-xs sm:text-sm">
                              All payments have been successfully completed for
                              this unit.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Rebate & Penalties */}
                    <div className="grid sm:grid-cols-2 gap-4">
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
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar Info */}
            <div className="space-y-6">
              <Card className="border-0 shadow-md card-luxury">
                <CardHeader className="border-b bg-card p-4 sm:p-6">
                  <CardTitle className="text-base sm:text-lg text-foreground">
                    Payment Rules
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Award className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-foreground text-sm">
                          Early Payment Rebates
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Get rebates for paying before due date
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-foreground text-sm">
                          Late Payment Penalty
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Penalties apply after due date
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CreditCard className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-foreground text-sm">
                          Flexible Payments
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Pay monthly installment or custom amount
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Payment History */}
          <div className="mt-6 sm:mt-8">
            <Card className="border-0 shadow-lg card-luxury bg-gradient-to-br from-white to-blue-50/30">
              <CardHeader className="border-b bg-card p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <CardTitle className="text-lg sm:text-xl text-foreground flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-blue-600" />
                      Payment History
                    </CardTitle>
                    <CardDescription className="text-sm mt-1">
                      {paymentData?.total_payments || 0} total transactions
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExport}
                      className="text-xs border-gray-400 hover:border-gray-600"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Export
                    </Button>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                      ID: {paymentData?.unit_number || "N/A"}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-0">
                <div className="max-h-96 overflow-y-auto">
                  {paymentData?.payments && paymentData.payments.length > 0 ? (
                    <div className="divide-y divide-border/60">
                      {paymentData.payments
                        .slice()
                        .reverse()
                        .map((payment, index, array) => {
                          const isLatestPayment = index === 0;
                          const maxInstallment = Math.max(
                            ...array.map((p) => p.installment_number || 0)
                          );
                          const isLastInstallment =
                            payment.installment_number === maxInstallment &&
                            maxInstallment > 0;

                          // Calculate payment status styling
                          const getStatusConfig = (status) => {
                            const config = {
                              completed: { 
                                icon: CheckCircle2, 
                                color: "text-green-600", 
                                bg: "bg-green-50", 
                                border: "border-green-200",
                                badge: "bg-green-100 text-green-800 border-green-200"
                              },
                              failed: { 
                                icon: XCircle, 
                                color: "text-red-600", 
                                bg: "bg-red-50", 
                                border: "border-red-200",
                                badge: "bg-red-100 text-red-800 border-red-200"
                              },
                              pending: { 
                                icon: Clock, 
                                color: "text-amber-600", 
                                bg: "bg-amber-50", 
                                border: "border-amber-200",
                                badge: "bg-amber-100 text-amber-800 border-amber-200"
                              }
                            };
                            return config[status] || config.pending;
                          };

                          const statusConfig = getStatusConfig(payment.payment_status);
                          const StatusIcon = statusConfig.icon;

                          return (
                            <div
                              key={payment.order_id || index}
                              className={`
                                p-4 transition-all duration-200 hover:bg-blue-50/30
                                ${
                                  isLatestPayment
                                    ? "bg-blue-50 border-l-4 border-l-blue-500 shadow-sm"
                                    : isLastInstallment
                                    ? "bg-green-50 border-l-4 border-l-green-500"
                                    : "bg-white"
                                }
                              `}
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                {/* Left Section */}
                                <div className="flex items-start gap-3 flex-1 min-w-0">
                                  <div className="flex-shrink-0 mt-1">
                                    <div className={`
                                      p-1.5 rounded-full ${statusConfig.bg} ${statusConfig.border} border
                                    `}>
                                      <StatusIcon className={`w-4 h-4 ${statusConfig.color}`} />
                                    </div>
                                  </div>
                                  
                                  <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                      <div className="flex items-center gap-2">
                                        <p className="font-semibold text-foreground text-sm sm:text-base truncate">
                                          {getTransactionTypeText(payment.transaction_type)}
                                          {payment.installment_number &&
                                            payment.installment_number > 0 && (
                                              <span className="text-blue-600 font-medium">
                                                {" "}#{payment.installment_number}
                                              </span>
                                            )}
                                        </p>
                                        
                                        <Badge className={`
                                          text-xs font-medium ${statusConfig.badge}
                                        `}>
                                          {payment.payment_status === "completed" ? "Paid" : 
                                          payment.payment_status === "failed" ? "Failed" : "Pending"}
                                        </Badge>
                                      </div>
                                      
                                      <div className="flex items-center gap-1">
                                        {isLatestPayment && (
                                          <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
                                            <Sparkles className="w-3 h-3 mr-1" />
                                            Latest
                                          </Badge>
                                        )}
                                        {/* {isLastInstallment && (
                                          <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                                            <Star className="w-3 h-3 mr-1" />
                                            Final
                                          </Badge>
                                        )} */}
                                      </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs text-muted-foreground mb-2">
                                      <div className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {formatDate(payment.payment_date)}
                                      </div>
                                      <div className="hidden sm:block">•</div>
                                      <div className="flex items-center gap-1">
                                        <Receipt className="w-3 h-3" />
                                        Receipt: {payment.receipt_id}
                                      </div>
                                      <div className="hidden sm:block">•</div>
                                      <div className="flex items-center gap-1 capitalize">
                                        <CreditCard className="w-3 h-3" />
                                        {payment.payment_method?.replace('_', ' ')}
                                      </div>
                                    </div>

                                    {/* Additional Payment Details */}
                                    <div className="flex flex-wrap gap-2">
                                      {/* {payment.rebate_amount && payment.rebate_amount > 0 && (
                                        <Badge
                                          variant="outline"
                                          className="text-green-600 border-green-200 bg-green-50 text-xs"
                                        >
                                          <TrendingUp className="w-3 h-3 mr-1" />
                                          +{formatCurrency(payment.rebate_amount)} rebate
                                        </Badge>
                                      )}
                                      {payment.penalty_amount && payment.penalty_amount > 0 && (
                                        <Badge
                                          variant="outline"
                                          className="text-red-600 border-red-200 bg-red-50 text-xs"
                                        >
                                          <AlertTriangle className="w-3 h-3 mr-1" />
                                          -{formatCurrency(payment.penalty_amount)} penalty
                                        </Badge>
                                      )} */}
                                      {payment.due_date && (
                                        <Badge
                                          variant="outline"
                                          className="text-amber-600 border-amber-200 bg-amber-50 text-xs"
                                        >
                                          <Calendar className="w-3 h-3 mr-1" />
                                          Due: {formatDate(payment.due_date)}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Right Section */}
                                <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6">
                                  <div className="text-right">
                                    <p
                                      className={`
                                        font-bold text-lg
                                        ${isLatestPayment ? "text-blue-600" : 
                                          payment.payment_status === "failed" ? "text-red-600" : 
                                          "text-foreground"}
                                      `}
                                    >
                                      {formatCurrency(payment.amount)}
                                    </p>
                                    {payment.payment_status === "failed" && (
                                      <p className="text-xs text-red-500 mt-1">
                                        Try again
                                      </p>
                                    )}
                                  </div>
                                  
                                  <div className="flex items-center gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleDownloadReceipt(payment.order_id)}
                                      className="flex-shrink-0 shadow-sm border-gray-400"
                                    >
                                      <Download className="w-4 h-4" />
                                      <span className="hidden sm:inline ml-1">Receipt</span>
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <div className="flex flex-col items-center gap-3">
                        <CreditCard className="w-12 h-12 text-muted-foreground/40" />
                        <div>
                          <p className="font-medium">No payment history available</p>
                          <p className="text-sm mt-1">Your transactions will appear here</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
              
              {/* Summary Footer */}
              {paymentData?.payments && paymentData.payments.length > 0 && (
                <CardFooter className="border-t bg-muted/20 px-4 sm:px-6 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 w-full text-xs text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span>Completed</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        <span>Failed</span>
                      </div>
                    </div>
                    <div className="text-right">
                      Last updated: {new Date().toLocaleDateString()}
                    </div>
                  </div>
                </CardFooter>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedUnitForPayment && (
        <PaymentModal
          unit={selectedUnitForPayment}
          customerInfo={customerInfo}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedUnitForPayment(null);
            setCustomerInfo(null);
          }}
        />
      )}
    </div>
  );
};

export default SipTracker;