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
  Clock
} from "lucide-react";
import Navigation from "@/components/Navigation";

const Agreements = () => {
  const agreements = [
    {
      id: "KBP001",
      projectName: "Kapil Business Park",
      unitNumber: "KBP-2401",
      agreementType: "Sale Agreement",
      date: "2025-01-15",
      status: "Signed",
      fileSize: "2.4 MB",
      lastModified: "2025-01-15",
      description: "Complete sale agreement for unit KBP-2401 including payment terms and possession details.",
      signatories: ["Sasank", "Kapil Business Park Pvt Ltd"],
      validUntil: "2029-01-15",
      documents: {
        mou: { available: true, fileName: "MOU_KBP2401.pdf" },
        agreementOfSale: { available: true, fileName: "AOS_KBP2401.pdf" },
        saleDeed: { available: true, fileName: "SaleDeed_KBP2401.pdf" },
        rentalAgreement: { available: true, fileName: "RentalAgreement_KBP2401.pdf" }
      }
    },
    {
      id: "KT002",
      projectName: "Kapil Business Park",
      unitNumber: "KBP-3547",
      agreementType: "Installment Agreement",
      date: "2025-08-20",
      status: "Active",
      fileSize: "1.8 MB",
      lastModified: "2025-09-10",
      description: "100-installment payment agreement with bonus/penalty clauses and rental timeline.",
      signatories: ["Ram", "Kapil Towers"],
      validUntil: "2031-08-20",
      documents: {
        mou: { available: true, fileName: "MOU_KBP3547.pdf" },
        agreementOfSale: { available: true, fileName: "AOS_KBP3547.pdf" },
        saleDeed: { available: false, fileName: "SaleDeed_KBP3547.pdf" },
        rentalAgreement: { available: false, fileName: "RentalAgreement_KBP3547.pdf" }
      }
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "Signed":
        return "bg-green-100 text-green-800 border-green-200";
      case "Active":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Pending":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Signed":
        return <CheckCircle className="w-4 h-4" />;
      case "Active":
        return <Clock className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const handleDownloadDocument = (docType, fileName, available) => {
    if (!available) {
      alert("This document is not yet available. Please contact support for more information.");
      return;
    }
    console.log(`Downloading ${docType}: ${fileName}`);
    alert(`Downloading ${docType}: ${fileName}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Legal Agreements</h1>
            <p className="text-muted-foreground">
              View, download, and manage all your property-related legal documents
            </p>
          </div>

          {/* Summary Stats */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card className="border-0 shadow-md card-luxury">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Agreements</p>
                    <p className="text-2xl font-bold text-foreground">2</p>
                  </div>
                  <FileText className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md card-luxury">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Active</p>
                    <p className="text-2xl font-bold text-primary">1</p>
                  </div>
                  <Clock className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md card-luxury">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Completed</p>
                    <p className="text-2xl font-bold text-primary">1</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md card-luxury">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Documents</p>
                    <p className="text-2xl font-bold text-primary">6</p>
                  </div>
                  <Download className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="border-0 shadow-md card-luxury mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search agreements..."
                    className="pl-10 bg-background border-border"
                  />
                </div>
                <Button variant="outline" className="flex items-center">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter by Type
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Agreements List */}
          <div className="space-y-4">
            {agreements.map((agreement) => (
              <Card key={agreement.id} className="border-0 shadow-md hover:shadow-lg transition-shadow card-luxury">
                <CardHeader className="border-b bg-card">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-background/50 rounded-lg flex items-center justify-center">
                        <FileText className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="mb-1">
                          <div className="text-sm text-muted-foreground">Project</div>
                          <div className="text-lg font-semibold text-foreground">{agreement.projectName}</div>
                        </div>
                        <div className="mb-2">
                          <div className="text-sm text-muted-foreground">Unit</div>
                          <div className="text-lg font-bold text-primary">{agreement.unitNumber}</div>
                        </div>
                        <p className="text-muted-foreground text-sm mb-2">{agreement.agreementType}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{agreement.fileSize}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-4 md:mt-0">
                      <Badge className={getStatusColor(agreement.status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(agreement.status)}
                          {agreement.status}
                        </div>
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-6">
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h4 className="font-medium text-foreground mb-2">Agreement Details</h4>
                      <p className="text-sm text-muted-foreground mb-4">{agreement.description}</p>
                    
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground mb-2">Available Documents</h4>
                      <div className="grid grid-cols-1 gap-2">
                        <div className={`flex items-center justify-between p-2 rounded border ${
                          agreement.documents.mou.available ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
                        }`}>
                          <span className="text-sm">MOU</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            className={agreement.documents.mou.available ? 'text-green-700' : 'text-gray-500'}
                            onClick={() => handleDownloadDocument('MOU', agreement.documents.mou.fileName, agreement.documents.mou.available)}
                          >
                            <Download className="w-3 h-3 mr-1" />
                            Download
                          </Button>
                        </div>
                        <div className={`flex items-center justify-between p-2 rounded border ${
                          agreement.documents.agreementOfSale.available ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
                        }`}>
                          <span className="text-sm">Agreement of Sale</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            className={agreement.documents.agreementOfSale.available ? 'text-green-700' : 'text-gray-500'}
                            onClick={() => handleDownloadDocument('Agreement of Sale', agreement.documents.agreementOfSale.fileName, agreement.documents.agreementOfSale.available)}
                          >
                            <Download className="w-3 h-3 mr-1" />
                            Download
                          </Button>
                        </div>
                        <div className={`flex items-center justify-between p-2 rounded border ${
                          agreement.documents.saleDeed.available ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
                        }`}>
                          <span className="text-sm">Sale Deed</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            className={agreement.documents.saleDeed.available ? 'text-green-700' : 'text-gray-500'}
                            onClick={() => handleDownloadDocument('Sale Deed', agreement.documents.saleDeed.fileName, agreement.documents.saleDeed.available)}
                          >
                            <Download className="w-3 h-3 mr-1" />
                            {agreement.documents.saleDeed.available ? 'Download' : 'Pending'}
                          </Button>
                        </div>
                        <div className={`flex items-center justify-between p-2 rounded border ${
                          agreement.documents.rentalAgreement.available ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
                        }`}>
                          <span className="text-sm">Rental Agreement</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            className={agreement.documents.rentalAgreement.available ? 'text-green-700' : 'text-gray-500'}
                            onClick={() => handleDownloadDocument('Rental Agreement', agreement.documents.rentalAgreement.fileName, agreement.documents.rentalAgreement.available)}
                          >
                            <Download className="w-3 h-3 mr-1" />
                            {agreement.documents.rentalAgreement.available ? 'Download' : 'Pending'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3 pt-4 border-t border-border">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      Preview Documents
                    </Button>
                    <Button variant="outline" size="sm">
                      <Calendar className="w-4 h-4 mr-2" />
                      View Timeline
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Help Section */}
          <Card className="border-0 shadow-md mt-8 card-luxury">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground mb-2">Need Help with Agreements?</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Our legal team is available to help you understand your agreements, request modifications, 
                    or answer any questions about your property investments.
                  </p>
                  <Button size="sm" variant="outline-luxury">
                    Contact Legal Support
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Agreements;