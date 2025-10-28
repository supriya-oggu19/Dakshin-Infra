import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Download,
  Eye,
  FileText,
  Calendar,
  Search,
  Filter,
  CheckCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  Building,
  Home,
  FileSignature,
  Users,
} from "lucide-react";
import Navigation from "@/components/Navigation";
import { useState, useEffect } from "react";

const Agreements = () => {
  const [agreements, setAgreements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [expandedAgreement, setExpandedAgreement] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // Map API status to frontend status
  const mapApiStatus = (apiStatus) => {
    switch (apiStatus) {
      case "signed":
        return "Signed";
      case "active":
        return "Active";
      case "draft":
        return "Draft";
      case "pending":
        return "Pending";
      default:
        return "Draft";
    }
  };

  // Map API agreement type to display name
  const mapAgreementType = (apiType) => {
    switch (apiType) {
      case "mou":
        return "MOU";
      case "agreement_of_sale":
        return "Sale Agreement";
      case "sale_deed":
        return "Sale Deed";
      case "rental_agreement":
        return "Rental Agreement";
      case "installment_agreement":
        return "Installment Agreement";
      default:
        return apiType;
    }
  };

  // Fetch agreements from API
  const fetchAgreements = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "http://127.0.0.1:8001/api/legal-agreements/?page=1&limit=100"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch agreements");
      }

      const result = await response.json();

      if (result.success) {
        // Transform API data to match frontend structure
        const transformedAgreements = result.data.map((agreement) => ({
          id: agreement.id,
          projectName: "Ramya Constructions",
          unitNumber: agreement.unit_id,
          agreementType: mapAgreementType(agreement.agreement_type),
          date: agreement.agreement_date,
          status: mapApiStatus(agreement.status),
          fileSize: "1.5 MB",
          lastModified: agreement.uploaded_at,
          description: `${mapAgreementType(
            agreement.agreement_type
          )} for unit ${agreement.unit_id}`,
          signatories: agreement.signatories,
          validUntil: agreement.valid_until,
          documents: {
            agreementOfSale: {
              available: agreement.agreement_type === "agreement_of_sale",
              fileName: agreement.document_name,
              filePath: agreement.file_path,
            },
            possession_letter: {
              available: agreement.agreement_type === "possession_letter",
              fileName: agreement.document_name,
              filePath: agreement.file_path,
            },
            saleDeed: {
              available: agreement.agreement_type === "sale_deed",
              fileName: agreement.document_name,
              filePath: agreement.file_path,
            },
            rentalAgreement: {
              available: agreement.agreement_type === "rental_agreement",
              fileName: agreement.document_name,
              filePath: agreement.file_path,
            },
            allotment_letter: {
              available: agreement.agreement_type === "allotment_letter",
              fileName: agreement.document_name,
              filePath: agreement.file_path,
            },
          },
        }));

        setAgreements(transformedAgreements);
      }
    } catch (err) {
      setError(err.message);
      console.error("Error fetching agreements:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgreements();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "Signed":
        return "bg-emerald-500/10 text-emerald-700 border-emerald-200";
      case "Active":
        return "bg-blue-500/10 text-blue-700 border-blue-200";
      case "Pending":
        return "bg-amber-500/10 text-amber-700 border-amber-200";
      case "Draft":
        return "bg-gray-500/10 text-gray-700 border-gray-200";
      default:
        return "bg-gray-500/10 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Signed":
        return <CheckCircle className="w-3 h-3 md:w-4 md:h-4" />;
      case "Active":
        return <Clock className="w-3 h-3 md:w-4 md:h-4" />;
      default:
        return <FileText className="w-3 h-3 md:w-4 md:h-4" />;
    }
  };

  const handleDownloadDocument = async (
    docType,
    fileName,
    filePath,
    available
  ) => {
    if (!available) {
      alert(
        "This document is not yet available. Please contact support for more information."
      );
      return;
    }

    try {
      const response = await fetch(filePath);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log(`Downloading ${docType}: ${fileName}`);
    } catch (err) {
      console.error("Error downloading document:", err);
      alert(`Failed to download ${docType}. Please try again.`);
    }
  };

  const toggleAgreementExpansion = (agreementId) => {
    setExpandedAgreement(expandedAgreement === agreementId ? null : agreementId);
  };

  // Filter agreements based on search and filter
  const filteredAgreements = agreements.filter((agreement) => {
    const matchesSearch =
      agreement.unitNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agreement.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agreement.agreementType.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = !filterType || agreement.agreementType === filterType;

    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
        <Navigation />
        <div className="pt-20 pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600 font-medium">
                  Loading agreements...
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
        <Navigation />
        <div className="pt-20 pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-red-600" />
                </div>
                <p className="text-red-600 font-medium mb-4">Error: {error}</p>
                <Button 
                  onClick={fetchAgreements}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      <Navigation />

      <div className="pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-600/10 rounded-lg">
                <FileSignature className="w-6 h-6 text-blue-600" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Legal Agreements
              </h1>
            </div>
            <p className="text-gray-600 text-sm sm:text-base max-w-2xl">
              Manage and access all your property-related legal documents in one place
            </p>
          </div>

          {/* Summary Stats - Mobile Optimized */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
            <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">Total</p>
                    <p className="text-lg sm:text-xl font-bold text-gray-900">
                      {agreements.length}
                    </p>
                  </div>
                  <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">Active</p>
                    <p className="text-lg sm:text-xl font-bold text-blue-600">
                      {agreements.filter((a) => a.status === "Active").length}
                    </p>
                  </div>
                  <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">Signed</p>
                    <p className="text-lg sm:text-xl font-bold text-emerald-600">
                      {agreements.filter((a) => a.status === "Signed").length}
                    </p>
                  </div>
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">Documents</p>
                    <p className="text-lg sm:text-xl font-bold text-purple-600">
                      {agreements.length}
                    </p>
                  </div>
                  <Download className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm mb-6">
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-4">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search by project, unit, or type..."
                    className="pl-10 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* Filter Toggle for Mobile */}
                <div className="lg:hidden">
                  <Button
                    variant="outline"
                    className="w-full flex items-center justify-between"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <span className="flex items-center">
                      <Filter className="w-4 h-4 mr-2" />
                      Filters
                    </span>
                    {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </Button>
                </div>

                {/* Filters - Hidden on mobile by default */}
                <div className={`${showFilters ? 'block' : 'hidden'} lg:block`}>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <select
                      className="flex h-10 w-full items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                    >
                      <option value="">All Agreement Types</option>
                      <option value="Sale Agreement">Sale Agreement</option>
                      <option value="MOU">MOU</option>
                      <option value="Sale Deed">Sale Deed</option>
                      <option value="Rental Agreement">Rental Agreement</option>
                      <option value="Installment Agreement">Installment Agreement</option>
                    </select>
                    
                    <Button
                      variant="outline"
                      className="flex items-center"
                      onClick={() => {
                        setSearchTerm("");
                        setFilterType("");
                        setShowFilters(false);
                      }}
                    >
                      Clear Filters
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Agreements List */}
          <div className="space-y-4">
            {filteredAgreements.length === 0 ? (
              <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm">
                <CardContent className="p-8 text-center">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No agreements found
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {agreements.length === 0
                      ? "You don't have any legal agreements yet."
                      : "Try adjusting your search or filters."}
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredAgreements.map((agreement) => (
                <Card
                  key={agreement.id}
                  className="border-0 shadow-sm hover:shadow-md transition-all duration-200 bg-white/70 backdrop-blur-sm overflow-hidden"
                >
                  {/* Header - Always Visible */}
                  <CardHeader className="p-4 sm:p-6 border-b border-gray-100 bg-white/50">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                            <div className="min-w-0">
                              <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                                {agreement.projectName}
                              </h3>
                              <p className="text-gray-600 text-xs sm:text-sm">
                                Unit {agreement.unitNumber}
                              </p>
                            </div>
                            <Badge 
                              className={`${getStatusColor(agreement.status)} text-xs font-medium`}
                            >
                              <div className="flex items-center gap-1">
                                {getStatusIcon(agreement.status)}
                                <span className="hidden sm:inline">{agreement.status}</span>
                              </div>
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Building className="w-3 h-3" />
                              {agreement.agreementType}
                            </span>
                            <span>{agreement.fileSize}</span>
                            <span className="hidden sm:inline">
                              {new Date(agreement.date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-shrink-0 ml-2"
                        onClick={() => toggleAgreementExpansion(agreement.id)}
                      >
                        {expandedAgreement === agreement.id ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </CardHeader>

                  {/* Expandable Content */}
                  {expandedAgreement === agreement.id && (
                    <CardContent className="p-4 sm:p-6 space-y-6">
                      {/* Agreement Details */}
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <FileSignature className="w-4 h-4 text-blue-600" />
                            <h4 className="font-semibold text-gray-900 text-sm">Agreement Details</h4>
                          </div>
                          <p className="text-gray-600 text-sm">{agreement.description}</p>
                          
                          <div className="space-y-3">
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-gray-600 flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                Valid Until:
                              </span>
                              <span className="font-medium text-gray-900">
                                {new Date(agreement.validUntil).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex justify-between items-start text-sm">
                              <span className="text-gray-600 flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                Signatories:
                              </span>
                              <span className="font-medium text-gray-900 text-right max-w-[150px]">
                                {agreement.signatories.join(", ")}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Documents */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <Download className="w-4 h-4 text-blue-600" />
                            <h4 className="font-semibold text-gray-900 text-sm">Available Documents</h4>
                          </div>
                          <div className="grid gap-2">
                            {Object.entries(agreement.documents).map(([docKey, doc]) => (
                              <div
                                key={docKey}
                                className={`flex items-center justify-between p-3 rounded-lg border ${
                                  doc.available
                                    ? "border-emerald-200 bg-emerald-50/50"
                                    : "border-gray-200 bg-gray-50/50"
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                  <FileText className={`w-3 h-3 flex-shrink-0 ${
                                    doc.available ? "text-emerald-600" : "text-gray-400"
                                  }`} />
                                  <span className="text-sm text-gray-700 truncate capitalize">
                                    {docKey.replace(/([A-Z_])/g, " $1").trim()}
                                  </span>
                                </div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className={`text-xs h-8 px-3 ${
                                    doc.available 
                                      ? "text-emerald-700 hover:bg-emerald-100" 
                                      : "text-gray-500 cursor-not-allowed"
                                  }`}
                                  onClick={() =>
                                    handleDownloadDocument(
                                      docKey.replace(/([A-Z_])/g, " $1").trim(),
                                      doc.fileName,
                                      doc.filePath,
                                      doc.available
                                    )
                                  }
                                  disabled={!doc.available}
                                >
                                  {doc.available ? (
                                    <>
                                      <Download className="w-3 h-3 mr-1" />
                                      Download
                                    </>
                                  ) : (
                                    "Pending"
                                  )}
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                   
                    </CardContent>
                  )}
                </Card>
              ))
            )}
          </div>

         
        </div>
      </div>
    </div>
  );
};

export default Agreements;