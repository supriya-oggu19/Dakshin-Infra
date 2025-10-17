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
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
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

    console.log("Submitting form data:", {
      ...agentDetails,
      documents: files,
    });

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/agents/create", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("API Response:", response.data);
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
      console.error("Error submitting application:", error.response ? error.response.data : error.message);
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
            <div className="card-luxury p-12 animate-fade-in">
              <CheckCircle className="w-20 h-20 text-primary mx-auto mb-6" />
              <h1 className="text-3xl font-bold mb-4 glow-text">{apiMessage}</h1>
              <p className="text-xl text-muted-foreground mb-6">
                Thank you for your interest in joining our elite team of luxury real estate agents.
              </p>
              <p className="text-muted-foreground mb-8">
                Our team will review your application and RERA credentials. We'll contact you within 48 hours
                to discuss the next steps in our agent onboarding process.
              </p>
              <div className="space-y-4">
                <Badge className="bg-primary/20 text-primary border-primary/30">
                  Agent ID: {agentId}
                </Badge>
                <div className="pt-4">
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

      <div className="pt-20 pb-12">
        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
              Agent Recruitment
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 glow-text">
              Join Our Elite
              <span className="text-primary block">Agent Network</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Become part of an exclusive team selling luxury properties to high-net-worth individuals.
              Exceptional earning potential with comprehensive support and training.
            </p>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 px-4 bg-card/30">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4 glow-text">Why Choose Ramya Constructions?</h2>
              <p className="text-muted-foreground">Unlock your potential in real estate</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <div key={index} className={`card-luxury p-8 text-center animate-fade-in`} style={{ animationDelay: `${index * 200}ms` }}>
                    <div className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-6">
                      <Icon className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold mb-4 text-foreground">{benefit.title}</h3>
                    <p className="text-muted-foreground">{benefit.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Application Form */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="card-luxury border-0 shadow-none animate-fade-in">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-3xl font-bold glow-text">
                  Become a Wealth Advisor
                </CardTitle>
                <p className="text-muted-foreground mt-2">
                  Fill out the form below to start your journey with us. All fields marked with * are required.
                </p>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-foreground flex items-center">
                      <UserPlus className="w-5 h-5 mr-2 text-primary" />
                      Personal Information
                    </h3>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">
                          First Name *
                        </label>
                        <Input
                          name="firstName"
                          placeholder="Enter your first name"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className={`bg-background border-border ${errors.firstName ? "border-red-500" : ""}`}
                          required
                        />
                        {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">
                          Last Name *
                        </label>
                        <Input
                          name="lastName"
                          placeholder="Enter your last name"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className={`bg-background border-border ${errors.lastName ? "border-red-500" : ""}`}
                          required
                        />
                        {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">
                          Email Address *
                        </label>
                        <Input
                          name="email"
                          type="email"
                          placeholder="Enter your email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className={`bg-background border-border ${errors.email ? "border-red-500" : ""}`}
                          required
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">
                          Phone Number *
                        </label>
                        <Input
                          name="phone"
                          type="tel"
                          placeholder="Enter your phone number"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className={`bg-background border-border ${errors.phone ? "border-red-500" : ""}`}
                          required
                        />
                        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">
                          PAN Number *
                        </label>
                        <Input
                          name="pan"
                          type="text"
                          placeholder="Enter your PAN number"
                          value={formData.pan}
                          onChange={handleInputChange}
                          className={`bg-background border-border ${errors.pan ? "border-red-500" : ""}`}
                          required
                        />
                        {errors.pan && <p className="text-red-500 text-xs mt-1">{errors.pan}</p>}
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">
                          Aadhar Number
                        </label>
                        <Input
                          name="aadhar"
                          type="text"
                          placeholder="Enter your Aadhar number"
                          value={formData.aadhar}
                          onChange={handleInputChange}
                          className={`bg-background border-border ${errors.aadhar ? "border-red-500" : ""}`}
                        />
                        {errors.aadhar && <p className="text-red-500 text-xs mt-1">{errors.aadhar}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Professional Information */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-foreground flex items-center">
                      <FileText className="w-5 h-5 mr-2 text-primary" />
                      Professional Details
                    </h3>

                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        RERA ID
                      </label>
                      <Input
                        name="reraId"
                        placeholder="Enter your RERA registration ID"
                        value={formData.reraId}
                        onChange={handleInputChange}
                        className={`bg-background border-border ${errors.reraId ? "border-red-500" : ""}`}
                      />
                      {errors.reraId && <p className="text-red-500 text-xs mt-1">{errors.reraId}</p>}
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">
                          Specialization
                        </label>
                        <Input
                          name="specialization"
                          placeholder="e.g., Commercial Properties, Residential"
                          value={formData.specialization}
                          onChange={handleInputChange}
                          className={`bg-background border-border ${errors.specialization ? "border-red-500" : ""}`}
                        />
                        {errors.specialization && <p className="text-red-500 text-xs mt-1">{errors.specialization}</p>}
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">
                          Commission Rate (%)
                        </label>
                        <Input
                          name="commissionRate"
                          type="number"
                          placeholder="e.g., 3.2"
                          value={formData.commissionRate}
                          onChange={handleInputChange}
                          className={`bg-background border-border ${errors.commissionRate ? "border-red-500" : ""}`}
                        />
                        {errors.commissionRate && <p className="text-red-500 text-xs mt-1">{errors.commissionRate}</p>}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        About Yourself *
                      </label>
                      <Textarea
                        name="about"
                        placeholder="Tell us about your experience, achievements, and why you want to join our team..."
                        rows={5}
                        value={formData.about}
                        onChange={handleInputChange}
                        className={`bg-background border-border resize-none ${errors.about ? "border-red-500" : ""}`}
                        required
                      />
                      {errors.about && <p className="text-red-500 text-xs mt-1">{errors.about}</p>}
                    </div>
                  </div>

                  {/* Document Upload */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-foreground flex items-center">
                      <Upload className="w-5 h-5 mr-2 text-primary" />
                      Required Documents
                    </h3>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="card-luxury p-4">
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
                            className="w-full"
                            asChild
                          >
                            <span>
                              <Upload className="w-4 h-4 mr-2" />
                              Upload RERA Certificate
                            </span>
                          </Button>
                          {files.reraCertificate && (
                            <p className="text-sm text-muted-foreground mt-2">
                              Selected: {files.reraCertificate.name}
                            </p>
                          )}
                        </label>
                        <p className="text-xs text-muted-foreground mt-2 text-center">
                          PDF, JPG or PNG (Max 5MB)
                        </p>
                      </div>

                      <div className="card-luxury p-4">
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
                            className="w-full"
                            asChild
                          >
                            <span>
                              <Upload className="w-4 h-4 mr-2" />
                              Upload PAN Card
                            </span>
                          </Button>
                          {files.panCard && (
                            <p className="text-sm text-muted-foreground mt-2">
                              Selected: {files.panCard.name}
                            </p>
                          )}
                        </label>
                        <p className="text-xs text-muted-foreground mt-2 text-center">
                          PDF format preferred (Max 5MB)
                        </p>
                      </div>
                      <div className="card-luxury p-4">
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
                            className="w-full"
                            asChild
                          >
                            <span>
                              <Upload className="w-4 h-4 mr-2" />
                              Upload Aadhar Card
                            </span>
                          </Button>
                          {files.aadharCard && (
                            <p className="text-sm text-muted-foreground mt-2">
                              Selected: {files.aadharCard.name}
                            </p>
                          )}
                        </label>
                        <p className="text-xs text-muted-foreground mt-2 text-center">
                          PDF format preferred (Max 5MB)
                        </p>
                      </div>
                      <div className="card-luxury p-4">
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
                            className="w-full"
                            asChild
                          >
                            <span>
                              <Upload className="w-4 h-4 mr-2" />
                              Upload Resume/CV
                            </span>
                          </Button>
                          {files.resumeCv && (
                            <p className="text-sm text-muted-foreground mt-2">
                              Selected: {files.resumeCv.name}
                            </p>
                          )}
                        </label>
                        <p className="text-xs text-muted-foreground mt-2 text-center">
                          PDF format preferred (Max 5MB)
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Terms & Submit */}
                  <div className="space-y-6 pt-4">
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        id="terms"
                        className="mt-1"
                        required
                      />
                      <label htmlFor="terms" className="text-sm text-muted-foreground">
                        I agree to the terms and conditions and understand that my application will be
                        reviewed based on my RERA credentials and experience. I consent to background
                        verification as part of the onboarding process.
                      </label>
                    </div>

                    <Button type="submit" variant="luxury" size="lg" className="w-full">
                      Submit Application
                      <UserPlus className="w-5 h-5 ml-2" />
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