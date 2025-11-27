import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  Search,
  FileText,
  BarChart3,
} from "lucide-react";
import Navigation from "@/components/Navigation";
import { portfolioApi } from "../api/portfolio-api";
import {
  PortfolioItem,
  InvestmentSummaryResponse,
} from "../api/models/portfolio.model";
import { Link } from "react-router-dom";
import { clearPurchaseAndBillingSession } from "@/utils/clearPurchaseBilling";

// Enum types
type UnitStatus = 'payment_ongoing' | 'active' | 'rental_active' | 'none';
type PaymentStatus = 'advance_paid' | 'partially_paid' | 'fully_paid' | 'none';

const MyUnits = () => {
  const [portfolioData, setPortfolioData] = useState<PortfolioItem[]>([]);
  const [investmentSummary, setInvestmentSummary] =
    useState<InvestmentSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const projectId = sessionStorage.getItem('currentProjectId');

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const filteredPortfolioData = portfolioData.filter(property =>
    property.unit_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    clearPurchaseAndBillingSession();
    if (projectId) {
      sessionStorage.removeItem(`purchaseState_${projectId}`);
      sessionStorage.removeItem('currentProjectId');
    }
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
    } catch (err: any) {
      console.error("Error fetching user data:", err);
      setError(err.response?.data?.message || "Failed to fetch data");
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="pt-20 pb-12">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex justify-center items-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-3 text-lg text-gray-600">Loading your units...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="pt-20 pb-12">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="text-center text-red-600 bg-red-50 p-6 rounded-lg border border-red-200">
              <p className="mb-4">Error: {error}</p>
              <Button 
                onClick={fetchUserData} 
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Retry
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <div className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  My Units
                </h1>
                <p className="text-gray-600">
                  Manage and track your property investments and rental income
                </p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by Booking ID..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          {investmentSummary && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Total Units</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {investmentSummary.total_units}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Total Investment</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(investmentSummary.total_invested)}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                      <IndianRupee className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Amount Paid</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(investmentSummary.total_paid)}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Balance Amount</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(investmentSummary.total_balance)}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                      <BarChart3 className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Properties List */}
          <div className="space-y-6">
            {filteredPortfolioData.length === 0 ? (
              <Card className="border border-gray-200 shadow-sm">
                <CardContent className="p-12 text-center">
                  <Building2 className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {searchQuery ? 'No Units Found' : 'No Units Yet'}
                  </h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    {searchQuery 
                      ? `No units found matching "${searchQuery}". Try a different booking ID.`
                      : "You haven't purchased any units yet. Explore our projects to get started."}
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredPortfolioData.map((property) => {
                const isRentalActiveStatus = isRentalActive(property.unit_status as UnitStatus);

                return (
                  <Card
                    key={property.unit_id}
                    className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <CardHeader className="border-b border-gray-100 bg-white p-6">
                      <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
                        <div className="min-w-0 flex-1">
                          <div className="mb-3">
                            <div className="text-sm text-gray-600 mb-1">Project Name</div>
                            <div className="text-lg font-semibold text-gray-900">
                              {property.project.project_name}
                            </div>
                          </div>
                          <div className="mb-3">
                            <div className="text-sm text-gray-600 mb-1">Booking ID</div>
                            <div className="text-xl font-bold text-blue-600">
                              {property.unit_number}
                            </div>
                          </div>
                          <div className="flex items-start text-gray-600">
                            <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">
                              {property.project.project_code} - Floor {property.project.floor_number}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge
                            className={`border ${getStatusColor(
                              property.payment_status as PaymentStatus,
                              property.unit_status as UnitStatus
                            )}`}
                          >
                            {getStatusText(
                              property.payment_status as PaymentStatus,
                              property.unit_status as UnitStatus
                            )}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="p-6">
                      <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-6">
                          <TabsTrigger value="overview" className="flex items-center gap-2">
                            <Eye className="w-4 h-4" />
                            Overview
                          </TabsTrigger>
                          <TabsTrigger value="rental" className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" />
                            Rental
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview">
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="space-y-2">
                              <p className="text-sm text-gray-600">Purchase Date</p>
                              <p className="text-base font-medium text-gray-900">
                                {formatDate(property.purchase_date)}
                              </p>
                            </div>
                            <div className="space-y-2">
                              <p className="text-sm text-gray-600">Investment Scheme</p>
                              <p className="text-base font-medium text-gray-900 break-words">
                                {property.scheme.scheme_name}
                              </p>
                            </div>
                            <div className="space-y-2">
                              <p className="text-sm text-gray-600">Total Investment</p>
                              <p className="text-base font-medium text-gray-900">
                                {formatCurrency(property.total_investment)}
                              </p>
                            </div>
                            <div className="space-y-2">
                              <p className="text-sm text-gray-600">Unit Area</p>
                              <p className="text-base font-medium text-gray-900">
                                {property.total_area_sqft} sqft
                              </p>
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="rental">
                          <div className="space-y-4">
                            {isRentalActiveStatus ? (
                              <>
                                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                                  <p className="text-purple-800 font-medium mb-2">
                                    💰 Rental Income Active
                                  </p>
                                  <p className="text-purple-700 text-sm">
                                    Monthly rental income: {formatCurrency(property.monthly_rental)}
                                  </p>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                  <div className="space-y-2">
                                    <p className="text-sm text-gray-600">Monthly Rental</p>
                                    <p className="text-base font-medium text-gray-900">
                                      {formatCurrency(property.monthly_rental)}
                                    </p>
                                  </div>
                                  <div className="space-y-2">
                                    <p className="text-sm text-gray-600">Rental Start Date</p>
                                    <p className="text-base font-medium text-gray-900">
                                      {formatDate(property.rental_start_date)}
                                    </p>
                                  </div>
                                  <div className="space-y-2">
                                    <p className="text-sm text-gray-600">Total Received</p>
                                    <p className="text-base font-medium text-gray-900">
                                      Not Available
                                    </p>
                                  </div>
                                </div>
                              </>
                            ) : (
                              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                                <p className="text-orange-800 font-medium mb-2 flex items-center gap-2">
                                  <Clock className="w-4 h-4" />
                                  Rental Pending
                                </p>
                                <p className="text-orange-700 text-sm">
                                  Rental income will start from {formatDate(property.rental_start_date)} after payment completion.
                                </p>
                                <p className="text-orange-700 text-sm mt-2">
                                  Expected monthly rental: {formatCurrency(property.monthly_rental)}
                                </p>
                              </div>
                            )}
                          </div>
                        </TabsContent>
                      </Tabs>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t border-gray-100">
                        <Button
                          variant="outline"
                          className="flex items-center gap-2 border-gray-300 hover:bg-gray-50"
                          asChild
                        >
                          <Link to={`/sip?unit=${property.unit_number}`}>
                            <Eye className="w-4 h-4" />
                            View Payment Details
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          className="flex items-center gap-2 border-gray-300 hover:bg-gray-50"
                          asChild
                        >
                          <Link to={`/agreements?unit=${property.unit_number}`}>
                            <FileText className="w-4 h-4" />
                            View Agreement
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyUnits;