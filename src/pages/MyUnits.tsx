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
  User,
  Mail,
  Phone,
} from "lucide-react";
import Navigation from "@/components/Navigation";
import { useAuth } from "@/contexts/AuthContext";
import { portfolioApi } from "../api/portfolio-api";
import {
  PortfolioItem,
  InvestmentSummaryResponse,
} from "../api/models/portfolio.model";

// Payment Modal Component
// In your MyUnits.tsx, add this import at the top
import PaymentModal from "@/components/PaymentModal";
const MyUnits = () => {
  const { token } = useAuth();
  const [portfolioData, setPortfolioData] = useState<PortfolioItem[]>([]);
  const [investmentSummary, setInvestmentSummary] =
    useState<InvestmentSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<PortfolioItem | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [customerInfo, setCustomerInfo] = useState<any>(null);
  const [loadingCustomerInfo, setLoadingCustomerInfo] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, [token]);

  const fetchUserData = async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError(null);

      const [portfolioResponse, summaryResponse] = await Promise.all([
        portfolioApi.getPortfolio(token),
        portfolioApi.getInvestmentSummary(token),
      ]);

      setPortfolioData(portfolioResponse.data.portfolio || []);
      setInvestmentSummary(summaryResponse.data);
    } catch (err: any) {
      console.error("Error fetching user data:", err);
      setError(err.response?.data?.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const handleMakePayment = async (unit: PortfolioItem) => {
    if (!token) return;

    setSelectedUnit(unit);
    setLoadingCustomerInfo(true);

    try {
      // Fetch customer info from the API
      const customerInfoResponse = await fetch(
        `http://127.0.0.1:8001/api/payments/customer-info/${unit.unit_number}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (customerInfoResponse.ok) {
        const customerData = await customerInfoResponse.json();
        setCustomerInfo(customerData);
      } else {
        // If no customer info found, use default values
        setCustomerInfo({
          customer_name: "",
          customer_email: "",
          customer_phone: "",
        });
      }
    } catch (err) {
      console.error("Error fetching customer info:", err);
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
      month: "2-digit",
      year: "numeric",
    });
  };

  const getStatusColor = (paymentStatus: string, unitStatus: string) => {
    if (paymentStatus === "none" && unitStatus === "none") {
      return "bg-gray-100 text-gray-800 border-gray-200";
    } else if (
      paymentStatus === "advance_paid" ||
      paymentStatus === "partially_paid"
    ) {
      return "bg-blue-100 text-blue-800 border-blue-200";
    } else if (paymentStatus === "fully_paid") {
      return "bg-green-100 text-green-800 border-green-200";
    }
    return "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getStatusText = (paymentStatus: string, unitStatus: string) => {
    if (paymentStatus === "none" && unitStatus === "none") {
      return "Not Started";
    } else if (paymentStatus === "advance_paid") {
      return "Advance Paid";
    } else if (paymentStatus === "partially_paid") {
      return "Payment Ongoing";
    } else if (paymentStatus === "fully_paid") {
      return "Active";
    }
    return "Unknown";
  };

  const getInstallmentsInfo = (scheme: any, userPaid: number) => {
    if (scheme.scheme_type === "single_payment") {
      return {
        paid: userPaid >= scheme.booking_advance ? "1/1" : "0/1",
        progress: userPaid >= scheme.booking_advance ? 100 : 0,
      };
    } else if (scheme.scheme_type === "installment") {
      const totalInstallments = scheme.total_installments || 1;
      const installmentAmount =
        scheme.monthly_installment_amount || scheme.booking_advance || 1;
      const installmentsPaid = Math.floor(userPaid / installmentAmount);
      return {
        paid: `${installmentsPaid}/${totalInstallments}`,
        progress: (installmentsPaid / totalInstallments) * 100,
      };
    }
    return { paid: "0/0", progress: 0 };
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
                const installmentsInfo = getInstallmentsInfo(
                  property.scheme,
                  property.user_paid
                );
                const isPaymentCompleted =
                  property.payment_status === "fully_paid";
                const isPaymentOngoing =
                  property.payment_status === "advance_paid" ||
                  property.payment_status === "partially_paid";

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
                              property.payment_status,
                              property.unit_status
                            )}
                          >
                            {getStatusText(
                              property.payment_status,
                              property.unit_status
                            )}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="p-4 sm:p-6">
                      <Tabs defaultValue="overview" className="w-full">
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
                          {isPaymentCompleted ? (
                            <div className="space-y-4">
                              <div className="bg-green-50 p-3 sm:p-4 rounded-lg border border-green-200">
                                <p className="text-green-800 font-medium mb-2 text-sm sm:text-base">
                                  ✓ Payment Completed
                                </p>
                                <p className="text-green-700 text-xs sm:text-sm">
                                  All payments have been successfully completed
                                  for this unit.
                                </p>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                <div className="space-y-1">
                                  <p className="text-xs sm:text-sm text-gray-600">
                                    Total Paid
                                  </p>
                                  <p className="text-sm sm:text-base font-medium text-gray-900">
                                    {formatCurrency(property.user_paid)}
                                  </p>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-xs sm:text-sm text-gray-600">
                                    Advance Paid
                                  </p>
                                  <p className="text-sm sm:text-base font-medium text-gray-900">
                                    {formatCurrency(
                                      property.scheme.booking_advance
                                    )}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <div>
                                <div className="flex justify-between items-center mb-2">
                                  <span className="text-xs sm:text-sm font-medium text-gray-700">
                                    Payment Progress
                                  </span>
                                  <span className="text-xs sm:text-sm text-gray-600">
                                    {installmentsInfo.paid}
                                  </span>
                                </div>
                                <Progress
                                  value={installmentsInfo.progress}
                                  className="h-2 sm:h-3"
                                />
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                <div className="space-y-1">
                                  <p className="text-xs sm:text-sm text-gray-600">
                                    Amount Paid
                                  </p>
                                  <p className="text-sm sm:text-base font-medium text-gray-900">
                                    {formatCurrency(property.user_paid)}
                                  </p>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-xs sm:text-sm text-gray-600">
                                    Balance Amount
                                  </p>
                                  <p className="text-sm sm:text-base font-medium text-gray-900">
                                    {formatCurrency(property.balance_amount)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </TabsContent>

                        <TabsContent value="rental">
                          <div className="space-y-4">
                            {isPaymentCompleted ? (
                              <>
                                <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border border-blue-200">
                                  <p className="text-blue-800 font-medium mb-2 text-sm sm:text-base">
                                    💰 Rental Income Active
                                  </p>
                                  <p className="text-blue-700 text-xs sm:text-sm">
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
                                      ₹0
                                    </p>
                                  </div>
                                </div>
                              </>
                            ) : (
                              <div className="bg-orange-50 p-3 sm:p-4 rounded-lg border border-orange-200">
                                <p className="text-orange-800 font-medium mb-2 text-sm sm:text-base">
                                  ⏳ Rental Pending
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
                          className="w-full sm:w-auto"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full sm:w-auto"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download Agreement
                        </Button>
                        {!isPaymentCompleted && (
                          <Button
                            size="sm"
                            className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600"
                            onClick={() => handleMakePayment(property)}
                            disabled={loadingCustomerInfo}
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
          token={token}
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
