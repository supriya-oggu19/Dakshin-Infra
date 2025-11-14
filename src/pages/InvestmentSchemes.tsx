import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { clearPurchaseAndBillingSession } from "@/utils/clearPurchaseBilling";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  DollarSign,
  Clock,
  Calendar,
  Building,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  CreditCard,
} from 'lucide-react';
import Navigation from '@/components/Navigation';
import { IndianRupee } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { schemeApi } from '@/api/schemeApi';
import { InvestmentSchemeData, SchemeType } from '@/api/models/schemeModels';

interface InvestmentSchemesProps {
  projectName?: string;
  projectId?: string;
  minInvestmentAmount?: number;
}

const InvestmentSchemes: React.FC<InvestmentSchemesProps> = ({
  projectName,
  projectId,
  minInvestmentAmount,
}) => {
  const id = projectId;
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [currentSchemes, setCurrentSchemes] = useState<InvestmentSchemeData[]>([]);
  const [totalSchemes, setTotalSchemes] = useState(0);
  const [totalInvestmentAmount, setTotalInvestmentAmount] = useState(0.0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchedProjectName, setFetchedProjectName] = useState<string>('');

  const limit = 4;

  const fetchSchemes = useCallback(async (page: number) => {
    if (!id) {
      setError('No project ID provided');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const params = { project_id: id, page, limit };
      const response = await schemeApi.listByProject(params);
      const data = response?.data;
      setCurrentSchemes(data?.schemes ?? []);
      setTotalPages(data?.total_pages ?? 1);
      setTotalSchemes(data?.total_schemes ?? 0);
      setTotalInvestmentAmount(data?.total_invertment_amount ?? 0);
      setCurrentPage(page);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching schemes:', err);
      setError('Failed to fetch investment schemes. Please check your connection and try again.');
      setCurrentSchemes([]);
      setTotalPages(1);
      setTotalSchemes(0);
      setTotalInvestmentAmount(0);
      setLoading(false);
    }
  }, [id, limit]);

  useEffect(() => {
    fetchSchemes(1);
  }, [fetchSchemes]);

  const handlePageChange = (page: number) => {
    fetchSchemes(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /* --------------------------------------------------- */
  /*  HELPERS                                            */
  /* --------------------------------------------------- */
  const formatCurrency = (amount: number | null | undefined): string => {
    if (amount == null || isNaN(amount)) return 'N/A';
    if (amount === 0) return '₹0';

    const abs = Math.abs(amount);
    if (abs >= 1_00_00_000) {
      const v = (abs / 1_00_00_000).toFixed(2).replace(/\.00$/, '');
      return `₹${v} crore`;
    }
    if (abs >= 1_00_000) {
      const v = (abs / 1_00_000).toFixed(2).replace(/\.00$/, '');
      return `₹${v} lakh`;
    }
    if (abs >= 1_000) {
      const v = (abs / 1_000).toFixed(2).replace(/\.00$/, '');
      return `₹${v} K`;
    }
    return `₹${abs.toLocaleString('en-IN')}`;
  };

  const getSchemeTypeColor = (type: SchemeType) => {
    switch (type) {
      case SchemeType.SINGLE_PAYMENT:
        return 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white';
      case SchemeType.INSTALLMENT:
        return 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white';
      default:
        return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white';
    }
  };

  const getSchemeTypeDisplayName = (type: SchemeType) => {
    switch (type) {
      case SchemeType.SINGLE_PAYMENT:
        return 'One‑Time';
      case SchemeType.INSTALLMENT:
        return 'EMI';
      default:
        return type;
    }
  };

  const handleInvestNow = (schemeId: string) => {
    clearPurchaseAndBillingSession();
    if (isAuthenticated) {
      navigate(`/purchase/${id}`, { state: { selectedSchemeId: schemeId, projectName: projectName } });
    } else {
      navigate('/login', {
        state: { from: `/purchase/${id}`, selectedSchemeId: schemeId },
      });
    }
  };

  const displayProjectName = projectName || 'Project';

  /* --------------------------------------------------- */
  /*  RENDER – LOADING                                   */
  /* --------------------------------------------------- */
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex flex-col items-center justify-center min-h-screen pt-20 px-4">
          <Loader2 className="w-12 h-12 animate-spin text-yellow-500 mb-4" />
          <p className="text-lg font-semibold text-foreground">
            Loading Investment Schemes
          </p>
          <p className="text-sm text-muted-foreground">
            Please wait while we fetch the details...
          </p>
        </div>
      </div>
    );
  }

  /* --------------------------------------------------- */
  /*  RENDER – ERROR                                     */
  /* --------------------------------------------------- */
  if (error || !id) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center min-h-screen pt-20 p-4">
          <Alert className="max-w-md w-full border-red-200 bg-red-50">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <AlertDescription className="ml-2">
              <p className="font-semibold text-red-800 mb-1">
                Error Loading Schemes
              </p>
              <p className="text-red-700 text-sm">{error || 'Invalid project ID'}</p>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  /* --------------------------------------------------- */
  /*  MAIN RENDER                                        */
  /* --------------------------------------------------- */
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* ---------- HERO ---------- */}
      <header className="bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-700 text-white py-12 px-4 mt-16 sm:py-16">
        <div className="max-w-7xl mx-auto text-center space-y-4">
          <Badge className="bg-white/20 text-white border-white/30 px-3 py-1 text-xs sm:text-sm">
            {displayProjectName}
          </Badge>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            Investment Schemes
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-yellow-100 max-w-2xl mx-auto">
            Discover exclusive investment opportunities tailored for your
            financial goals
          </p>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Stats Bar */}
        {totalSchemes > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 sm:mb-12">
            <Card className="shadow-lg">
              <CardContent className="pt-5 sm:pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total Schemes</p>
                    <p className="text-2xl sm:text-3xl font-bold text-foreground mt-1">{totalSchemes}</p>
                  </div>
                  <div className="h-10 w-10 sm:h-12 sm:w-12 bg-yellow-500/20 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Starting From */}
            <Card className="shadow-lg">
              <CardContent className="pt-5 sm:pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                      Starting From
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold text-foreground mt-1">
                      {formatCurrency(minInvestmentAmount)}
                    </p>
                  </div>
                  <div className="h-10 w-10 sm:h-12 sm:w-12 bg-emerald-500/20 rounded-full flex items-center justify-center">
                    <IndianRupee className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

           
          </div>
        )}

        {/* Schemes Grid */}
        {totalSchemes === 0 ? (
          <Alert className="max-w-2xl mx-auto border-yellow-500/30 bg-yellow-500/10">
            <AlertCircle className="h-5 w-5 text-yellow-500" />
            <AlertDescription className="ml-2">
              <p className="font-semibold text-foreground mb-1">
                No Schemes Available
              </p>
              <p className="text-muted-foreground text-sm">
                There are currently no investment schemes available for this
                project. Please check back later or contact our support team.
              </p>
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
              {currentSchemes.map((scheme) => (
                <Card key={scheme.id} className="border-border shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-card overflow-hidden">
                  <div className="h-1 bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-700" />

                  <CardHeader className="pb-2 sm:pb-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                      <CardTitle className="text-base sm:text-lg font-bold text-foreground">
                        {scheme.scheme_name}
                      </CardTitle>
                      <Badge
                        className={`${getSchemeTypeColor(
                          scheme.scheme_type
                        )} px-2 py-0.5 text-xs font-semibold`}
                      >
                        {getSchemeTypeDisplayName(scheme.scheme_type)}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Building className="w-3.5 h-3.5" />
                        <span>{scheme.area_sqft} sqft</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>
                          {new Date(scheme.start_date).toLocaleDateString(
                            'en-IN',
                            { month: 'short', year: 'numeric' }
                          )}
                        </span>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3 pt-0">
                    {/* Small info tiles – 1 col on mobile, 2 col on sm+ */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                      {/* Booking Advance */}
                      {scheme.booking_advance && scheme.booking_advance > 0 && (
                        <div className="bg-background p-2.5 rounded-lg border border-border hover:shadow-md transition-shadow">
                          <div className="flex items-center gap-1.5 mb-1">
                            <CreditCard className="w-3.5 h-3.5 text-muted-foreground" />
                            <span className="text-xs font-medium text-muted-foreground">
                              Booking Advance
                            </span>
                          </div>
                          <span className="text-sm sm:text-base font-bold text-emerald-600">
                            {formatCurrency(scheme.booking_advance)}
                          </span>
                        </div>
                      )}

                      {/* EMI (installment) */}
                      {scheme.scheme_type === SchemeType.INSTALLMENT && (
                        <div className="bg-background p-2.5 rounded-lg border border-border hover:shadow-md transition-shadow">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                            <span className="text-xs font-medium text-muted-foreground">
                              Monthly EMI
                            </span>
                          </div>
                          <span className="text-sm sm:text-base font-bold text-foreground">
                            {formatCurrency(scheme.monthly_installment_amount)}
                          </span>
                        </div>
                      )}

                      {/* Balance days (single) */}
                      {scheme.scheme_type === SchemeType.SINGLE_PAYMENT &&
                        scheme.balance_payment_days && (
                          <div className="bg-background p-2.5 rounded-lg border border-border hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-1.5 mb-1">
                              <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                              <span className="text-xs font-medium text-muted-foreground">
                                Balance Payment
                              </span>
                            </div>
                            <span className="text-sm sm:text-base font-bold text-foreground">
                              {scheme.balance_payment_days} days
                            </span>
                          </div>
                        )}

                      {/* Duration (installment) */}
                      {scheme.scheme_type === SchemeType.INSTALLMENT && (
                        <div className="bg-background p-2.5 rounded-lg border border-border hover:shadow-md transition-shadow">
                          <div className="text-xs font-medium text-muted-foreground mb-1">
                            Duration
                          </div>
                          <span className="text-sm sm:text-base font-bold text-foreground">
                            {scheme.total_installments || 'N/A'} months
                          </span>
                        </div>
                      )}

                      {/* Monthly Rental Income */}
                      {scheme.monthly_rental_income && (
                        <div className="bg-background p-2.5 rounded-lg border hover:shadow-md transition-shadow col-span-1">
                          <div className="flex items-center gap-1.5 mb-1">
                            <TrendingUp className="w-3.5 h-3.5" />
                            <span className="text-xs font-medium">
                              Monthly Rental Income
                            </span>
                          </div>
                          <span className="text-sm sm:text-base font-bold text-primary">
                            {formatCurrency(scheme.monthly_rental_income)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Rental start month badge */}
                    {scheme.rental_start_month && (
                      <div className="bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/30 text-xs sm:text-sm">
                        <div className="flex items-center justify-between">
                          <span className="font-medium flex items-center gap-1">
                            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                            Rental Returns Start
                          </span>
                          <span className="font-bold text-emerald-500">
                            Month {scheme.rental_start_month}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Invest Button */}
                    <Button
                      onClick={() => handleInvestNow(scheme.id)}
                      className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-500/90 hover:to-yellow-600/90 text-white font-semibold py-4 sm:py-5 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 group"
                    >
                      Invest Now
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* ---- Pagination ---- */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-10 sm:mt-12">
                <Pagination>
                  <PaginationContent className="flex flex-wrap gap-1 sm:gap-2">
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage > 1) handlePageChange(currentPage - 1);
                        }}
                        className="px-3 py-2 text-sm sm:text-base"
                      />
                    </PaginationItem>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              handlePageChange(page);
                            }}
                            className={`px-3 py-2 text-sm sm:text-base rounded-md transition-colors ${currentPage === page
                              ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-semibold shadow-md'
                              : 'bg-white text-gray-700 border border-gray-200 hover:bg-yellow-50'
                              }`}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      )
                    )}

                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage < totalPages)
                            handlePageChange(currentPage + 1);
                        }}
                        className="px-3 py-2 text-sm sm:text-base"
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default InvestmentSchemes;