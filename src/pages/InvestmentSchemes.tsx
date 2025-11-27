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
  Crown,
  Sparkles,
  Target,
  BarChart3,
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
        return 'bg-gradient-to-r from-blue-600 to-blue-700 text-white';
      case SchemeType.INSTALLMENT:
        return 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white';
      default:
        return 'bg-gradient-to-r from-slate-600 to-slate-700 text-white';
    }
  };

  const getSchemeTypeDisplayName = (type: SchemeType) => {
    switch (type) {
      case SchemeType.SINGLE_PAYMENT:
        return 'One‑Time Payment';
      case SchemeType.INSTALLMENT:
        return 'Monthly Installments';
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
        <Navigation />
        <div className="flex flex-col items-center justify-center min-h-screen pt-20 px-4">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center mb-6 animate-pulse">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <p className="text-lg font-semibold text-slate-900 mb-2">
            Loading Investment Plans
          </p>
          <p className="text-sm text-slate-600">
            Preparing exclusive investment opportunities...
          </p>
        </div>
      </div>
    );
  }

  if (error || !id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
        <Navigation />
        <div className="flex items-center justify-center min-h-screen pt-20 p-4">
          <Alert className="max-w-md w-full border-red-200 bg-red-50/80 backdrop-blur-sm rounded-2xl">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <AlertDescription className="ml-2">
              <p className="font-semibold text-red-800 mb-1">
                Unable to Load Plans
              </p>
              <p className="text-red-700 text-sm">{error || 'Invalid project ID'}</p>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <Navigation />

      {/* Premium Hero Section */}
      <header className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white py-16 px-4 mt-16">
        <div className="max-w-7xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm border border-white/20 px-6 py-3 rounded-full mb-4">
            <Sparkles className="w-5 h-5 text-white" />
            <span className="text-white font-semibold text-sm uppercase tracking-wider">
              Exclusive Investment Portfolio
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
            Investment Plans
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto font-light leading-relaxed">
            Curated investment opportunities with guaranteed returns and premium benefits
          </p>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Premium Stats Bar */}
        {totalSchemes > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Plans</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">{totalSchemes}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Starting From</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">
                    {formatCurrency(minInvestmentAmount)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <IndianRupee className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Investment Options</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">Flexible</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Investment Plans Grid */}
        {totalSchemes === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg p-12 text-center max-w-2xl mx-auto">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Crown className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">
              Premium Plans Coming Soon
            </h3>
            <p className="text-slate-600 leading-relaxed">
              We are curating exclusive investment opportunities for this project. 
              Please check back soon or contact our investment advisors for early access.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {currentSchemes.map((scheme) => (
                <div key={scheme.id} className="group">
                  <Card className="bg-white/80 backdrop-blur-sm border border-white/50 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 rounded-3xl overflow-hidden">
                    {/* Premium Header Accent */}
                    <div className="h-2 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-600" />
                    
                    <CardHeader className="pb-4">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-3">
                        <CardTitle className="text-xl font-bold text-slate-900">
                          {scheme.scheme_name}
                        </CardTitle>
                        <Badge
                          className={`${getSchemeTypeColor(
                            scheme.scheme_type
                          )} px-4 py-1.5 text-sm font-semibold rounded-full border-0`}
                        >
                          {getSchemeTypeDisplayName(scheme.scheme_type)}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4" />
                          <span>{scheme.area_sqft} sqft</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {new Date(scheme.start_date).toLocaleDateString(
                              'en-IN',
                              { month: 'short', year: 'numeric' }
                            )}
                          </span>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-6">
                      {/* Investment Metrics Grid */}
                      <div className="grid grid-cols-2 gap-4">
                        {/* Booking Advance */}
                        {scheme.booking_advance && scheme.booking_advance > 0 && (
                          <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200">
                            <div className="flex items-center gap-2 mb-2">
                              <CreditCard className="w-4 h-4 text-slate-600" />
                              <span className="text-sm font-medium text-slate-700">
                                Booking Advance
                              </span>
                            </div>
                            <span className="text-lg font-bold text-emerald-600">
                              {formatCurrency(scheme.booking_advance)}
                            </span>
                          </div>
                        )}

                        {/* EMI */}
                        {scheme.scheme_type === SchemeType.INSTALLMENT && (
                          <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200">
                            <div className="flex items-center gap-2 mb-2">
                              <Clock className="w-4 h-4 text-slate-600" />
                              <span className="text-sm font-medium text-slate-700">
                                Monthly EMI
                              </span>
                            </div>
                            <span className="text-lg font-bold text-slate-900">
                              {formatCurrency(scheme.monthly_installment_amount)}
                            </span>
                          </div>
                        )}

                        {/* Balance Payment */}
                        {scheme.scheme_type === SchemeType.SINGLE_PAYMENT &&
                          scheme.balance_payment_days && (
                            <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200">
                              <div className="flex items-center gap-2 mb-2">
                                <Clock className="w-4 h-4 text-slate-600" />
                                <span className="text-sm font-medium text-slate-700">
                                  Balance Payment
                                </span>
                              </div>
                              <span className="text-lg font-bold text-slate-900">
                                {scheme.balance_payment_days} days
                              </span>
                            </div>
                          )}

                        {/* Duration */}
                        {scheme.scheme_type === SchemeType.INSTALLMENT && (
                          <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200">
                            <div className="text-sm font-medium text-slate-700 mb-2">
                              Investment Duration
                            </div>
                            <span className="text-lg font-bold text-slate-900">
                              {scheme.total_installments || 'N/A'} months
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Rental Income Highlight */}
                      {scheme.monthly_rental_income && (
                        <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-4 rounded-xl border border-emerald-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <TrendingUp className="w-5 h-5 text-emerald-600" />
                              <div>
                                <div className="font-semibold text-emerald-800">
                                  Monthly Rental Income
                                </div>
                                <div className="text-lg font-bold text-emerald-600">
                                  {formatCurrency(scheme.monthly_rental_income)}
                                </div>
                              </div>
                            </div>
                            {scheme.rental_start_month && (
                              <Badge className="bg-emerald-600 text-white px-3 py-1 text-xs">
                                Starts Month {scheme.rental_start_month}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Premium CTA Button */}
                      <Button
                        onClick={() => handleInvestNow(scheme.id)}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group text-lg"
                      >
                        <Crown className="w-5 h-5 mr-3" />
                        Invest in This Plan
                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>

            {/* Premium Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-16">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg p-6">
                  <Pagination>
                    <PaginationContent className="flex items-center gap-2">
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage > 1) handlePageChange(currentPage - 1);
                          }}
                          className="px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 transition-colors"
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
                              className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                                currentPage === page
                                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                                  : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
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
                          className="px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 transition-colors"
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default InvestmentSchemes;