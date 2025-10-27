// Agreements.tsx
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
  AlertCircle,
  XCircle,
  Users,
  FileSignature,
  HelpCircle,
} from "lucide-react";
import Navigation from "@/components/Navigation";
import { useState, useEffect } from "react";
import { Agreement } from "@/api/models/agreement.model";
import { agreementService } from "@/api/agreementApi";

const Agreements = () => {
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const loadAgreements = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await agreementService.fetchAgreements();
      setAgreements(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error fetching agreements:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAgreements();
  }, []);

  const getStatusConfig = (status: string) => {
    const configs = {
      Signed: {
        color: "border-emerald-200 bg-emerald-50 text-emerald-700",
        icon: CheckCircle,
        bgColor: "bg-emerald-500",
      },
      Active: {
        color: "border-blue-200 bg-blue-50 text-blue-700",
        icon: Clock,
        bgColor: "bg-blue-500",
      },
      Pending: {
        color: "border-amber-200 bg-amber-50 text-amber-700",
        icon: AlertCircle,
        bgColor: "bg-amber-500",
      },
      Draft: {
        color: "border-slate-200 bg-slate-50 text-slate-700",
        icon: FileText,
        bgColor: "bg-slate-500",
      },
      Expired: {
        color: "border-rose-200 bg-rose-50 text-rose-700",
        icon: XCircle,
        bgColor: "bg-rose-500",
      },
    };
    return (
      configs[status] || {
        color: "border-slate-200 bg-slate-50 text-slate-700",
        icon: FileText,
        bgColor: "bg-slate-500",
      }
    );
  };

  const handleDownloadDocument = async (
    docType: string,
    fileName: string,
    filePath: string,
    available: boolean
  ) => {
    if (!available) {
      alert(
        "This document is not yet available. Please contact support for more information."
      );
      return;
    }

    try {
      await agreementService.downloadDocument(filePath, fileName);
      console.log(`Downloading ${docType}: ${fileName}`);
    } catch (err) {
      console.error("Error downloading document:", err);
      alert(`Failed to download ${docType}. Please try again.`);
    }
  };

  const filteredAgreements = agreements.filter((agreement) => {
    const matchesSearch =
      agreement.unitNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agreement.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agreement.agreementType.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = !filterType || agreement.agreementType === filterType;
    const matchesStatus = !filterStatus || agreement.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const uniqueAgreementTypes = Array.from(
    new Set(agreements.map((a) => a.agreementType))
  );

  const uniqueStatuses = Array.from(
    new Set(agreements.map((a) => a.status))
  );

  const stats = {
    total: agreements.length,
    active: agreements.filter((a) => a.status === "Active").length,
    completed: agreements.filter((a) => a.status === "Signed").length,
    pending: agreements.filter((a) => a.status === "Pending").length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
        <Navigation />
        <div className="pt-20 pb-12 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-slate-600 font-medium">Loading agreements...</p>
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
        <div className="pt-20 pb-12 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-center items-center h-64">
              <div className="text-center max-w-md">
                <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <XCircle className="w-8 h-8 text-rose-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Unable to Load Agreements</h3>
                <p className="text-slate-600 mb-4">{error}</p>
                <Button 
                  onClick={loadAgreements} 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6"
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

      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 text-center sm:text-left">
            <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-2xl px-4 py-2.5 border border-slate-200/60 shadow-sm mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <FileSignature className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-medium text-slate-700">Legal Agreements</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-3">
              Your Documents
            </h1>
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl">
              Manage all your property-related legal agreements in one place. Download, preview, and track your documents.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
            <Card className="border border-slate-200/60 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-1">Total Agreements</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {stats.total}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-slate-200/60 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-1">Active</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {stats.active}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-slate-200/60 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-1">Signed</p>
                    <p className="text-2xl font-bold text-emerald-600">
                      {stats.completed}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-slate-200/60 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-1">Pending</p>
                    <p className="text-2xl font-bold text-amber-600">
                      {stats.pending}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border border-slate-200/60 bg-white/80 backdrop-blur-sm shadow-sm mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4 items-end">
                <div className="flex-1 w-full">
                  <label className="text-sm font-medium text-slate-700 mb-2 block">
                    Search Agreements
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      placeholder="Search by unit number, project name, or agreement type..."
                      className="pl-10 border-slate-300 focus:border-blue-500 focus:ring-blue-500 h-11"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="w-full lg:w-48">
                  <label className="text-sm font-medium text-slate-700 mb-2 block">
                    Agreement Type
                  </label>
                  <select
                    className="flex h-11 w-full items-center justify-between rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                  >
                    <option value="">All Types</option>
                    {uniqueAgreementTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="w-full lg:w-48">
                  <label className="text-sm font-medium text-slate-700 mb-2 block">
                    Status
                  </label>
                  <select
                    className="flex h-11 w-full items-center justify-between rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="">All Statuses</option>
                    {uniqueStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>

                <Button
                  variant="outline"
                  className="flex items-center justify-center border-slate-300 hover:bg-slate-100 h-11 px-6"
                  onClick={() => {
                    setSearchTerm("");
                    setFilterType("");
                    setFilterStatus("");
                  }}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Clear All
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-900">
              Agreements ({filteredAgreements.length})
            </h2>
            <div className="text-sm text-slate-500">
              Showing {filteredAgreements.length} of {agreements.length} agreements
            </div>
          </div>

          <div className="space-y-6">
            {filteredAgreements.length === 0 ? (
              <Card className="border border-slate-200/60 bg-white/80 backdrop-blur-sm shadow-sm">
                <CardContent className="p-12 text-center">
                  <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    No agreements found
                  </h3>
                  <p className="text-slate-600 mb-6 max-w-sm mx-auto">
                    {agreements.length === 0
                      ? "You don't have any legal agreements yet. They will appear here once available."
                      : "Try adjusting your search criteria or filters to find what you're looking for."}
                  </p>
                  <Button 
                    onClick={() => { setSearchTerm(""); setFilterType(""); setFilterStatus(""); }}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            ) : (
              filteredAgreements.map((agreement) => {
                const statusConfig = getStatusConfig(agreement.status);
                const StatusIcon = statusConfig.icon;

                return (
                  <Card
                    key={agreement.id}
                    className="border border-slate-200/60 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-lg transition-all duration-300 group"
                  >
                    <CardHeader className="border-b border-slate-100 p-6">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                            <FileText className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
                              <h3 className="text-lg font-semibold text-slate-900 truncate">
                                {agreement.projectName}
                              </h3>
                              <div className="flex items-center gap-3">
                                <Badge variant="secondary" className="bg-slate-100 text-slate-700 border-0">
                                  {agreement.agreementType}
                                </Badge>
                                <Badge className={`${statusConfig.color} border flex-shrink-0`}>
                                  <div className="flex items-center gap-1.5">
                                    <StatusIcon className="w-3.5 h-3.5" />
                                    <span className="text-xs font-medium">{agreement.status}</span>
                                  </div>
                                </Badge>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                                  <Users className="w-4 h-4 text-blue-600" />
                                </div>
                                <div>
                                  <div className="text-xs text-slate-500">Unit Number</div>
                                  <div className="font-semibold text-slate-900">{agreement.unitNumber}</div>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center">
                                  <Calendar className="w-4 h-4 text-slate-600" />
                                </div>
                                <div>
                                  <div className="text-xs text-slate-500">Date Created</div>
                                  <div className="font-medium text-slate-900">
                                    {new Date(agreement.date).toLocaleDateString()}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
                                  <CheckCircle 
                                    className="w-4 h-4 text-emerald-600" />
                                </div>
                                <div>
                                  <div className="text-xs text-slate-500">Valid Until</div>
                                  <div className="font-medium text-slate-900">
                                    {new Date(agreement.validUntil).toLocaleDateString()}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
                                  <FileText className="w-4 h-4 text-amber-600" />
                                </div>
                                <div>
                                  <div className="text-xs text-slate-500">File Size</div>
                                  <div className="font-medium text-slate-900">{agreement.fileSize}</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="p-6">
                      <div className="grid lg:grid-cols-2 gap-8 mb-6">
                        <div>
                          <h4 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            Agreement Details
                          </h4>
                          <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                            {agreement.description}
                          </p>
                          <div className="space-y-3">
                            <div className="flex justify-between text-sm py-2 border-b border-slate-100">
                              <span className="text-slate-600">Signatories:</span>
                              <span className="text-slate-900 font-medium text-right max-w-xs">
                                {agreement.signatories.join(", ")}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                            Available Documents
                          </h4>
                          <div className="space-y-3">
                            {Object.entries(agreement.documents).map(([docKey, doc]) => (
                              <div
                                key={docKey}
                                className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-200 ${
                                  doc.available
                                    ? "border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50"
                                    : "border-slate-200 bg-slate-50/50 hover:bg-slate-50"
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                    doc.available ? "bg-emerald-100" : "bg-slate-100"
                                  }`}>
                                    <FileText className={`w-5 h-5 ${
                                      doc.available ? "text-emerald-600" : "text-slate-400"
                                    }`} />
                                  </div>
                                  <div>
                                    <div className="text-sm font-medium text-slate-900 capitalize">
                                      {docKey.replace(/([A-Z])/g, " $1").trim()}
                                    </div>
                                    <div className="text-xs text-slate-500">
                                      {doc.available ? "Ready to download" : "Processing..."}
                                    </div>
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  className={`${
                                    doc.available
                                      ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                                      : "bg-slate-200 text-slate-500 cursor-not-allowed"
                                  } flex-shrink-0 text-xs h-9 px-4`}
                                  onClick={() =>
                                    handleDownloadDocument(
                                      docKey.replace(/([A-Z])/g, " $1").trim(),
                                      doc.fileName,
                                      doc.filePath,
                                      doc.available
                                    )
                                  }
                                  disabled={!doc.available}
                                >
                                  <Download className="w-3.5 h-3.5 mr-1.5" />
                                  {doc.available ? "Download" : "Pending"}
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
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

export default Agreements;