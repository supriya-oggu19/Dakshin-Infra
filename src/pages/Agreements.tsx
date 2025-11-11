import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Download,
  FileText,
  Search,
  Building,
  Calendar,
  Users,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Navigation from "@/components/Navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { legalAgreementApi } from "@/api/agreementApi";
import { LegalAgreement } from "@/api/models/legalAgreement.model";

interface Document {
  type: string;
  name: string;
  path: string;
}

interface GroupedAgreement {
  unitNumber: string;
  projectName: string;
  documents: Document[];
  signatories: string[];
  agreementDate: string;
  validUntil: string;
  status: string;
}

const ITEMS_PER_PAGE = 10;

const Agreements = () => {
  const [groupedAgreements, setGroupedAgreements] = useState<GroupedAgreement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedUnit, setExpandedUnit] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const observer = useRef<IntersectionObserver | null>(null);

  const location = useLocation();

  // Map status
  const mapStatus = (status: string): string => {
    switch (status) {
      case "signed":
      case "executed":
        return "Signed";
      case "pending_signature":
        return "Pending";
      case "draft":
      default:
        return "Draft";
    }
  };

  // Map type to display name
  const mapType = (type: string): string => {
    const map: Record<string, string> = {
      mou: "MOU",
      agreement_of_sale: "Agreement of Sale",
      sale_deed: "Sale Deed",
      rental_agreement: "Rental Agreement",
      allotment_letter: "Allotment Letter",
      possession_letter: "Possession Letter",
    };
    return map[type] || type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  // Group agreements by unit_number
  const groupAgreements = (data: LegalAgreement[]): GroupedAgreement[] => {
    const grouped = new Map<string, GroupedAgreement>();

    data.forEach((item) => {
      if (!item.unit_number) return;

      const key = item.unit_number;
      if (!grouped.has(key)) {
        grouped.set(key, {
          unitNumber: item.unit_number,
          projectName: "Ramya Constructions",
          documents: [],
          signatories: [],
          agreementDate: item.agreement_date,
          validUntil: item.valid_until,
          status: mapStatus(item.status),
        });
      }

      const group = grouped.get(key)!;

      // Add document if not duplicate
      const docExists = group.documents.some((d) => d.path === item.file_path);
      if (!docExists) {
        group.documents.push({
          type: mapType(item.agreement_type),
          name: item.document_name,
          path: item.file_path,
        });
      }

      // Merge signatories
      item.signatories.forEach((s) => {
        if (!group.signatories.includes(s)) {
          group.signatories.push(s);
        }
      });

      // Update latest date
      if (new Date(item.agreement_date) > new Date(group.agreementDate)) {
        group.agreementDate = item.agreement_date;
      }
    });

    return Array.from(grouped.values()).sort((a, b) =>
      b.unitNumber.localeCompare(a.unitNumber)
    );
  };

  // Fetch agreements
  const fetchAgreements = useCallback(
    async (pageNum: number, append = false) => {
      if (isFetching) return;
      setIsFetching(true);

      try {
        const response = await legalAgreementApi.list({
          page: pageNum,
          limit: ITEMS_PER_PAGE,
        });

        if (response.data.success) {
          const newData = groupAgreements(response.data.data);

          setGroupedAgreements((prev) =>
            append ? [...prev, ...newData] : newData
          );
          setHasMore(response.data.data.length === ITEMS_PER_PAGE);
        }
      } catch (err) {
        console.error("Error fetching agreements:", err);
      } finally {
        setIsFetching(false);
        setLoading(false);
      }
    },
    [isFetching]
  );

  // Initial load + URL unit search
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const unitFromUrl = params.get("unit");

    if (unitFromUrl) {
      setSearchTerm(unitFromUrl);
    }

    fetchAgreements(1, false);
  }, [location.search]);

  // Infinite scroll observer
  const lastAgreementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading || isFetching) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prev) => prev + 1);
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, isFetching, hasMore]
  );

  // Load more on page change
  useEffect(() => {
    if (page > 1) {
      fetchAgreements(page, true);
    }
  }, [page, fetchAgreements]);

  // Filter by unit_number
  const filteredAgreements = groupedAgreements.filter((agreement) =>
    agreement.unitNumber.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  const handleDownload = async (url: string, fileName: string) => {
    try {
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert("Failed to download file. Please try again.");
    }
  };

  const toggleExpand = (unit: string) => {
    setExpandedUnit(expandedUnit === unit ? null : unit);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Signed":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "Pending":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "Draft":
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
        <Navigation />
        <div className="pt-20 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 font-medium">Loading documents...</p>
          </div>
        </div>
      </div>
    );
  }

  const showNotAvailable = searchTerm && filteredAgreements.length === 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 mt-10">
      <Navigation />
      <div className="pt-20 pb-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-3 mb-3">
              <div className="p-2 bg-indigo-600/10 rounded-lg">
                <FileText className="w-6 h-6 text-indigo-600" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Legal Documents
              </h1>
            </div>
            <p className="text-gray-600 text-sm sm:text-base">
              Access and download all property-related documents by unit number
            </p>
          </div>

          {/* Search Bar */}
          <Card className="mb-8 border-0 shadow-sm bg-white/80 backdrop-blur">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search by Booking ID (e.g., KBP-07-RMYCL-1125-UB0070)"
                  className="pl-11 bg-white border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 text-base"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* No Results or Not Available */}
          {showNotAvailable && (
            <Card className="border-0 shadow-sm bg-white/80 backdrop-blur">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Legal documents are not available for this unit
                </h3>
                <p className="text-gray-600 text-sm">
                  Unit: <strong>{searchTerm}</strong>
                </p>
              </CardContent>
            </Card>
          )}

          {/* No Agreements Found (Empty Case) */}
          {!loading && groupedAgreements.length === 0 && !showNotAvailable && (
            <Card className="border-0 shadow-sm bg-white/80 backdrop-blur">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-gray-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Legal Agreements Found
                </h3>
                <p className="text-gray-600 text-sm">
                  There are currently no legal documents available to display.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Agreements List */}
          {!showNotAvailable && (
            <div className="space-y-4">
              {filteredAgreements.map((agreement, index) => (
                <Card
                  key={agreement.unitNumber}
                  ref={index === filteredAgreements.length - 2 ? lastAgreementRef : null}
                  className="border-0 shadow-sm hover:shadow-lg transition-all duration-300 bg-white/80 backdrop-blur overflow-hidden"
                >
                  <CardHeader
                    className="p-5 cursor-pointer bg-gradient-to-r from-indigo-50 to-white"
                    onClick={() => toggleExpand(agreement.unitNumber)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Building className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <h3 className="font-semibold text-gray-900 text-lg truncate">
                                {agreement.unitNumber}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {agreement.projectName}
                              </p>
                            </div>
                            <Badge className={`${getStatusColor(agreement.status)} font-medium`}>
                              {agreement.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpand(agreement.unitNumber);
                        }}
                      >
                        {expandedUnit === agreement.unitNumber ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </Button>
                    </div>
                  </CardHeader>

                  {expandedUnit === agreement.unitNumber && (
                    <CardContent className="p-6 space-y-6 border-t">
                      <div className="grid md:grid-cols-2 gap-6">
                        {/* Details */}
                        <div className="space-y-4">
                          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-indigo-600" />
                            Agreement Details
                          </h4>
                          <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600 flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                Date:
                              </span>
                              <span className="font-medium">
                                {new Date(agreement.agreementDate).toLocaleDateString("en-IN")}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                Valid Until:
                              </span>
                              <span className="font-medium">
                                {new Date(agreement.validUntil).toLocaleDateString("en-IN")}
                              </span>
                            </div>
                            <div className="flex justify-between items-start">
                              <span className="text-gray-600 flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                Signatories:
                              </span>
                              <span className="font-medium text-right max-w-[180px] text-xs">
                                {agreement.signatories.join(", ")}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Documents */}
                        <div className="space-y-4">
                          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                            <Download className="w-5 h-5 text-indigo-600" />
                            Available Documents ({agreement.documents.length})
                          </h4>
                          <div className="space-y-2">
                            {agreement.documents.map((doc) => (
                              <div
                                key={doc.path}
                                className="flex items-center justify-between p-3 rounded-lg border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100 transition-colors"
                              >
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                  <FileText className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                                  <div className="min-w-0">
                                    <p className="text-sm font-medium text-gray-800 truncate">
                                      {doc.type}
                                    </p>
                                    <p className="text-xs text-gray-600 truncate">
                                      {doc.name}
                                    </p>
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-emerald-700 hover:bg-emerald-200"
                                  onClick={() => handleDownload(doc.path, doc.name)}
                                >
                                  <Download className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}

              {/* Loading more */}
              {isFetching && page > 1 && (
                <div className="flex justify-center py-6">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Agreements;