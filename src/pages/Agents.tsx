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
  about: string;
}

interface Files {
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
    about: "",
  });

  const [files, setFiles] = useState<Files>({
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
      title: "Attractive Commissions",
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

    // First Name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    } else if (!/^[a-zA-Z\s]+$/.test(formData.firstName)) {
      newErrors.firstName = "First name must contain only letters";
    } else if (formData.firstName.length > 50) {
      newErrors.firstName = "First name must be 50 characters or less";
    }

    // Last Name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    } else if (!/^[a-zA-Z\s]+$/.test(formData.lastName)) {
      newErrors.lastName = "Last name must contain only letters";
    } else if (formData.lastName.length > 50) {
      newErrors.lastName = "Last name must be 50 characters or less";
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = "Phone number must be 10 digits";
    }

    // PAN validation
    if (!formData.pan.trim()) {
      newErrors.pan = "PAN number is required";
    } else {
      const panUpper = formData.pan.replace(/\s/g, '').toUpperCase();
      const isValidPan = /^[A-Z]{5}\d{4}[A-Z]{1}$/.test(panUpper);
      
      if (!isValidPan) {
        newErrors.pan = "Invalid PAN format (e.g., ABCDE1234F)";
      }
    }

    // Aadhar validation
    if (!formData.aadhar.trim()) {
      newErrors.aadhar = "Aadhar number is required";
    } else if (!/^\d{12}$/.test(formData.aadhar)) {
      newErrors.aadhar = "Aadhar number must be 12 digits";
    }

    // About validation
    if (!formData.about.trim()) {
      newErrors.about = "About section is required";
    } else if (formData.about.length > 500) {
      newErrors.about = "About section must be 500 characters or less";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextareaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'pan') {
      setFormData((prev) => ({ ...prev, [name]: value.toUpperCase() }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    
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
      pan_number: formData.pan.trim().toUpperCase(),
      aadhar_number: formData.aadhar.trim(),
      about_text: formData.about.trim(),
    };

    const formDataToSend = new FormData();
    formDataToSend.append("agentdetails", JSON.stringify(agentDetails));

    [files.panCard, files.aadharCard, files.resumeCv].forEach((file) => {
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
        description: `Welcome, ${fullName}! Our team will review your application.`,
      });
    } catch (error: any) {
      console.log('Full error:', error);

      let errorMessage = "Failed to submit application. Please try again.";

      if (error.response?.data) {
        const errorData = error.response.data;

        if (errorData.detail) {
          if (typeof errorData.detail === 'string') {
            errorMessage = errorData.detail;
          } else if (Array.isArray(errorData.detail)) {
            errorMessage = errorData.detail.map((err: any) => {
              if (err.msg) return err.msg;
              if (err.loc && err.msg) {
                const field = err.loc[err.loc.length - 1];
                return `${field}: ${err.msg}`;
              }
              return JSON.stringify(err);
            }).join(', ');
          } else if (errorData.detail.errors && Array.isArray(errorData.detail.errors)) {
            errorMessage = errorData.detail.errors.join(', ');
          } else if (typeof errorData.detail === 'object') {
            errorMessage = Object.values(errorData.detail).join(', ');
          }
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Submission Error",
        description: errorMessage,
        variant: "destructive"
      });
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
      about: "",
    });
    setFiles({
      panCard: null,
      aadharCard: null,
      resumeCv: null,
    });
    setErrors({});
  };

  // Success Screen
  if (submitted && agentName) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="pt-20 pb-12 flex items-center justify-center min-h-screen">
          <div className="max-w-2xl mx-auto px-6 text-center">
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8 md:p-12">
              <CheckCircle className="w-16 h-16 md:w-20 md:h-20 text-green-600 mx-auto mb-6" />
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Application Submitted Successfully</h1>
              <p className="text-lg text-gray-600 mb-4">
                Thank you for your interest in joining our elite team of luxury real estate agents.
              </p>
              <p className="text-sm text-gray-600 mb-8">
                Our team will review your application and contact you within 48 hours
                to discuss the next steps in our agent onboarding process.
              </p>
              <div className="space-y-4">
                <Badge className="bg-green-100 text-green-800 border-green-200 text-lg px-6 py-2">
                  Welcome, {agentName}
                </Badge>
                <div className="pt-2">
                  <Button 
                    onClick={resetForm}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
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

  // Main Form
  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <div className="pt-16 pb-8">
        {/* Hero Section */}
        <section className="py-12 md:py-16 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4 bg-blue-100 text-blue-800 border-blue-200">Agent Recruitment</Badge>
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
              Join Our Elite <span className="text-blue-600 block">Agent Network</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              Become part of an exclusive team selling luxury properties to high-net-worth individuals.
            </p>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-10 px-6 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Why Choose Ramya Constructions?</h2>
              <p className="text-gray-600">Unlock your potential in real estate</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {benefits.map((benefit, i) => {
                const Icon = benefit.icon;
                return (
                  <div key={i} className="bg-white border border-gray-200 rounded-2xl p-8 text-center shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Icon className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">{benefit.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Form Section */}
        <section className="py-10 px-6">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-white border border-gray-200 rounded-2xl shadow-sm">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl md:text-3xl font-bold text-gray-900">Become a Wealth Advisor</CardTitle>
                <p className="text-gray-600 mt-2">
                  All fields marked with * are required.
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Personal Info */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                      <UserPlus className="w-5 h-5 mr-3 text-blue-600" /> Personal Information
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* First Name */}
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">First Name *</label>
                        <Input
                          name="firstName"
                          type="text"
                          placeholder="Enter your first name"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className={`h-12 text-base ${errors.firstName ? "border-red-500" : "border-gray-300"}`}
                          required
                        />
                        {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                      </div>

                      {/* Last Name */}
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Last Name *</label>
                        <Input
                          name="lastName"
                          type="text"
                          placeholder="Enter your last name"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className={`h-12 text-base ${errors.lastName ? "border-red-500" : "border-gray-300"}`}
                          required
                        />
                        {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                      </div>

                      {/* Email */}
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Email *</label>
                        <Input
                          name="email"
                          type="email"
                          placeholder="Enter your email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className={`h-12 text-base ${errors.email ? "border-red-500" : "border-gray-300"}`}
                          required
                        />
                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                      </div>

                      {/* Phone */}
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Phone *</label>
                        <Input
                          name="phone"
                          type="tel"
                          placeholder="Enter your phone number"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className={`h-12 text-base ${errors.phone ? "border-red-500" : "border-gray-300"}`}
                          required
                        />
                        {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                      </div>

                      {/* PAN Number */}
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">PAN Number *</label>
                        <Input
                          name="pan"
                          type="text"
                          placeholder="Enter your PAN number (e.g., ABCDE1234F)"
                          value={formData.pan}
                          onChange={handleInputChange}
                          className={`h-12 text-base ${errors.pan ? "border-red-500" : "border-gray-300"}`}
                          required
                        />
                        {errors.pan && <p className="text-red-500 text-sm mt-1">{errors.pan}</p>}
                      </div>

                      {/* Aadhar Number */}
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Aadhar Number *</label>
                        <Input
                          name="aadhar"
                          type="text"
                          placeholder="Enter your Aadhar number"
                          value={formData.aadhar}
                          onChange={handleInputChange}
                          className={`h-12 text-base ${errors.aadhar ? "border-red-500" : "border-gray-300"}`}
                          required
                        />
                        {errors.aadhar && <p className="text-red-500 text-sm mt-1">{errors.aadhar}</p>}
                      </div>
                    </div>
                  </div>

                  {/* About Section */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-gray-900">About Yourself</h3>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">About *</label>
                      <Textarea
                        name="about"
                        placeholder="Tell us about yourself, your experience, and why you want to join our team..."
                        value={formData.about}
                        onChange={handleInputChange}
                        className={`min-h-32 text-base ${errors.about ? "border-red-500" : "border-gray-300"}`}
                        required
                      />
                      {errors.about && <p className="text-red-500 text-sm mt-1">{errors.about}</p>}
                      <p className="text-sm text-gray-500 mt-2">
                        {formData.about.length}/500 characters
                      </p>
                    </div>
                  </div>

                  {/* Documents Section - Updated to match your theme */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                      <FileText className="w-5 h-5 mr-3 text-blue-600" /> Required Documents
                    </h3>
                    <div className="grid md:grid-cols-3 gap-6">
                      {/* PAN Card */}
                      <div className="border border-gray-200 rounded-xl p-6 bg-white hover:border-blue-300 transition-colors">
                        <label className="w-full flex flex-col items-center cursor-pointer">
                          <Input
                            type="file"
                            accept="application/pdf,image/jpeg,image/png"
                            onChange={(e) => handleFileChange(e, "panCard")}
                            className="hidden"
                            id="panCard"
                          />
                          <Button 
                            variant="outline" 
                            size="lg" 
                            className="w-full h-14 border-2 border-dashed border-gray-300 hover:border-blue-400 bg-gray-50"
                            asChild
                          >
                            <span className="flex flex-col items-center gap-2">
                              <Upload className="w-5 h-5 text-gray-600" />
                              <span className="text-sm font-medium text-gray-700">PAN Card</span>
                            </span>
                          </Button>
                          {files.panCard && (
                            <p className="text-sm text-green-600 mt-3 font-medium text-center">
                              ✓ {files.panCard.name}
                            </p>
                          )}
                        </label>
                        <p className="text-xs text-gray-500 mt-3 text-center">PDF, JPG or PNG (Max 5MB)</p>
                      </div>

                      {/* Aadhar Card */}
                      <div className="border border-gray-200 rounded-xl p-6 bg-white hover:border-blue-300 transition-colors">
                        <label className="w-full flex flex-col items-center cursor-pointer">
                          <Input
                            type="file"
                            accept="application/pdf,image/jpeg,image/png"
                            onChange={(e) => handleFileChange(e, "aadharCard")}
                            className="hidden"
                            id="aadharCard"
                          />
                          <Button 
                            variant="outline" 
                            size="lg" 
                            className="w-full h-14 border-2 border-dashed border-gray-300 hover:border-blue-400 bg-gray-50"
                            asChild
                          >
                            <span className="flex flex-col items-center gap-2">
                              <Upload className="w-5 h-5 text-gray-600" />
                              <span className="text-sm font-medium text-gray-700">Aadhar Card</span>
                            </span>
                          </Button>
                          {files.aadharCard && (
                            <p className="text-sm text-green-600 mt-3 font-medium text-center">
                              ✓ {files.aadharCard.name}
                            </p>
                          )}
                        </label>
                        <p className="text-xs text-gray-500 mt-3 text-center">PDF, JPG or PNG (Max 5MB)</p>
                      </div>

                      {/* Resume/CV */}
                      <div className="border border-gray-200 rounded-xl p-6 bg-white hover:border-blue-300 transition-colors">
                        <label className="w-full flex flex-col items-center cursor-pointer">
                          <Input
                            type="file"
                            accept="application/pdf,image/jpeg,image/png"
                            onChange={(e) => handleFileChange(e, "resumeCv")}
                            className="hidden"
                            id="resumeCv"
                          />
                          <Button 
                            variant="outline" 
                            size="lg" 
                            className="w-full h-14 border-2 border-dashed border-gray-300 hover:border-blue-400 bg-gray-50"
                            asChild
                          >
                            <span className="flex flex-col items-center gap-2">
                              <Upload className="w-5 h-5 text-gray-600" />
                              <span className="text-sm font-medium text-gray-700">Resume/CV</span>
                            </span>
                          </Button>
                          {files.resumeCv && (
                            <p className="text-sm text-green-600 mt-3 font-medium text-center">
                              ✓ {files.resumeCv.name}
                            </p>
                          )}
                        </label>
                        <p className="text-xs text-gray-500 mt-3 text-center">PDF, JPG or PNG (Max 5MB)</p>
                      </div>
                    </div>
                  </div>

                  {/* Submit Section */}
                  <div className="space-y-6 pt-4">
                    <div className="flex items-start space-x-3">
                      <input type="checkbox" id="terms" className="mt-1" required />
                      <label htmlFor="terms" className="text-sm text-gray-600 leading-relaxed">
                        I agree to the terms and conditions and consent to background verification.
                      </label>
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold"
                    >
                      Submit Application <UserPlus className="w-5 h-5 ml-3" />
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