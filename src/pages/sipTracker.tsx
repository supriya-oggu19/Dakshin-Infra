import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  Calendar, 
  IndianRupee, 
  Award, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  CreditCard,
  Download
} from "lucide-react";
import Navigation from "@/components/Navigation";

const SipTracker = () => {
  const [selectedUnit, setSelectedUnit] = useState("KBP001");

  const sipData = {
    "KBP001": {
      projectName: "Kapil Business Park - KBP-2401",
      scheme: "Single Payment Completed",
      totalAmount: 3600000,
      paidAmount: 3600000,
      remainingAmount: 0,
      progress: 100,
      status: "Completed",
      nextDue: null,
      payments: [
        { date: "2024-01-15", amount: 200000, type: "Advance", status: "Paid", receiptId: "RCP001" },
        { date: "2024-02-01", amount: 3400000, type: "Final Payment", status: "Paid", receiptId: "RCP002" }
      ],
      rebate: 0,
      penalties: 0
    },
    "KBP002": {
      projectName: "Kapil Business Park - KBP-3547",
      scheme: "100 Installments",
      totalAmount: 3600000,
      paidAmount: 72000,
      remainingAmount: 3528000,
      progress: 2,
      status: "Active",
      nextDue: "10-10-2025",
      monthlyAmount: 36000,
      installmentsPaid: 2,
      totalInstallments: 100,
      payments: Array.from({ length: 2 }, (_, i) => ({
        date: new Date(2023, 8 + Math.floor(i / 12), (i % 12) + 1).toISOString().split('T')[0],
        amount: i === 0 ? 36000 : 36000,
        type: `Installment ${i + 1}`,
        status: "Paid",
        rebate: i === 0 ? 200 : 0,
        penalty: i === 1 ? -160 : 0,
        receiptId: `RCP00${i + 3}`
      })),
      rebate: 200,
      penalties: -160
    }
  };

  const currentSip = sipData[selectedUnit];

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "Active":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Overdue":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleDownloadReceipt = (payment) => {
    // Simulate receipt download
    console.log(`Downloading receipt for ${payment.receiptId}`);
    alert(`Downloading receipt ${payment.receiptId} for ${payment.type}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Investment Tracker</h1>
            <p className="text-muted-foreground">
              Track your installment payments, rebates, and penalties
            </p>
          </div>

          {/* Unit Selector */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-3">
              {Object.keys(sipData).map((unitId) => (
                <button
                  key={unitId}
                  onClick={() => setSelectedUnit(unitId)}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    selectedUnit === unitId
                      ? "bg-primary/10 border-primary text-primary"
                      : "bg-card border-border text-card-foreground hover:bg-accent"
                  }`}
                >
                  {sipData[unitId].projectName}
                </button>
              ))}
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card className="border-0 shadow-md card-luxury">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
                    <p className="text-xl font-bold text-foreground">
                      ₹{(currentSip.totalAmount / 100000).toFixed(1)}L
                    </p>
                  </div>
                  <Target className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md card-luxury">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Paid Amount</p>
                    <p className="text-xl font-bold text-primary">
                      ₹{(currentSip.paidAmount / 100000).toFixed(1)}L
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md card-luxury">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Balance Amount</p>
                    <p className="text-xl font-bold text-foreground">
                      ₹{(currentSip.remainingAmount / 100000).toFixed(1)}L
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-secondary" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md card-luxury">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Progress</p>
                    <p className="text-xl font-bold text-primary">{currentSip.progress}%</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Progress Section */}
            <div className="lg:col-span-2">
              <Card className="border-0 shadow-md card-luxury">
                <CardHeader className="border-b bg-card">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl text-card-foreground">
                      Payment Progress
                    </CardTitle>
                    <Badge className={getStatusColor(currentSip.status)}>
                      {currentSip.status}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="p-6">
                  <div className="space-y-6">
                    {/* Progress Bar */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-foreground">
                          Overall Progress
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {currentSip.scheme.includes("Installments") && 
                            `${currentSip.installmentsPaid}/${currentSip.totalInstallments}`
                          }
                        </span>
                      </div>
                      <Progress value={currentSip.progress} className="h-4 mb-4" />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>₹{(currentSip.paidAmount / 100000).toFixed(1)}L paid</span>
                        <span>₹{(currentSip.totalAmount / 100000).toFixed(1)}L total</span>
                      </div>
                    </div>

                    {/* Next Payment */}
                    {currentSip.nextDue && (
                      <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-amber-800 mb-1">Next Payment Due</p>
                            <p className="text-sm text-amber-700">{currentSip.nextDue}</p>
                            <p className="text-lg font-bold text-amber-900 mt-2">
                              ₹{(currentSip.monthlyAmount / 1000).toFixed(0)}K
                            </p>
                          </div>
                          <Button size="sm" variant="luxury">
                            <CreditCard className="w-4 h-4 mr-2" />
                            Pay Now
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Rebate & Penalties */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-green-600 mb-1">Total Rebates</p>
                            <p className="text-xl font-bold text-green-800">
                              +₹{Math.abs(currentSip.rebate).toLocaleString()}
                            </p>
                          </div>
                          <Award className="w-6 h-6 text-green-500" />
                        </div>
                      </div>

                      <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-red-600 mb-1">Total Penalties</p>
                            <p className="text-xl font-bold text-red-800">
                              ₹{Math.abs(currentSip.penalties).toLocaleString()}
                            </p>
                          </div>
                          <AlertTriangle className="w-6 h-6 text-red-500" />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar Info */}
            <div className="space-y-6">
              <Card className="border-0 shadow-md card-luxury">
                <CardHeader className="border-b bg-card">
                  <CardTitle className="text-lg text-foreground">Payment Rules</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Award className="w-5 h-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="font-medium text-foreground text-sm">Early Payment Rebates</p>
                        <p className="text-xs text-muted-foreground">+1% rebate for advance payments</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                      <div>
                        <p className="font-medium text-foreground text-sm">Late Payment Penalty</p>
                        <p className="text-xs text-muted-foreground">-1% penalty for delayed payments</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md card-luxury">
                <CardHeader className="border-b bg-card">
                  <CardTitle className="text-lg text-foreground">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Scheme</span>
                      <span className="text-sm font-medium text-foreground">
                        {currentSip.scheme}
                      </span>
                    </div>
                    {currentSip.monthlyAmount && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Monthly Amount</span>
                        <span className="text-sm font-medium text-foreground">
                          ₹{(currentSip.monthlyAmount / 1000).toFixed(0)}K
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Net Adjustment</span>
                      <span className={`text-sm font-medium ${
                        (currentSip.rebate + currentSip.penalties) >= 0 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        {(currentSip.rebate + currentSip.penalties) >= 0 ? '+' : ''}
                        ₹{(currentSip.rebate + currentSip.penalties).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Payment History */}
          <div className="mt-8">
            <Card className="border-0 shadow-md card-luxury">
              <CardHeader className="border-b bg-card">
                <CardTitle className="text-xl text-foreground">Payment History</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {currentSip.payments.slice().reverse().map((payment, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-4 bg-card/50 rounded-lg border border-border"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-3 h-3 rounded-full ${
                          payment.status === "Paid" ? "bg-green-500" : "bg-muted"
                        }`} />
                        <div>
                          <p className="font-medium text-foreground">{payment.type}</p>
                          <p className="text-sm text-muted-foreground">{payment.date}</p>
                          <p className="text-xs text-muted-foreground">Receipt: {payment.receiptId}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="font-medium text-foreground">
                            ₹{payment.amount.toLocaleString()}
                          </p>
                        </div>
                        {payment.status === "Paid" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownloadReceipt(payment)}
                            className="text-xs"
                          >
                            <Download className="w-3 h-3 mr-1" />
                            Receipt
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SipTracker;