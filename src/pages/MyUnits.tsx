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
  Eye
} from "lucide-react";
import Navigation from "@/components/Navigation";

const MyUnits = () => {
  const myProperties = [
    {
      id: "RC-001",
      projectName: "Kapil Business Park",
      unitNumber: "KBP-2401",
      location: "Shamshabad, near Hyderabad International Airport",
      purchaseDate: "15-01-2025",
      scheme: "Single Payment - 61 Month",
      investment: "₹36,00,000",
      advance: "₹2,00,000",
      area: "200 sqft",
      rentalStart: "December 2029",
      monthlyRental: "₹45,000",
      status: "Active",
      rentalProgress: 0,
      totalRentalReceived: "₹0",
      nextRentalDate: "01-12-2029"
    },
    {
      id: "KBP-002",
      projectName: "Kapil Business Park",
      unitNumber: "KBP-3547",
      location: "Shamshabad, near Hyderabad International Airport",
      purchaseDate: "20-08-2025",
      scheme: "100 Installments",
      investment: "₹36,00,000",
      advance: "₹36,000",
      area: "155 sqft",
      rentalStart: "March 2033",
      monthlyRental: "₹34,875",
      status: "Payment Ongoing",
      rentalProgress: 2,
      installmentsPaid: "2/100",
      nextInstallmentDate: "10-10-2025"
    },
  
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800 border-green-200";
      case "Payment Ongoing":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-16 sm:pt-20 pb-8 sm:pb-12">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-8">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">My Units</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Manage and track your property investments and rental income
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
            <Card className="border-0 shadow-md">
              <CardContent className="p-3 sm:p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1">Total Units</p>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">2</p>
                  </div>
                  <Building2 className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardContent className="p-3 sm:p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1">Total Investment</p>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">₹72L</p>
                  </div>
                  <IndianRupee className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardContent className="p-3 sm:p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1">Monthly Rental</p>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">₹79.8K</p>
                  </div>
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardContent className="p-3 sm:p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1">Total Rent Received</p>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">₹0</p>
                  </div>
                  <Calendar className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Properties List */}
          <div className="space-y-4 sm:space-y-6">
            {myProperties.map((property) => (
              <Card key={property.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="border-b bg-card p-4 sm:p-6">
                  <div className="flex flex-col space-y-3 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
                    <div className="min-w-0">
                      <div className="mb-2">
                        <div className="text-sm text-muted-foreground mb-1">Project Name</div>
                        <div className="text-lg font-semibold text-card-foreground">{property.projectName}</div>
                      </div>
                      <div className="mb-3">
                        <div className="text-sm text-muted-foreground mb-1">Unit Number</div>
                        <div className="text-xl font-bold text-primary">{property.unitNumber}</div>
                      </div>
                      <div className="flex items-start text-muted-foreground mb-2">
                        <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-sm break-words">{property.location}</span>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                      <Badge className={getStatusColor(property.status)}>
                        {property.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-4 sm:p-6">
                  <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-4 sm:mb-6 h-auto">
                      <TabsTrigger value="overview" className="text-xs sm:text-sm py-2">Overview</TabsTrigger>
                      <TabsTrigger value="payments" className="text-xs sm:text-sm py-2">Payments</TabsTrigger>
                      <TabsTrigger value="rental" className="text-xs sm:text-sm py-2">Rental</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                        <div className="space-y-1">
                          <p className="text-xs sm:text-sm text-muted-foreground">Purchase Date</p>
                          <p className="text-sm sm:text-base text-foreground font-medium">{property.purchaseDate}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs sm:text-sm text-muted-foreground">Investment Scheme</p>
                          <p className="text-sm sm:text-base text-foreground font-medium break-words">{property.scheme}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs sm:text-sm text-muted-foreground">Total Investment</p>
                          <p className="text-sm sm:text-base text-foreground font-medium">{property.investment}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs sm:text-sm text-muted-foreground">Unit Area</p>
                          <p className="text-sm sm:text-base text-foreground font-medium">{property.area}</p>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="payments">
                      {property.status === "Active" ? (
                        <div className="space-y-4">
                          <div className="bg-green-50 p-3 sm:p-4 rounded-lg border border-green-200">
                            <p className="text-green-800 font-medium mb-2 text-sm sm:text-base">✓ Payment Completed</p>
                            <p className="text-green-700 text-xs sm:text-sm">All payments have been successfully completed for this unit.</p>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                            <div className="space-y-1">
                              <p className="text-xs sm:text-sm text-gray-600">Total Paid</p>
                              <p className="text-sm sm:text-base font-medium text-gray-900">{property.investment}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs sm:text-sm text-gray-600">Advance Paid</p>
                              <p className="text-sm sm:text-base font-medium text-gray-900">{property.advance}</p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-xs sm:text-sm font-medium text-gray-700">Payment Progress</span>
                              <span className="text-xs sm:text-sm text-gray-600">{property.installmentsPaid}</span>
                            </div>
                            <Progress value={property.rentalProgress} className="h-2 sm:h-3" />
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                            <div className="space-y-1">
                              <p className="text-xs sm:text-sm text-gray-600">Next Payment Due</p>
                              <p className="text-sm sm:text-base font-medium text-gray-900">{property.nextInstallmentDate}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs sm:text-sm text-gray-600">Monthly Amount</p>
                              <p className="text-sm sm:text-base font-medium text-gray-900">{property.advance}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="rental">
                      <div className="space-y-4">
                        {property.status === "Active" ? (
                          <>
                            <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border border-blue-200">
                              <p className="text-blue-800 font-medium mb-2 text-sm sm:text-base">💰 Rental Income Active</p>
                              <p className="text-blue-700 text-xs sm:text-sm">Monthly rental income: {property.monthlyRental}</p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                              <div className="space-y-1">
                                <p className="text-xs sm:text-sm text-gray-600">Monthly Rental</p>
                                <p className="text-sm sm:text-base font-medium text-gray-900">{property.monthlyRental}</p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-xs sm:text-sm text-gray-600">Total Received</p>
                                <p className="text-sm sm:text-base font-medium text-gray-900">{property.totalRentalReceived}</p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-xs sm:text-sm text-gray-600">Next Payment</p>
                                <p className="text-sm sm:text-base font-medium text-gray-900">{property.nextRentalDate}</p>
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="bg-orange-50 p-3 sm:p-4 rounded-lg border border-orange-200">
                            <p className="text-orange-800 font-medium mb-2 text-sm sm:text-base">⏳ Rental Pending</p>
                            <p className="text-orange-700 text-xs sm:text-sm">
                              Rental income will start from {property.rentalStart} after payment completion.
                            </p>
                            <p className="text-orange-700 text-xs sm:text-sm mt-2">
                              Expected monthly rental: {property.monthlyRental}
                            </p>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t">
                    <Button variant="outline" size="sm" className="w-full sm:w-auto">
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                    <Button variant="outline" size="sm" className="w-full sm:w-auto">
                      <Download className="w-4 h-4 mr-2" />
                      Download Agreement
                    </Button>
                    {property.status !== "Active" && (
                      <Button size="sm" className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600">
                        <Clock className="w-4 h-4 mr-2" />
                        Make Payment
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyUnits;