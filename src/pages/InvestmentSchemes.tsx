import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  PaginationEllipsis,
} from '@/components/ui/pagination';
import {
  DollarSign,
  Clock,
  Calendar,
  Building,
  TrendingUp,
  AlertCircle,
  Loader2,
  ArrowRight,
  CreditCard,
} from 'lucide-react';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/contexts/AuthContext';
import { schemeApi } from '@/api/schemeApi';
import { InvestmentSchemeData, SchemeType } from '@/api/models/schemeModels';

interface InvestmentSchemesProps {
  projectName?: string;
  projectId?: string;
}

const InvestmentSchemes: React.FC<InvestmentSchemesProps> = ({ projectName, projectId }) => {
  const id = projectId;
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [schemes, setSchemes] = useState<InvestmentSchemeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const SCHEMES_PER_PAGE = 1;

  useEffect(() => {
    const fetchSchemes = async () => {
      if (!id) {
        setError('No project ID provided');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);

        const response = await schemeApi.listByProject({
          project_id: id,
          page: currentPage,
          limit: SCHEMES_PER_PAGE
        });

        setSchemes(response?.data.schemes ?? []);

        if (response?.data.total_count) {
          const total = response.data.total_count;
          setTotalCount(total);
          setTotalPages(Math.ceil(total / SCHEMES_PER_PAGE));
        } else {
          setTotalCount(schemes.length);
          setTotalPages(1);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching schemes:', err);
        setError('Failed to fetch investment schemes. Please check your connection and try again.');
        setLoading(false);
      }
    };

    fetchSchemes();
  }, [id, currentPage]);

  const formatCurrency = (amount: number | null) => {
    if (!amount) return 'N/A';
    const lakhs = amount / 100000;
    return lakhs >= 100
      ? `₹${(lakhs / 100).toFixed(2)} Cr`
      : `₹${lakhs.toFixed(2)} L`;
  };

  const getSchemeTypeColor = (schemeType: SchemeType) => {
    switch (schemeType) {
      case SchemeType.SINGLE_PAYMENT:
        return 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white';
      case SchemeType.INSTALLMENT:
        return 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white';
      default:
        return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white';
    }
  };

  const getSchemeTypeDisplayName = (schemeType: SchemeType) => {
    switch (schemeType) {
      case SchemeType.SINGLE_PAYMENT:
        return 'One-Time';
      case SchemeType.INSTALLMENT:
        return 'EMI';
      default:
        return schemeType;
    }
  };

  const handleInvestNow = (schemeId: string) => {
    if (isAuthenticated) {
      navigate(`/purchase/${id}`, { state: { selectedSchemeId: schemeId } });
    } else {
      navigate('/login', { state: { from: `/purchase/${id}`, selectedSchemeId: schemeId } });
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  const displayProjectName = projectName || 'Project';

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center min-h-screen pt-20">
          <div className="text-center space-y-4">
            <Loader2 className="w-12 h-12 animate-spin text-yellow-500 mx-auto" />
            <div>
              <p className="text-xl font-semibold text-foreground">Loading Investment Schemes</p>
              <p className="text-sm text-muted-foreground mt-1">Please wait while we fetch the details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !id) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center min-h-screen pt-20 p-4">
          <Alert className="max-w-md border-red-200 bg-red-50">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <AlertDescription className="ml-2">
              <p className="font-semibold text-red-800 mb-1">Error Loading Schemes</p>
              <p className="text-red-700 text-sm">{error || 'Invalid project ID'}</p>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Header Section */}
      <div className="bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-700 text-white py-16 px-4 mt-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4">
            <Badge className="bg-white/20 text-white border-white/30 px-4 py-1.5 text-sm font-medium">
              {displayProjectName}
            </Badge>
            <h1 className="text-5xl font-bold tracking-tight glow-text">
              Investment Schemes
            </h1>
            <p className="text-xl text-yellow-100 max-w-2xl mx-auto">
              Discover exclusive investment opportunities tailored for your financial goals
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Results Count */}
        {schemes.length > 0 && (
          <div className="flex justify-between items-center mb-6">
            <p className="text-sm text-muted-foreground">
              Showing {((currentPage - 1) * SCHEMES_PER_PAGE) + 1} to {Math.min(currentPage * SCHEMES_PER_PAGE, totalCount)} of {totalCount} schemes
            </p>
          </div>
        )}

        {/* Stats Bar */}
        {schemes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="border-border shadow-lg bg-card">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Schemes</p>
                    <p className="text-3xl font-bold text-foreground mt-1">{totalCount}</p>
                  </div>
                  <div className="h-12 w-12 bg-yellow-500/20 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-yellow-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border shadow-lg bg-card">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Starting From</p>
                    <p className="text-3xl font-bold text-foreground mt-1">
                      {formatCurrency(Math.min(...schemes.map(s => s.booking_advance || Infinity)))}
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-emerald-500/20 rounded-full flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-emerald-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border shadow-lg bg-card">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Max Area</p>
                    <p className="text-3xl font-bold text-foreground mt-1">
                      {Math.max(...schemes.map(s => s.area_sqft))} sqft
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-yellow-500/20 rounded-full flex items-center justify-center">
                    <Building className="w-6 h-6 text-yellow-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Schemes Grid */}
        {schemes.length === 0 ? (
          <Alert className="max-w-2xl mx-auto border-yellow-500/30 bg-yellow-500/10">
            <AlertCircle className="h-5 w-5 text-yellow-500" />
            <AlertDescription className="ml-2">
              <p className="font-semibold text-foreground mb-1">No Schemes Available</p>
              <p className="text-muted-foreground text-sm">
                There are currently no investment schemes available for this project. Please check back later or contact our support team.
              </p>
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {schemes.map((scheme) => (
                <Card key={scheme.id} className="border-border shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-card overflow-hidden">
                  <div className="h-1.5 bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-700" />

                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <CardTitle className="text-lg font-bold text-foreground">
                        {scheme.scheme_name}
                      </CardTitle>
                      <Badge className={`${getSchemeTypeColor(scheme.scheme_type)} px-2.5 py-0.5 text-xs font-semibold`}>
                        {getSchemeTypeDisplayName(scheme.scheme_type)}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5" />
                        <span>{scheme.area_sqft} sqft</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{new Date(scheme.start_date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3 pt-0">
                    <div className="grid grid-cols-2 gap-3">
                      {/* Booking Advance - Show for both types if available */}
                      {(scheme.booking_advance && scheme.booking_advance > 0) && (
                        <div className="bg-background p-3 rounded-lg border border-border">
                          <div className="flex items-center gap-1.5 mb-1">
                            <CreditCard className="w-3.5 h-3.5 text-muted-foreground" />
                            <span className="text-xs font-medium text-muted-foreground">
                              {scheme.scheme_type === SchemeType.SINGLE_PAYMENT ? 'Booking Advance' : 'Booking Advance'}
                            </span>
                          </div>
                          <span className="text-base font-bold text-emerald-600">
                            {formatCurrency(scheme.booking_advance)}
                          </span>
                        </div>
                      )}

                      {/* Monthly EMI for installment plans */}
                      {scheme.scheme_type === SchemeType.INSTALLMENT && (
                        <div className="bg-background p-3 rounded-lg border border-border">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                            <span className="text-xs font-medium text-muted-foreground">Monthly EMI</span>
                          </div>
                          <span className="text-base font-bold text-foreground">
                            {formatCurrency(scheme.monthly_installment_amount)}
                          </span>
                        </div>
                      )}

                      {/* Balance Payment Days for single payment */}
                      {scheme.scheme_type === SchemeType.SINGLE_PAYMENT && scheme.balance_payment_days && (
                        <div className="bg-background p-3 rounded-lg border border-border">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                            <span className="text-xs font-medium text-muted-foreground">Balance Payment</span>
                          </div>
                          <span className="text-base font-bold text-foreground">
                            {scheme.balance_payment_days} days
                          </span>
                        </div>
                      )}

                      {/* Duration for installment plans */}
                      {scheme.scheme_type === SchemeType.INSTALLMENT && (
                        <div className="bg-background p-3 rounded-lg border border-border">
                          <span className="text-xs font-medium text-muted-foreground block mb-1">Duration</span>
                          <span className="text-base font-bold text-foreground">
                            {scheme.total_installments || 'N/A'} months
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Rental Information */}
                    {scheme.rental_start_month && (
                      <div className="bg-emerald-500/10 p-2.5 rounded-lg border border-emerald-500/30">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-foreground flex items-center gap-1.5">
                            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                            Rental Returns Start
                          </span>
                          <span className="text-sm font-bold text-emerald-500">
                            Month {scheme.rental_start_month}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Action Button */}
                    <Button
                      onClick={() => handleInvestNow(scheme.id)}
                      className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-500/90 hover:to-yellow-600/90 text-white font-semibold py-5 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 group"
                    >
                      <DollarSign className="w-4 h-4 mr-2" />
                      Invest Now
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 0 && (
              <div className="flex flex-col items-center gap-6 mt-12">
                {/* Page info text */}
                <div className="text-center">
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </span>
                </div>

                {/* Shadcn UI Pagination */}
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage > 1) handlePageChange(currentPage - 1);
                        }}
                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />

                    </PaginationItem>

                    {getPageNumbers().map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            handlePageChange(page);
                          }}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}

                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage < totalPages) handlePageChange(currentPage + 1);
                        }}
                        className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
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