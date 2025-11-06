// src/pages/Agents.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, Upload, CheckCircle, Users, Award, TrendingUp, FileText } from "lucide-react";
import Navigation from "@/components/Navigation";
import { useToast } from "@/hooks/use-toast";
import { agentApi } from "@/api/agentApi";
import type { CreateAgentResponse } from "../api/models/agent.model";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  pan: string;
  aadhar: string;
  reraId: string;
  specialization: string;
  about: string;
  commissionRate: string;
}

interface Files {
  reraCertificate: File | null;
  panCard: File | null;
  aadharCard: File | null;
  resumeCv: File | null;
}

const Agents = () => {
  const [formData, setFormData] = useState<FormData>({
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

  const [files, setFiles] = useState<Files>({
    reraCertificate: null,
    panCard: null,
    aadharCard: null,
    resumeCv: null,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [agentName, setAgentName] = useState("");
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
      description: "Connect with exclusive, high-value real estate projects and attract premium clients.",
    },
    {
      icon: Award,
      title: "Training & Support",
      description: "Comprehensive training programs and ongoing support from our expert team.",
    },
  ];

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.firstName) newErrors.firstName = "First name is required";
    else if (!/^[a-zA-Z\s]+$/.test(formData.firstName)) newErrors.firstName = "First name must contain only letters";
    else if (formData.firstName.length > 50) newErrors.firstName = "First name must be 50 characters or less";

    if (!formData.lastName) newErrors.lastName = "Last name is required";
    else if (!/^[a-zA-Z\s]+$/.test(formData.lastName)) newErrors.lastName = "Last name must contain only letters";
    else if (formData.lastName.length > 50) newErrors.lastName = "Last name must be 50 characters or less";

    if (!formData.email) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Invalid email format";

    if (!formData.phone) newErrors.phone = "Phone number is required";
    else if (!/^\d{10}$/.test(formData.phone)) newErrors.phone = "Phone number must be 10 digits";

    if (!formData.pan) newErrors.pan = "PAN number is required";
    else if (!/^[A-Z]{5}\d{4}[A-Z]{1}$/.test(formData.pan)) newErrors.pan = "Invalid PAN format (e.g., AWXPE1121D)";

    if (formData.aadhar && !/^\d{12}$/.test(formData.aadhar)) newErrors.aadhar = "Aadhar number must be 12 digits";

    if (formData.reraId && (!/^[a-zA-Z0-9]+$/.test(formData.reraId) || formData.reraId.length > 20))
      newErrors.reraId = "RERA ID must be alphanumeric and 20 characters or less";

    if (formData.specialization && formData.specialization.length > 100)
      newErrors.specialization = "Specialization must be 100 characters or less";

    if (!formData.about) newErrors.about = "About section is required";
    else if (formData.about.length > 500) newErrors.about = "About section must be 500 characters or less";

    if (
      formData.commissionRate &&
      (isNaN(Number(formData.commissionRate)) ||
        Number(formData.commissionRate) < 0 ||
        Number(formData.commissionRate) > 100)
    ) {
      newErrors.commissionRate = "Commission rate must be a number between 0 and 100";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof Files) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: "File Too Large", description: "File size must be less than 5MB", variant: "destructive" });
        return;
      }
      if (!["application/pdf", "image/jpeg", "image/png"].includes(file.type)) {
        toast({ title: "Invalid File Type", description: "Only PDF, JPG, and PNG files are allowed", variant: "destructive" });
        return;
      }
    }
    setFiles((prev) => ({ ...prev, [field]: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({ title: "Validation Error", description: "Please fix the errors in the form.", variant: "destructive" });
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

    [files.reraCertificate, files.panCard, files.aadharCard, files.resumeCv].forEach((file) => {
      if (file) formDataToSend.append("documents", file);
    });

    try {
      const response = await agentApi.create(formDataToSend);
      const data: CreateAgentResponse = response.data;

      const fullName = `${data.first_name || formData.firstName} ${data.last_name || formData.lastName}`.trim();
      setAgentName(fullName);
      setSubmitted(true);

      toast({
        title: "Agent created successfully",
        description: `Welcome, ${fullName}!`,
      });
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.detail
          ? Array.isArray(error.response.data.detail)
            ? error.response.data.detail.map((d: any) => d.msg).join(", ")
            : JSON.stringify(error.response.data.detail)
          : "Failed to submit application. Please try again.";

      toast({ title: "Error", description: errorMsg, variant: "destructive" });
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    setAgentName("");
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
  };

  // Success Screen
  if (submitted && agentName) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-20 pb-12 flex items-center justify-center min-h-screen">
          <div className="max-w-2xl mx-auto px-4 text-center">
            <div className="card-luxury p-8 md:p-12 animate-fade-in">
              <CheckCircle className="w-16 h-16 md:w-20 md:h-20 text-primary mx-auto mb-4" />
              <h1 className="text-2xl md:text-3xl font-bold mb-3 glow-text">Agent created successfully</h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-4">
                Thank you for your interest in joining our elite team of luxury real estate agents.
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                Our team will review your application and RERA credentials. We'll contact you within 48 hours
                to discuss the next steps in our agent onboarding process.
              </p>
              <div className="space-y-3">
                <Badge className="bg-primary/20 text-primary border-primary/30 text-lg px-4 py-1">
                  Welcome, {agentName}
                </Badge>
                <div className="pt-2">
                  <Button variant="luxury" onClick={resetForm}>
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

  // Main Form
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="pt-16 pb-8">
        {/* Hero */}
        <section className="py-12 md:py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-3 bg-primary/20 text-primary border-primary/30">Agent Recruitment</Badge>
            <h1 className="text-3xl md:text-5xl font-bold mb-4 glow-text">
              Join Our Elite <span className="text-primary block">Agent Network</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Become part of an exclusive team selling luxury properties to high-net-worth individuals.
            </p>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-10 px-4 bg-card/30">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-2 glow-text">Why Choose Ramya Constructions?</h2>
              <p className="text-sm text-muted-foreground">Unlock your potential in real estate</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {benefits.map((benefit, i) => {
                const Icon = benefit.icon;
                return (
                  <div key={i} className="card-luxury p-6 text-center animate-fade-in" style={{ animationDelay: `${i * 200}ms` }}>
                    <div className="w-14 h-14 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-7 h-7 text-primary-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{benefit.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Form */}
        <section className="py-10 px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="card-luxury border-0 shadow-none animate-fade-in">
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-2xl md:text-3xl font-bold glow-text">Become a Wealth Advisor</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  All fields marked with * are required.
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Personal Info */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold flex items-center">
                      <UserPlus className="w-4 h-4 mr-2 text-primary" /> Personal Information
                    </h3>
                    <div className="grid md:grid-cols-2 gap-3">
                      {["firstName", "lastName", "email", "phone", "pan"].map((field) => (
                        <div key={field}>
                          <label className="text-xs font-medium mb-1.5 block capitalize">
                            {field === "pan" ? "PAN Number" : field.replace(/([A-Z])/g, " $1").trim()} *
                          </label>
                          <Input
                            name={field}
                            type={field === "email" ? "email" : field === "phone" ? "tel" : "text"}
                            placeholder={`Enter your ${field === "pan" ? "PAN" : field.replace(/([A-Z])/g, " $1").toLowerCase()}`}
                            value={formData[field as keyof FormData]}
                            onChange={handleInputChange}
                            className={`h-9 text-sm ${errors[field as keyof FormData] ? "border-red-500" : ""}`}
                            required={field !== "aadhar"}
                          />
                          {errors[field as keyof FormData] && <p className="text-red-500 text-xs mt-0.5">{errors[field as keyof FormData]}</p>}
                        </div>
                      ))}
                      <div>
                        <label className="text-xs font-medium mb-1.5 block">Aadhar Number</label>
                        <Input
                          name="aadhar"
                          type="text"
                          placeholder="Enter your Aadhar number"
                          value={formData.aadhar}
                          onChange={handleInputChange}
                          className={`h-9 text-sm ${errors.aadhar ? "border-red-500" : ""}`}
                        />
                        {errors.aadhar && <p className="text-red-500 text-xs mt-0.5">{errors.aadhar}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Professional Info */}
                  <div className="space-y-3 pt-2">
                    <h3 className="text-lg font-semibold flex items-center">
                      <FileText className="w-4 h-4 mr-2 text-primary" /> Professional Details
                    </h3>
                    <div className="grid md:grid-cols-3 gap-3">
                      {["reraId", "specialization", "commissionRate"].map((field) => (
                        <div key={field}>
                          <label className="text-xs font-medium mb-1.5 block">
                            {field === "reraId" ? "RERA ID" : field === "commissionRate" ? "Commission Rate (%)" : "Specialization"}
                          </label>
                          <Input
                            name={field}
                            type={field === "commissionRate" ? "number" : "text"}
                            placeholder={field === "commissionRate" ? "e.g., 3.2" : field === "reraId" ? "Enter your RERA ID" : "e.g., Commercial"}
                            value={formData[field as keyof FormData]}
                            onChange={handleInputChange}
                            className={`h-9 text-sm ${errors[field as keyof FormData] ? "border-red-500" : ""}`}
                          />
                          {errors[field as keyof FormData] && <p className="text-red-500 text-xs mt-0.5">{errors[field as keyof FormData]}</p>}
                        </div>
                      ))}
                    </div>
                    <div>
                      <label className="text-xs font-medium mb-1.5 block">About Yourself *</label>
                      <Textarea
                        name="about"
                        placeholder="Tell us about your experience..."
                        rows={4}
                        value={formData.about}
                        onChange={handleInputChange}
                        className={`resize-none text-sm ${errors.about ? "border-red-500" : ""}`}
                        required
                      />
                      {errors.about && <p className="text-red-500 text-xs mt-0.5">{errors.about}</p>}
                    </div>
                  </div>

                  {/* Documents */}
                  <div className="space-y-3 pt-2">
                    <h3 className="text-lg font-semibold flex items-center">
                      <Upload className="w-4 h-4 mr-2 text-primary" /> Required Documents
                    </h3>
                    <div className="grid md:grid-cols-2 gap-3">
                      {[
                        { key: "reraCertificate", label: "RERA Certificate" },
                        { key: "panCard", label: "PAN Card" },
                        { key: "aadharCard", label: "Aadhar Card" },
                        { key: "resumeCv", label: "Resume/CV" },
                      ].map(({ key, label }) => (
                        <div key={key} className="card-luxury p-3">
                          <label className="w-full flex flex-col items-center cursor-pointer">
                            <Input
                              type="file"
                              accept="application/pdf,image/jpeg,image/png"
                              onChange={(e) => handleFileChange(e, key as keyof Files)}
                              className="hidden"
                              id={key}
                            />
                            <Button variant="outline-luxury" size="sm" className="w-full h-9" asChild>
                              <span>
                                <Upload className="w-3.5 h-3.5 mr-2" />
                                <span className="text-xs">{label}</span>
                              </span>
                            </Button>
                            {files[key as keyof Files] && (
                              <p className="text-xs text-muted-foreground mt-1.5 truncate w-full text-center">
                                {(files[key as keyof Files] as File).name}
                              </p>
                            )}
                          </label>
                          <p className="text-[10px] text-muted-foreground mt-1.5 text-center">PDF, JPG or PNG (Max 5MB)</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Submit */}
                  <div className="space-y-4 pt-3">
                    <div className="flex items-start space-x-2">
                      <input type="checkbox" id="terms" className="mt-0.5" required />
                      <label htmlFor="terms" className="text-xs text-muted-foreground leading-relaxed">
                        I agree to the terms and conditions and consent to background verification.
                      </label>
                    </div>
                    <Button type="submit" variant="luxury" className="w-full h-10">
                      Submit Application <UserPlus className="w-4 h-4 ml-2" />
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