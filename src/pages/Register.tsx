// Register.tsx - Complete Registration with OTP Integration
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, UserPlus, Phone, Mail, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const API_BASE_URL = "http://127.0.0.1:8000";

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
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

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

    if (!name.trim()) {
      setError("Please enter your name");
      toast({
        title: "Error",
        description: "Please enter your name",
        variant: "destructive",
      });
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email");
      toast({
        title: "Error",
        description: "Please enter your email",
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

      if (response.ok && data.status === "success") {
        setSuccess(data.message || "OTP sent successfully");
        setShowOtpField(true);
        toast({
          title: "Success",
          description: data.message || "OTP sent successfully",
        });
      } else {
        setError(data.message || "Failed to send OTP");
        toast({
          title: "Error",
          description: data.message || "Failed to send OTP",
          variant: "destructive",
        });
      }
    } catch (err) {
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/user/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name,
          phone_no: phoneNumber,
          otp: otp,
          email: email,
        }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        // Store token and login user
        login(data.token);
        setSuccess(data.message || "Registration successful");
        toast({
          title: "Success",
          description: data.message || "Registration successful",
        });
        
        // Navigate to projects after a brief delay
        setTimeout(() => {
          navigate("/projects");
        }, 500);
      } else {
        setError(data.message || "Registration failed. Please try again.");
        toast({
          title: "Error",
          description: data.message || "Registration failed. Please try again.",
          variant: "destructive",
        });
      }
    } catch (err) {
      const errorMsg = "Registration failed. Please check your connection.";
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
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
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
              Create Your Account
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Join our investor portal to manage your properties
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
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
                <Label htmlFor="name" className="text-foreground">
                  Full Name
                </Label>
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

              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">
                  Email Address
                </Label>
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

              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="text-foreground">
                  Phone Number
                </Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="phoneNumber"
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+918688475255"
                      required
                      disabled={showOtpField}
                      className="pl-10 bg-background border-border focus:border-primary focus:ring-primary"
                    />
                  </div>
                  {!showOtpField && (
                    <Button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={otpLoading || !phoneNumber.trim() || !name.trim() || !email.trim()}
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
                    Change details
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
                    Resend OTP
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