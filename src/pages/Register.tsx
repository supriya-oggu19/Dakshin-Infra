import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, UserPlus, Phone, Mail, User, ChevronDown } from "lucide-react";
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

const Register = () => {
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtpField, setShowOtpField] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0]); // Default to India
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Validate phone number (only digits, length varies by country)
  const validatePhoneNumber = (phone: string) => {
    const digitsOnly = phone.replace(/\D/g, '');
    // Basic validation - at least 6 digits for phone numbers
    return digitsOnly.length >= 6 && digitsOnly.length <= 15;
  };

  // Get full phone number with country code
  const getFullPhoneNumber = () => {
    const digitsOnly = phoneNumber.replace(/\D/g, '');
    return selectedCountry.dialCode + digitsOnly;
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
    setSelectedCountry(country);
    setShowCountryDropdown(false);
  };

  const handleSendOtp = async () => {
    const digitsOnly = phoneNumber.replace(/\D/g, '');
    
    if (!name || !email || !digitsOnly) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
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
      const fullPhoneNumber = getFullPhoneNumber();
      const response = await userApi.sendOtp({ phone_no: fullPhoneNumber });
      const data = response.data;

      if (data.status === "success") {
        setSuccess(data.message);
        setShowOtpField(true);
        toast({ title: "Success", description: data.message });
      } else {
        setError(data.message || "Failed to send OTP");
        toast({
          title: "Error",
          description: data.message || "Failed to send OTP",
          variant: "destructive",
        });
      }
    } catch (err) {
      const backendMessage = err.response?.data?.message || "Failed to send OTP.";
      setError(backendMessage);
      toast({
        title: "Error",
        description: backendMessage,
        variant: "destructive",
      });
    } finally {
      setOtpLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const fullPhoneNumber = getFullPhoneNumber();
      const response = await userApi.register({
        name,
        phone_no: fullPhoneNumber,
        otp,
        email,
      });

      const data = response.data;

      if (data.token) {
        login(data.token);
        setSuccess(data.message || "Registration successful");
        toast({ title: "Success", description: data.message });
        setTimeout(() => navigate("/projects"), 500);
      } else {
        setError(data.message || "Registration failed. Please try again.");
        toast({
          title: "Error",
          description: data.message || "Registration failed.",
          variant: "destructive",
        });
      }
    } catch (err) {
      const backendMessage = err.response?.data?.message || "Registration failed.";
      setError(backendMessage);
      toast({
        title: "Error",
        description: backendMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>

        <Card className="shadow-lg border-0 card-luxury">
          <CardHeader className="text-center space-y-1">
            <CardTitle className="text-2xl font-bold text-foreground">Create Your Account</CardTitle>
            <CardDescription className="text-muted-foreground">
              Join our investor portal to manage your properties
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
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

              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                    disabled={showOtpField}
                    className="pl-10 bg-background border-border focus:border-primary focus:ring-primary"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    disabled={showOtpField}
                    className="pl-10 bg-background border-border focus:border-primary focus:ring-primary"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <div className="flex gap-2">
                  {/* Country Code Dropdown */}
                  <div className="relative">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-24 justify-between bg-background border-border hover:bg-muted"
                      onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                      disabled={showOtpField}
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
                  <div className="relative flex-1">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="phoneNumber"
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => handlePhoneNumberChange(e.target.value)}
                      placeholder="123 456 7890"
                      required
                      disabled={showOtpField}
                      className="pl-10 bg-background border-border focus:border-primary focus:ring-primary"
                    />
                  </div>

                  {!showOtpField && (
                    <Button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={otpLoading || !name || !email || !phoneNumber.trim()}
                      className="whitespace-nowrap"
                    >
                      {otpLoading ? (
                        <div className="flex items-center">
                          <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                          Sending...
                        </div>
                      ) : (
                        "Send OTP"
                      )}
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Selected: {selectedCountry.name} {selectedCountry.dialCode}
                </p>
              </div>

              {/* OTP */}
              {showOtpField && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="otp">Enter OTP</Label>
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
                      Change details
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
                        Creating Account...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <UserPlus className="w-4 h-4 mr-2" />
                        Create Account
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
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-primary hover:underline font-medium"
                >
                  Login here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;