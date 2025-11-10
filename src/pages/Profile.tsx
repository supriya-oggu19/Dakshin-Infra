// Profile.tsx - Complete User Profile Update Component
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User, Mail, Phone, Save } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

// const API_BASE_URL = "http://127.0.0.1:8000";
const API_BASE_URL = "https://frontend-api.ramyaconstructions.com";


const Profile = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { getToken, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const token = getToken();
    if (!token) {
      const errorMsg = "Authentication token not found. Please login again.";
      setError(errorMsg);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // Build request body with only filled fields
    const updateData: any = {};
    if (name.trim()) updateData.name = name;
    if (email.trim()) updateData.email = email;
    if (phoneNumber.trim()) updateData.phone_no = phoneNumber;

    if (Object.keys(updateData).length === 0) {
      const errorMsg = "Please fill at least one field to update";
      setError(errorMsg);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/user/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message || "Profile updated successfully");
        toast({
          title: "Success",
          description: data.message || "Profile updated successfully",
        });
        
        // Clear form after successful update
        setTimeout(() => {
          setName("");
          setEmail("");
          setPhoneNumber("");
        }, 1500);
      } else {
        setError(data.message || "Failed to update profile");
        toast({
          title: "Error",
          description: data.message || "Failed to update profile",
          variant: "destructive",
        });
      }
    } catch (err) {
      const errorMsg = "Failed to update profile. Please check your connection.";
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
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-2xl">
        <Card className="shadow-lg border-0 card-luxury">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-foreground">
              Update Profile
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Update your account information. Leave fields empty to keep current values.
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleUpdate} className="space-y-4">
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
                  Full Name (Optional)
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter new name"
                    className="pl-10 bg-background border-border focus:border-primary focus:ring-primary"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">
                  Email Address (Optional)
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter new email"
                    className="pl-10 bg-background border-border focus:border-primary focus:ring-primary"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="text-foreground">
                  Phone Number (Optional)
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="phoneNumber"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Enter new phone number"
                    className="pl-10 bg-background border-border focus:border-primary focus:ring-primary"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                variant="luxury"
                className="w-full font-medium py-2.5"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                    Updating Profile...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Save className="w-4 h-4 mr-2" />
                    Update Profile
                  </div>
                )}
              </Button>
            </form>

            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Note:</strong> Only fill in the fields you want to update. Empty fields will keep their current values.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;