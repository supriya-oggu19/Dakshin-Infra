import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, Upload, CheckCircle, Users, Award, TrendingUp, FileText } from "lucide-react";
import Navigation from "@/components/Navigation";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

const Agents = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    pan: "",
    aadhar: "",
    reraId: "",
    specialization: "",
    about: "",
    commissionRate: "",
  });
  const [files, setFiles] = useState({
    reraCertificate: null as File | null,
    panCard: null as File | null,
    aadharCard: null as File | null,
    resumeCv: null as File | null,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof typeof formData, string>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [agentId, setAgentId] = useState<string | null>(null);
  const [apiMessage, setApiMessage] = useState<string | null>(null);
  const { toast } = useToast();

  const benefits = [
    {
      icon: TrendingUp,
      title: "High Commissions",
      description: "Earn high commissions on property sales with performance bonuses.",
    },
    {
      icon: Users,
      title: "Premium Projects",
      description: "Connect with exclusive, high-value real estate projects and attract premium clients to boost your portfolio.",
    },
    {
      icon: Award,
      title: "Training & Support",
      description: "Comprehensive training programs and ongoing support from our expert team.",
    },
  ];

  const validateForm = () => {
    const newErrors: Partial<Record<keyof typeof formData, string>> = {};

    if (!formData.firstName) {
      newErrors.firstName = "First name is required";
    } else if (!/^[a-zA-Z\s]+$/.test(formData.firstName)) {
      newErrors.firstName = "First name must contain only letters";
    } else if (formData.firstName.length > 50) {
      newErrors.firstName = "First name must be 50 characters or less";
    }

    if (!formData.lastName) {
      newErrors.lastName = "Last name is required";
    } else if (!/^[a-zA-Z\s]+$/.test(formData.lastName)) {
      newErrors.lastName = "Last name must contain only letters";
    } else if (formData.lastName.length > 50) {
      newErrors.lastName = "Last name must be 50 characters or less";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.phone) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = "Phone number must be 10 digits";
    }

    if (!formData.pan) {
      newErrors.pan = "PAN number is required";
    } else if (!/^[A-Z]{5}\d{4}[A-Z]{1}$/.test(formData.pan)) {
      newErrors.pan = "Invalid PAN format (e.g., AWXPE1121D)";
    }

    if (formData.aadhar && !/^\d{12}$/.test(formData.aadhar)) {
      newErrors.aadhar = "Aadhar number must be 12 digits";
    }

    if (formData.reraId && (!/^[a-zA-Z0-9]+$/.test(formData.reraId) || formData.reraId.length > 20)) {
      newErrors.reraId = "RERA ID must be alphanumeric and 20 characters or less";
    }

    if (formData.specialization && formData.specialization.length > 100) {
      newErrors.specialization = "Specialization must be 100 characters or less";
    }

    if (!formData.about) {
      newErrors.about = "About section is required";
    } else if (formData.about.length > 500) {
      newErrors.about = "About section must be 500 characters or less";
    }

    if (formData.commissionRate && (isNaN(Number(formData.commissionRate)) || Number(formData.commissionRate) < 0 || Number(formData.commissionRate) > 100)) {
      newErrors.commissionRate = "Commission rate must be a number between 0 and 100";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof typeof files) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "File size must be less than 5MB",
          variant: "destructive",
        });
        return;
      }
      if (!['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: "Only PDF, JPG, and PNG files are allowed",
          variant: "destructive",
        });
        return;
      }
    }
    setFiles(prev => ({ ...prev, [field]: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form before submitting.",
        variant: "destructive",
      });
      return;
    }

    const agentDetails = {
      first_name: formData.firstName.trim(),
      last_name: formData.lastName.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      pan_number: formData.pan.trim(),
      aadhar_number: formData.aadhar.trim() || null,
      rera_id: formData.reraId.trim() || null,
      specialization: formData.specialization.trim() || null,
      about_text: formData.about.trim(),
      commission_rate: formData.commissionRate ? parseFloat(formData.commissionRate) : null,
    };

    const formDataToSend = new FormData();
    formDataToSend.append("agentdetails", JSON.stringify(agentDetails));

    if (files.reraCertificate) formDataToSend.append("documents", files.reraCertificate);
    if (files.panCard) formDataToSend.append("documents", files.panCard);
    if (files.aadharCard) formDataToSend.append("documents", files.aadharCard);
    if (files.resumeCv) formDataToSend.append("documents", files.resumeCv);

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/agents/create", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setAgentId(response.data.agent_id || "N/A");
      setApiMessage(response.data.message || "Agent created successfully");
      setSubmitted(true);
      toast({
        title: response.data.message || "Success",
        description: `Agent ID: ${response.data.agent_id || "N/A"}`,
      });
    } catch (error) {
      const errorDetail = error.response?.data?.detail;
      const errorMsg = errorDetail
        ? Array.isArray(errorDetail)
          ? errorDetail.map((d: any) => d.msg).join(", ")
          : JSON.stringify(errorDetail)
        : "Failed to submit application. Please try again.";
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
      setSubmitted(false);
    }
  };

  if (submitted && agentId && apiMessage) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />

        <div className="pt-20 pb-12 flex items-center justify-center min-h-screen">
          <div className="max-w-2xl mx-auto px-4 text-center">
            <div className="card-luxury p-8 md:p-12 animate-fade-in">
              <CheckCircle className="w-16 h-16 md:w-20 md:h-20 text-primary mx-auto mb-4" />
              <h1 className="text-2xl md:text-3xl font-bold mb-3 glow-text">{apiMessage}</h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-4">
                Thank you for your interest in joining our elite team of luxury real estate agents.
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                Our team will review your application and RERA credentials. We'll contact you within 48 hours
                to discuss the next steps in our agent onboarding process.
              </p>
              <div className="space-y-3">
                <Badge className="bg-primary/20 text-primary border-primary/30">
                  Agent ID: {agentId}
                </Badge>
                <div className="pt-2">
                  <Button
                    variant="luxury"
                    onClick={() => {
                      setSubmitted(false);
                      setAgentId(null);
                      setApiMessage(null);
                      setFormData({
                        firstName: "",
                        lastName: "",
                        email: "",
                        phone: "",
                        pan: "",
                        aadhar: "",
                        reraId: "",
                        specialization: "",
                        about: "",
                        commissionRate: "",
                      });
                      setFiles({
                        reraCertificate: null,
                        panCard: null,
                        aadharCard: null,
                        resumeCv: null,
                      });
                      setErrors({});
                    }}
                  >
                    Submit Another Application
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="pt-16 pb-8">
        {/* Hero Section - Reduced padding */}
        <section className="py-12 md:py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-3 bg-primary/20 text-primary border-primary/30">
              Agent Recruitment
            </Badge>
            <h1 className="text-3xl md:text-5xl font-bold mb-4 glow-text">
              Join Our Elite
              <span className="text-primary block">Agent Network</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Become part of an exclusive team selling luxury properties to high-net-worth individuals.
              Exceptional earning potential with comprehensive support and training.
            </p>
          </div>
        </section>

        {/* Benefits Section - Reduced padding and card spacing */}
        <section className="py-10 px-4 bg-card/30">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-2 glow-text">Why Choose Ramya Constructions?</h2>
              <p className="text-sm text-muted-foreground">Unlock your potential in real estate</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <div key={index} className={`card-luxury p-6 text-center animate-fade-in`} style={{ animationDelay: `${index * 200}ms` }}>
                    <div className="w-14 h-14 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-7 h-7 text-primary-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-foreground">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{benefit.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Application Form - Compact spacing */}
        <section className="py-10 px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="card-luxury border-0 shadow-none animate-fade-in">
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-2xl md:text-3xl font-bold glow-text">
                  Become a Wealth Advisor
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Fill out the form below to start your journey with us. All fields marked with * are required.
                </p>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Personal Information */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-foreground flex items-center">
                      <UserPlus className="w-4 h-4 mr-2 text-primary" />
                      Personal Information
                    </h3>

                    <div className="grid md:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-foreground mb-1.5 block">
                          First Name *
                        </label>
                        <Input
                          name="firstName"
                          placeholder="Enter your first name"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className={`bg-background border-border h-9 text-sm ${errors.firstName ? "border-red-500" : ""}`}
                          required
                        />
                        {errors.firstName && <p className="text-red-500 text-xs mt-0.5">{errors.firstName}</p>}
                      </div>
                      <div>
                        <label className="text-xs font-medium text-foreground mb-1.5 block">
                          Last Name *
                        </label>
                        <Input
                          name="lastName"
                          placeholder="Enter your last name"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className={`bg-background border-border h-9 text-sm ${errors.lastName ? "border-red-500" : ""}`}
                          required
                        />
                        {errors.lastName && <p className="text-red-500 text-xs mt-0.5">{errors.lastName}</p>}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-foreground mb-1.5 block">
                          Email Address *
                        </label>
                        <Input
                          name="email"
                          type="email"
                          placeholder="Enter your email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className={`bg-background border-border h-9 text-sm ${errors.email ? "border-red-500" : ""}`}
                          required
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-0.5">{errors.email}</p>}
                      </div>
                      <div>
                        <label className="text-xs font-medium text-foreground mb-1.5 block">
                          Phone Number *
                        </label>
                        <Input
                          name="phone"
                          type="tel"
                          placeholder="Enter your phone number"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className={`bg-background border-border h-9 text-sm ${errors.phone ? "border-red-500" : ""}`}
                          required
                        />
                        {errors.phone && <p className="text-red-500 text-xs mt-0.5">{errors.phone}</p>}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-foreground mb-1.5 block">
                          PAN Number *
                        </label>
                        <Input
                          name="pan"
                          type="text"
                          placeholder="Enter your PAN number"
                          value={formData.pan}
                          onChange={handleInputChange}
                          className={`bg-background border-border h-9 text-sm ${errors.pan ? "border-red-500" : ""}`}
                          required
                        />
                        {errors.pan && <p className="text-red-500 text-xs mt-0.5">{errors.pan}</p>}
                      </div>
                      <div>
                        <label className="text-xs font-medium text-foreground mb-1.5 block">
                          Aadhar Number
                        </label>
                        <Input
                          name="aadhar"
                          type="text"
                          placeholder="Enter your Aadhar number"
                          value={formData.aadhar}
                          onChange={handleInputChange}
                          className={`bg-background border-border h-9 text-sm ${errors.aadhar ? "border-red-500" : ""}`}
                        />
                        {errors.aadhar && <p className="text-red-500 text-xs mt-0.5">{errors.aadhar}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Professional Information */}
                  <div className="space-y-3 pt-2">
                    <h3 className="text-lg font-semibold text-foreground flex items-center">
                      <FileText className="w-4 h-4 mr-2 text-primary" />
                      Professional Details
                    </h3>

                    <div className="grid md:grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs font-medium text-foreground mb-1.5 block">
                          RERA ID
                        </label>
                        <Input
                          name="reraId"
                          placeholder="Enter your RERA ID"
                          value={formData.reraId}
                          onChange={handleInputChange}
                          className={`bg-background border-border h-9 text-sm ${errors.reraId ? "border-red-500" : ""}`}
                        />
                        {errors.reraId && <p className="text-red-500 text-xs mt-0.5">{errors.reraId}</p>}
                      </div>
                      <div>
                        <label className="text-xs font-medium text-foreground mb-1.5 block">
                          Specialization
                        </label>
                        <Input
                          name="specialization"
                          placeholder="e.g., Commercial, Residential"
                          value={formData.specialization}
                          onChange={handleInputChange}
                          className={`bg-background border-border h-9 text-sm ${errors.specialization ? "border-red-500" : ""}`}
                        />
                        {errors.specialization && <p className="text-red-500 text-xs mt-0.5">{errors.specialization}</p>}
                      </div>
                      <div>
                        <label className="text-xs font-medium text-foreground mb-1.5 block">
                          Commission Rate (%)
                        </label>
                        <Input
                          name="commissionRate"
                          type="number"
                          placeholder="e.g., 3.2"
                          value={formData.commissionRate}
                          onChange={handleInputChange}
                          className={`bg-background border-border h-9 text-sm ${errors.commissionRate ? "border-red-500" : ""}`}
                        />
                        {errors.commissionRate && <p className="text-red-500 text-xs mt-0.5">{errors.commissionRate}</p>}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-foreground mb-1.5 block">
                        About Yourself *
                      </label>
                      <Textarea
                        name="about"
                        placeholder="Tell us about your experience, achievements, and why you want to join our team..."
                        rows={4}
                        value={formData.about}
                        onChange={handleInputChange}
                        className={`bg-background border-border resize-none text-sm ${errors.about ? "border-red-500" : ""}`}
                        required
                      />
                      {errors.about && <p className="text-red-500 text-xs mt-0.5">{errors.about}</p>}
                    </div>
                  </div>

                  {/* Document Upload - More compact */}
                  <div className="space-y-3 pt-2">
                    <h3 className="text-lg font-semibold text-foreground flex items-center">
                      <Upload className="w-4 h-4 mr-2 text-primary" />
                      Required Documents
                    </h3>

                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="card-luxury p-3">
                        <label className="w-full flex flex-col items-center justify-center cursor-pointer">
                          <Input
                            type="file"
                            accept="application/pdf,image/jpeg,image/png"
                            onChange={(e) => handleFileChange(e, "reraCertificate")}
                            className="hidden"
                            id="reraCertificate"
                          />
                          <Button
                            variant="outline-luxury"
                            size="sm"
                            className="w-full h-9"
                            asChild
                          >
                            <span>
                              <Upload className="w-3.5 h-3.5 mr-2" />
                              <span className="text-xs">RERA Certificate</span>
                            </span>
                          </Button>
                          {files.reraCertificate && (
                            <p className="text-xs text-muted-foreground mt-1.5 truncate w-full text-center">
                              {files.reraCertificate.name}
                            </p>
                          )}
                        </label>
                        <p className="text-[10px] text-muted-foreground mt-1.5 text-center">
                          PDF, JPG or PNG (Max 5MB)
                        </p>
                      </div>

                      <div className="card-luxury p-3">
                        <label className="w-full flex flex-col items-center justify-center cursor-pointer">
                          <Input
                            type="file"
                            accept="application/pdf,image/jpeg,image/png"
                            onChange={(e) => handleFileChange(e, "panCard")}
                            className="hidden"
                            id="panCard"
                          />
                          <Button
                            variant="outline-luxury"
                            size="sm"
                            className="w-full h-9"
                            asChild
                          >
                            <span>
                              <Upload className="w-3.5 h-3.5 mr-2" />
                              <span className="text-xs">PAN Card</span>
                            </span>
                          </Button>
                          {files.panCard && (
                            <p className="text-xs text-muted-foreground mt-1.5 truncate w-full text-center">
                              {files.panCard.name}
                            </p>
                          )}
                        </label>
                        <p className="text-[10px] text-muted-foreground mt-1.5 text-center">
                          PDF preferred (Max 5MB)
                        </p>
                      </div>

                      <div className="card-luxury p-3">
                        <label className="w-full flex flex-col items-center justify-center cursor-pointer">
                          <Input
                            type="file"
                            accept="application/pdf,image/jpeg,image/png"
                            onChange={(e) => handleFileChange(e, "aadharCard")}
                            className="hidden"
                            id="aadharCard"
                          />
                          <Button
                            variant="outline-luxury"
                            size="sm"
                            className="w-full h-9"
                            asChild
                          >
                            <span>
                              <Upload className="w-3.5 h-3.5 mr-2" />
                              <span className="text-xs">Aadhar Card</span>
                            </span>
                          </Button>
                          {files.aadharCard && (
                            <p className="text-xs text-muted-foreground mt-1.5 truncate w-full text-center">
                              {files.aadharCard.name}
                            </p>
                          )}
                        </label>
                        <p className="text-[10px] text-muted-foreground mt-1.5 text-center">
                          PDF preferred (Max 5MB)
                        </p>
                      </div>

                      <div className="card-luxury p-3">
                        <label className="w-full flex flex-col items-center justify-center cursor-pointer">
                          <Input
                            type="file"
                            accept="application/pdf,image/jpeg,image/png"
                            onChange={(e) => handleFileChange(e, "resumeCv")}
                            className="hidden"
                            id="resumeCv"
                          />
                          <Button
                            variant="outline-luxury"
                            size="sm"
                            className="w-full h-9"
                            asChild
                          >
                            <span>
                              <Upload className="w-3.5 h-3.5 mr-2" />
                              <span className="text-xs">Resume/CV</span>
                            </span>
                          </Button>
                          {files.resumeCv && (
                            <p className="text-xs text-muted-foreground mt-1.5 truncate w-full text-center">
                              {files.resumeCv.name}
                            </p>
                          )}
                        </label>
                        <p className="text-[10px] text-muted-foreground mt-1.5 text-center">
                          PDF preferred (Max 5MB)
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Terms & Submit - More compact */}
                  <div className="space-y-4 pt-3">
                    <div className="flex items-start space-x-2">
                      <input
                        type="checkbox"
                        id="terms"
                        className="mt-0.5"
                        required
                      />
                      <label htmlFor="terms" className="text-xs text-muted-foreground leading-relaxed">
                        I agree to the terms and conditions and understand that my application will be
                        reviewed based on my RERA credentials and experience. I consent to background
                        verification as part of the onboarding process.
                      </label>
                    </div>

                    <Button type="submit" variant="luxury" className="w-full h-10">
                      Submit Application
                      <UserPlus className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Agents;