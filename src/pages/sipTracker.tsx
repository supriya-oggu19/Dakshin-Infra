import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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
} from "lucide-react";
import Navigation from "@/components/Navigation";
import { useAuth } from "@/contexts/AuthContext";
import { investmentApi } from "../api/investmentApi";
import {
  InvestmentUnit,
  PaymentListResponse,
  Payment,
} from "../api/models/investment.model";
import { portfolioApi } from "../api/portfolio-api";

const SipTracker = () => {
  const { token } = useAuth();
  const [selectedUnit, setSelectedUnit] = useState("");
  const [portfolioData, setPortfolioData] = useState<InvestmentUnit[]>([]);
  const [paymentData, setPaymentData] = useState<PaymentListResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPortfolioData();
  }, [token]);

  useEffect(() => {
    if (selectedUnit) {
      fetchPaymentData(selectedUnit);
    }
  }, [selectedUnit]);

  const fetchPortfolioData = async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError(null);

      const response = await portfolioApi.getPortfolio(token);
      const portfolio =
        response.data.portfolio || response.data.data || response.data || [];
      setPortfolioData(portfolio);

      if (response.data.portfolio && response.data.portfolio.length > 0) {
        setSelectedUnit(response.data.portfolio[0].unit_number);
      }
    } catch (err: any) {
      console.error("Error fetching portfolio data:", err);
      setError(err.message || "Failed to fetch portfolio data");
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentData = async (unitNumber: string) => {
    if (!token) return;

    try {
      setLoading(true);
      const response = await investmentApi.getPayments(unitNumber, token);
      setPaymentData(response.data);
    } catch (err: any) {
      console.error("Error fetching payment data:", err);
      setError(err.message || "Failed to fetch payment data");
    } finally {
      setLoading(false);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "overdue":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Completed";
      case "pending":
        return "Pending";
      case "overdue":
        return "Overdue";
      default:
        return "Unknown";
    }
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
      paymentData.payments?.reduce((sum, payment) => sum + payment.amount, 0) ||
      0;
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
      paymentData.payments?.reduce((sum, payment) => sum + payment.amount, 0) ||
      0;

    return { totalRebates, totalPenalties, totalPaid };
  };

  const handleDownloadReceipt = (payment: Payment) => {
    console.log(`Downloading receipt for ${payment.receipt_id}`);
    alert(
      `Downloading receipt ${payment.receipt_id} for ${getTransactionTypeText(
        payment.transaction_type
      )}`
    );
  };

  const handlePayNow = () => {
    if (paymentData?.next_installment) {
      alert(
        `Initiating payment for installment ${paymentData.next_installment.installment_number}`
      );
    }
  };

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
              Select Investment Unit
            </label>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {portfolioData.map((unit) => (
                <button
                  key={unit.unit_id}
                  onClick={() => setSelectedUnit(unit.unit_number)}
                  className={`px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg border transition-all text-sm sm:text-base ${
                    selectedUnit === unit.unit_number
                      ? "bg-primary/10 border-primary text-primary shadow-sm"
                      : "bg-card border-border text-card-foreground hover:bg-accent hover:border-accent-foreground/20"
                  }`}
                >
                  <span className="hidden sm:inline">
                    {unit.project.project_name} - {unit.unit_number}
                  </span>
                  <span className="sm:hidden">{unit.unit_number}</span>
                </button>
              ))}
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
                        className={getStatusColor(currentUnit.payment_status)}
                      >
                        {getStatusText(currentUnit.payment_status)}
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

                    {/* Next Payment */}
                    {paymentData?.next_installment && (
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
                              {paymentData.next_installment.installment_number}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="luxury"
                            onClick={handlePayNow}
                            className="w-full sm:w-auto"
                          >
                            <CreditCard className="w-4 h-4 mr-2" />
                            Pay Now
                          </Button>
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
                          Rebates for timely payments
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
                          Penalties for delayed payments
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md card-luxury">
                {/* <CardHeader className="border-b bg-card p-4 sm:p-6">
                  <CardTitle className="text-base sm:text-lg text-foreground">
                    Quick Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <div className="space-y-3">
                    {currentUnit && (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-xs sm:text-sm text-muted-foreground">
                            Scheme
                          </span>
                          <span className="text-xs sm:text-sm font-medium text-foreground text-right">
                            {currentUnit.scheme.scheme_name}
                          </span>
                        </div>
                        {currentUnit.scheme.monthly_installment_amount > 0 && (
                          <div className="flex justify-between items-center">
                            <span className="text-xs sm:text-sm text-muted-foreground">
                              Monthly Amount
                            </span>
                            <span className="text-xs sm:text-sm font-medium text-foreground">
                              {formatCurrency(
                                currentUnit.scheme.monthly_installment_amount
                              )}
                            </span>
                          </div>
                        )}
                      </>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm text-muted-foreground">
                        Net Adjustment
                      </span>
                      <span
                        className={`text-xs sm:text-sm font-medium ${
                          totalRebates + totalPenalties >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {totalRebates + totalPenalties >= 0 ? "+" : ""}
                        {formatCurrency(totalRebates + totalPenalties)}
                      </span>
                    </div>
                  </div>
                </CardContent> */}
              </Card>
            </div>
          </div>

          {/* Payment History - Single Responsive Component */}
          <div className="mt-6 sm:mt-8">
            <Card className="border-0 shadow-md card-luxury">
              <CardHeader className="border-b bg-card p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl text-foreground">
                  Payment History
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-96 overflow-y-auto">
                  {paymentData?.payments && paymentData.payments.length > 0 ? (
                    <div className="divide-y divide-border">
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

                          return (
                            <div
                              key={payment.payment_id || index}
                              className={`
                      p-4 transition-all
                      ${
                        isLatestPayment
                          ? "bg-blue-50 border-l-4 border-l-blue-500"
                          : isLastInstallment
                          ? "bg-green-50 border-l-4 border-l-green-500"
                          : "bg-card/50"
                      }
                    `}
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                {/* Left Section */}
                                <div className="flex items-start gap-3 flex-1">
                                  <div
                                    className={`
                          w-2 h-2 rounded-full mt-2 flex-shrink-0
                          ${
                            payment.payment_status === "completed"
                              ? "bg-green-500"
                              : "bg-muted"
                          }
                        `}
                                  />
                                  <div className="flex-1">
                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                      <p className="font-medium text-foreground text-sm sm:text-base">
                                        {getTransactionTypeText(
                                          payment.transaction_type
                                        )}
                                        {payment.installment_number &&
                                          payment.installment_number > 0 && (
                                            <span className="text-blue-600">
                                              {" "}
                                              #{payment.installment_number}
                                            </span>
                                          )}
                                      </p>
                                      {isLatestPayment && (
                                        <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
                                          Latest
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-xs text-muted-foreground mb-2">
                                      {formatDate(payment.payment_date)} •
                                      Receipt: {payment.receipt_id}
                                    </p>
                                  </div>
                                </div>

                                {/* Right Section */}
                                <div className="flex items-center justify-between sm:justify-end gap-3">
                                  <div className="text-right">
                                    <p
                                      className={`
                            font-semibold text-sm sm:text-base
                            ${
                              isLatestPayment
                                ? "text-blue-600"
                                : "text-foreground"
                            }
                          `}
                                    >
                                      {formatCurrency(payment.amount)}
                                    </p>
                                    <p className="text-xs text-muted-foreground capitalize">
                                      {payment.payment_method}
                                    </p>
                                  </div>
                                  {payment.payment_status === "completed" && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() =>
                                        handleDownloadReceipt(payment)
                                      }
                                      className="flex-shrink-0"
                                    >
                                      <Download className="w-3 h-3 sm:mr-1" />
                                      <span className="hidden sm:inline">
                                        Receipt
                                      </span>
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No payment history available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SipTracker;
