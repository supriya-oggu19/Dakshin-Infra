import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, LogIn, Phone } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { userApi } from "@/api/userApi";

const Login = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtpField, setShowOtpField] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/projects");
    }
  }, [isAuthenticated, navigate]);

  const validatePhoneNumber = (phone: string) => /^\+\d{1,3}\d{10}$/.test(phone);
  const validateOtp = (otp: string) => /^\d{6}$/.test(otp);

  const handleSendOtp = async () => {
    if (!phoneNumber.trim()) {
      toast({ title: "Error", description: "Please enter your phone number", variant: "destructive" });
      return;
    }
    if (!validatePhoneNumber(phoneNumber)) {
      toast({ title: "Error", description: "Invalid phone number format", variant: "destructive" });
      return;
    }

    setError("");
    setSuccess("");
    setOtpLoading(true);

    try {
      const response = await userApi.sendOtp({ phone_no: phoneNumber });
      const data = response.data;

      if (data.status === "success") {
        setSuccess(data.message || "OTP sent successfully");
        setShowOtpField(true);
        setOtp("");
        toast({ title: "Success", description: data.message || "OTP sent successfully" });
      } else {
        setError(data.message || "Failed to send OTP");
        toast({ title: "Error", description: data.message || "Failed to send OTP", variant: "destructive" });
      }
    } catch (err) {
      setError("Failed to send OTP. Please check your connection.");
      toast({ title: "Error", description: "Failed to send OTP. Please check your connection.", variant: "destructive" });
    } finally {
      setOtpLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateOtp(otp)) {
      toast({ title: "Error", description: "Please enter a valid 6-digit OTP", variant: "destructive" });
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await userApi.login({ phone_no: phoneNumber, otp });
      const data = response.data;

      if (data.token) {
        login(data.token);
        toast({ title: "Success", description: data.message || "Login successful" });
        setTimeout(() => navigate("/projects"), 500);
      } else {
        const errMsg = data.message || "Login failed. Try resending the OTP.";
        setError(errMsg);
        toast({ title: "Error", description: errMsg, variant: "destructive" });
      }
    } catch (err) {
      setError("Login failed. Please check your connection.");
      toast({ title: "Error", description: "Login failed. Please check your connection.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <Link 
            to="/" 
            className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>

        <Card className="shadow-lg border-0 card-luxury">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold text-foreground">
              Investor Portal Login
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Access your investment dashboard and manage your properties
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-700">{error}</AlertDescription>
                </Alert>
              )}
              {success && (
                <Alert className="border-green-200 bg-green-50">
                  <AlertDescription className="text-green-700">{success}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="text-foreground">
                  Phone Number
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="phoneNumber"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+918688475255"
                    required
                    disabled={showOtpField}
                    className="flex-1 bg-background border-border focus:border-primary focus:ring-primary"
                  />
                  {!showOtpField && (
                    <Button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={otpLoading || !phoneNumber.trim()}
                      className="whitespace-nowrap"
                    >
                      {otpLoading ? (
                        <div className="flex items-center">
                          <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                          Sending...
                        </div>
                      ) : (
                        <>
                          <Phone className="w-4 h-4 mr-2" />
                          Send OTP
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>

              {showOtpField && (
                  <div className="space-y-2">
                  <Label htmlFor="otp" className="text-foreground">
                    Enter OTP
                  </Label>
                    <Input
                      id="otp"
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="Enter 6-digit OTP"
                      required
                      maxLength={6}
                    className="bg-background border-border focus:border-primary focus:ring-primary"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setShowOtpField(false);
                        setOtp("");
                        setSuccess("");
                      }}
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      Change phone number
                    </button>
                  </div>
              )}

              {showOtpField && (
                <>
                  <Button 
                    type="submit" 
                    variant="luxury"
                    className="w-full font-medium py-2.5"
                    disabled={loading || !otp.trim()}
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                        Signing in...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <LogIn className="w-4 h-4 mr-2" />
                        Sign In
                      </div>
                    )}
                  </Button>

                  <Button type="button" variant="outline" onClick={handleSendOtp} disabled={otpLoading} className="w-full">
                    Resend OTP
                  </Button>
                </>
              )}
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
              New user?{" "}
                <Link
                  to="/register"
                  className="text-primary hover:underline font-medium"
                >
                Register here
              </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
