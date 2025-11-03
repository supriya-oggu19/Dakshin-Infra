import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, LogIn, Phone, ChevronDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { userApi } from "@/api/userApi";

// Country code data
const COUNTRY_CODES = [
  { code: "IN", name: "India", dialCode: "+91" },
  { code: "US", name: "United States", dialCode: "+1" },
  { code: "GB", name: "United Kingdom", dialCode: "+44" },
  { code: "AE", name: "UAE", dialCode: "+971" },
  { code: "SA", name: "Saudi Arabia", dialCode: "+966" },
  { code: "QA", name: "Qatar", dialCode: "+974" },
  { code: "KW", name: "Kuwait", dialCode: "+965" },
  { code: "BH", name: "Bahrain", dialCode: "+973" },
  { code: "OM", name: "Oman", dialCode: "+968" },
  { code: "SG", name: "Singapore", dialCode: "+65" },
  { code: "MY", name: "Malaysia", dialCode: "+60" },
  { code: "CA", name: "Canada", dialCode: "+1" },
  { code: "AU", name: "Australia", dialCode: "+61" },
];

const Login = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtpField, setShowOtpField] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0]); // Default to India
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/projects");
    }
  }, [isAuthenticated, navigate]);

  // Validate phone number (only digits, length varies by country)
  const validatePhoneNumber = (phone: string) => {
    const digitsOnly = phone.replace(/\D/g, '');
    // Basic validation - at least 6 digits for phone numbers
    return digitsOnly.length >= 6 && digitsOnly.length <= 15;
  };

  const validateOtp = (otp: string) => /^\d{6}$/.test(otp);

  // Get full phone number with country code
  const getFullPhoneNumber = () => {
    const digitsOnly = phoneNumber.replace(/\D/g, '');
    return selectedCountry.dialCode + digitsOnly;
  };

  const handleSendOtp = async () => {
    const digitsOnly = phoneNumber.replace(/\D/g, '');
    
    if (!digitsOnly) {
      toast({ title: "Error", description: "Please enter your phone number", variant: "destructive" });
      return;
    }
    
    if (!validatePhoneNumber(phoneNumber)) {
      toast({ title: "Error", description: "Please enter a valid phone number", variant: "destructive" });
      return;
    }

    setError("");
    setSuccess("");
    setOtpLoading(true);

    try {
      const fullPhoneNumber = getFullPhoneNumber();
      const response = await userApi.sendOtp({ phone_no: fullPhoneNumber });
      const data = response.data;

      if (data.status === "success") {
        setSuccess(data.message || "OTP sent successfully");
        setShowOtpField(true);
        setOtp("");
        toast({ title: "Success", description: data.message || "OTP sent successfully" });
      } else {
        const errorMsg = data.message || "Failed to send OTP";
        setError(errorMsg);
        toast({ title: "Error", description: errorMsg, variant: "destructive" });
      }
    } catch (err: any) {
      // Properly extract error message from backend
      const backendMessage = err.response?.data?.message || "Failed to send OTP. Please check your connection.";
      setError(backendMessage);
      toast({ title: "Error", description: backendMessage, variant: "destructive" });
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
      const fullPhoneNumber = getFullPhoneNumber();
      const response = await userApi.login({ phone_no: fullPhoneNumber, otp });
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
    } catch (err: any) {
      // Properly extract error message from backend
      const backendMessage = err.response?.data?.message || "Login failed. Please check your connection.";
      
      // Handle specific backend error messages
      if (backendMessage === "User not found. Please register") {
        setError("User not found. Please register first.");
        toast({ 
          title: "User Not Found", 
          description: "This phone number is not registered. Please create an account first.", 
          variant: "destructive" 
        });
      } else if (backendMessage === "Invalid or expired OTP") {
        setError("Invalid or expired OTP. Please request a new OTP.");
        toast({ 
          title: "Invalid OTP", 
          description: "The OTP you entered is invalid or has expired. Please request a new one.", 
          variant: "destructive" 
        });
      } else {
        setError(backendMessage);
        toast({ title: "Error", description: backendMessage, variant: "destructive" });
      }
    } finally {
      setLoading(false);
    }
  };

  // Format phone number with spaces for better readability
  const formatPhoneNumber = (value: string) => {
    const digitsOnly = value.replace(/\D/g, '');
    if (digitsOnly.length <= 3) return digitsOnly;
    if (digitsOnly.length <= 6) return `${digitsOnly.slice(0, 3)} ${digitsOnly.slice(3)}`;
    return `${digitsOnly.slice(0, 3)} ${digitsOnly.slice(3, 6)} ${digitsOnly.slice(6, 10)}`;
  };

  const handlePhoneNumberChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    setPhoneNumber(formatted);
  };

  const handleCountrySelect = (country: typeof COUNTRY_CODES[0]) => {
    // If OTP field is showing and country changes, reset OTP state
    if (showOtpField && country.code !== selectedCountry.code) {
      setShowOtpField(false);
      setOtp("");
      setSuccess("");
    }
    setSelectedCountry(country);
    setShowCountryDropdown(false);
  };

  // Reset OTP state when phone number changes during OTP phase
  const handlePhoneNumberChangeWithReset = (value: string) => {
    const formatted = formatPhoneNumber(value);
    
    // If OTP field is showing and phone number actually changes, reset OTP state
    if (showOtpField && formatted !== phoneNumber) {
      setShowOtpField(false);
      setOtp("");
      setSuccess("");
    }
    
    setPhoneNumber(formatted);
  };

  const handleResetOtpProcess = () => {
    setShowOtpField(false);
    setOtp("");
    setSuccess("");
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
                  <AlertDescription className="text-red-700">
                    {error}
                    {error === "User not found. Please register first." && (
                      <div className="mt-2">
                        <Link
                          to="/register"
                          className="text-primary hover:underline font-medium"
                        >
                          Create an account here
                        </Link>
                      </div>
                    )}
                  </AlertDescription>
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
                  {/* Country Code Dropdown */}
                  <div className="relative">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-24 justify-between bg-background border-border hover:bg-muted"
                      onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                    >
                      <span className="text-xs">{selectedCountry.dialCode}</span>
                      <ChevronDown className="w-4 h-4 opacity-50" />
                    </Button>
                    
                    {showCountryDropdown && (
                      <div className="absolute top-full left-0 mt-1 w-48 max-h-60 overflow-y-auto bg-background border border-border rounded-md shadow-lg z-10">
                        {COUNTRY_CODES.map((country) => (
                          <button
                            key={country.code}
                            type="button"
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors ${
                              selectedCountry.code === country.code ? 'bg-primary text-primary-foreground' : ''
                            }`}
                            onClick={() => handleCountrySelect(country)}
                          >
                            <span className="font-medium">{country.dialCode}</span>
                            <span className="text-muted-foreground ml-2">{country.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Phone Number Input */}
                  <div className="flex-1">
                    <Input
                      id="phoneNumber"
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => handlePhoneNumberChangeWithReset(e.target.value)}
                      placeholder="123 456 7890"
                      required
                      className="bg-background border-border focus:border-primary focus:ring-primary"
                    />
                  </div>

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
                <p className="text-xs text-muted-foreground">
                  Selected: {selectedCountry.name} {selectedCountry.dialCode}
                </p>
              </div>

              {showOtpField && (
                <>
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
                      onClick={handleResetOtpProcess}
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      Change phone number
                    </button>
                  </div>

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
                    {otpLoading ? (
                      <div className="flex items-center">
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                        Resending...
                      </div>
                    ) : (
                      "Resend OTP"
                    )}
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