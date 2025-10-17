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

const API_BASE_URL = "http://127.0.0.1:8000";

const Login = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtpField, setShowOtpField] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  const { login, isAuthenticated } = useAuth(); // Assume isAuthenticated is provided by useAuth
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect authenticated users to /projects on mount
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/projects");
    }
  }, [isAuthenticated, navigate]);

  // Validate phone number format (example: +91 followed by 10 digits)
  const validatePhoneNumber = (phone: string) => {
    const phoneRegex = /^\+\d{1,3}\d{10}$/;
    return phoneRegex.test(phone);
  };

  // Validate OTP format (6 digits)
  const validateOtp = (otp: string) => {
    const otpRegex = /^\d{6}$/;
    return otpRegex.test(otp);
  };

  const handleSendOtp = async () => {
    if (!phoneNumber.trim()) {
      setError("Please enter your phone number");
      toast({
        title: "Error",
        description: "Please enter your phone number",
        variant: "destructive",
      });
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      setError("Please enter a valid phone number (e.g., +918688475255)");
      toast({
        title: "Error",
        description: "Please enter a valid phone number",
        variant: "destructive",
      });
      return;
    }

    setError("");
    setSuccess("");
    setOtpLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/user/send_otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone_no: phoneNumber,
        }),
      });

      const data = await response.json();
      console.log("Send OTP Response:", response.status, data); // Debug log

      if (response.ok && data.status === "success") {
        setSuccess(data.message || "OTP sent successfully");
        setShowOtpField(true);
        setOtp(""); // Clear OTP field on resend
        toast({
          title: "Success",
          description: data.message || "OTP sent successfully",
        });
      } else {
        setError(data.message || `Failed to send OTP (Status: ${response.status})`);
        toast({
          title: "Error",
          description: data.message || `Failed to send OTP (Status: ${response.status})`,
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Send OTP error:", err.message, err.stack);
      const errorMsg = "Failed to send OTP. Please check your connection.";
      setError(errorMsg);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setOtpLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent, retryCount = 0) => {
    e.preventDefault();

    if (!validateOtp(otp)) {
      setError("Please enter a valid 6-digit OTP");
      toast({
        title: "Error",
        description: "Please enter a valid 6-digit OTP",
        variant: "destructive",
      });
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/user/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone_no: phoneNumber,
          otp: otp,
        }),
      });

      const data = await response.json();
      console.log("Login Response:", response.status, data); // Debug log

      if (response.ok && data.token) {
        login(data.token);
        setSuccess(data.message || "Login successful");
        toast({
          title: "Success",
          description: data.message || "Login successful",
        });
        setTimeout(() => {
          navigate("/projects");
        }, 500);
      } else {
        // Retry only for server errors (500+) or network issues
        if (retryCount < 1 && (!response || response.status >= 500)) {
          console.warn("Retrying OTP submission...");
          setTimeout(() => handleLogin(e, retryCount + 1), 1000);
          return;
        }
        const errorMsg = data.message || `Login failed with status ${response.status}. Try resending the OTP.`;
        setError(errorMsg);
        toast({
          title: "Error",
          description: errorMsg,
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Login error:", err.message, err.stack);
      if (retryCount < 1) {
        console.warn("Retrying OTP submission...");
        setTimeout(() => handleLogin(e, retryCount + 1), 1000);
        return;
      }
      const errorMsg = "Login failed. Please check your connection or try again.";
      setError(errorMsg);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
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
            <form onSubmit={(e) => handleLogin(e)} className="space-y-4">
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-700">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-green-200 bg-green-50">
                  <AlertDescription className="text-green-700">
                    {success}
                  </AlertDescription>
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

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSendOtp}
                    disabled={otpLoading}
                    className="w-full"
                  >
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