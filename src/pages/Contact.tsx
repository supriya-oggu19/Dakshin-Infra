import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Phone, Mail, Send, MessageCircle, Clock, Users, Building2 } from "lucide-react";
import Navigation from "@/components/Navigation";
import { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import { contactApi } from "@/api/contactApi";
import { contactInfoApi } from "@/api/contactInfoApi";
import { ContactInfo } from "@/api/models/contactInfo.model";

const Contact = () => {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contactInfo, setContactInfo] = useState([{
    icon: MapPin,
    title: "Visit Our Office",
    details: [" Kapil Towers, Survey 115/1 ,  ISB Rd , Financial District, Gachibowli, Hyderabad, Nanakramguda, Telangana 500032"],
  },
  {
    icon: Phone,
    title: "Call Us",
    details: [],
    phoneNumbers: [],
  },
  {
    icon: Mail,
    title: "Email Us",
    details: [],
    emails: [],
  },
  ]);

  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        const response = await contactInfoApi.getAll();
        const fetchedContacts: ContactInfo[] = response.data;

        const activePhones = fetchedContacts
          .filter((contact) => contact.contact_type === "phone" && contact.is_active)
          .map((contact) => ({
            value: contact.contact_value,
            label: contact.label || "Phone",
          }));

        const activeEmails = fetchedContacts
          .filter((contact) => contact.contact_type === "email" && contact.is_active)
          .map((contact) => ({
            value: contact.contact_value,
            label: contact.label || "Email",
          }));

        setContactInfo([
          {
            icon: MapPin,
            title: "Visit Our Office",
            details: [" Kapil Towers , Survey 115/1, ISB Rd, Financial District, Gachibowli, Hyderabad, Nanakramguda, Telangana 500032"],
          },
          {
            icon: Phone,
            title: "Call Us",
            details: [...activePhones.map((phone) => phone.value), ""],
            phoneNumbers: activePhones.map((phone) => phone.value),
          },
          {
            icon: Mail,
            title: "Email Us",
            details: [...activeEmails.map((email) => email.value),],
            emails: activeEmails.map((email) => email.value),
          },
        ]);
      } catch (error) {
        console.error("Error fetching contact info:", error);
        toast({
          title: "Error",
          description: "Failed to load contact information.",
          variant: "destructive",
        });
      }
    };

    fetchContactInfo();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!formData.full_name || !formData.email || !formData.phone) {
      toast({ title: "Error", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await contactApi.createInquiry(formData);
      toast({ title: "Success", description: "Your inquiry has been submitted successfully!" });
      setFormData({ full_name: "", email: "", phone: "", message: "" });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhoneClick = (phoneNumber: string) => {
    window.location.href = `tel:${phoneNumber}`;
  };

  const handleEmailClick = (email: string) => {
    window.location.href = `mailto:${email}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Navigation />

      <div className="pt-16 md:pt-20">
        {/* Hero Section */}
        <section className="py-16 md:py-24 px-4 md:px-6 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-72 h-72 bg-blue-200/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>
          
          <div className="max-w-4xl mx-auto relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-blue-200/50 px-6 py-3 rounded-full mb-6">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
              <span className="text-blue-700 font-semibold text-sm uppercase tracking-wider">
                Get In Touch
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-5 leading-tight">
              <span className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-800 bg-clip-text text-transparent">
                Ready to Invest?
              </span>
              <span className="block bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent mt-2">
                Let's Connect!
              </span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-light">
              Secure your income-generating asset with expert guidance. Our team is here to help you every step of the way.
            </p>
          </div>
        </section>

        {/* Contact Info Cards */}
        <section className="py-12 md:py-16 px-4 md:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {contactInfo.map((info, index) => {
                const Icon = info.icon;
                return (
                  <div
                    key={index}
                    className="group bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-white/50 shadow-lg hover:shadow-2xl transition-all duration-500 hover:transform hover:-translate-y-2 animate-slide-in-up"
                    style={{ animationDelay: `${index * 150}ms` }}
                  >
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold mb-4 text-slate-900 text-center">{info.title}</h3>
                    <div className="space-y-3 text-sm md:text-base">
                      {info.details.map((detail, idx) => {
                        const isPhone = info.phoneNumbers?.includes(detail);
                        const isEmail = info.emails?.includes(detail);

                        if (isPhone) {
                          return (
                            <button
                              key={idx}
                              onClick={() => handlePhoneClick(detail)}
                              className="block w-full text-blue-600 hover:text-blue-700 font-medium transition-colors duration-300 hover:underline"
                            >
                              {detail}
                            </button>
                          );
                        }
                        if (isEmail) {
                          return (
                            <button
                              key={idx}
                              onClick={() => handleEmailClick(detail)}
                              className="block w-full text-blue-600 hover:text-blue-700 font-medium transition-colors duration-300 hover:underline break-all"
                            >
                              {detail}
                            </button>
                          );
                        }
                        return (
                          <p key={idx} className="text-slate-600 leading-relaxed text-center">{detail}</p>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Form + Sidebar */}
        <section className="py-16 md:py-20 px-4 md:px-6 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50/50 via-blue-50/50 to-indigo-100/50"></div>
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
              {/* Contact Form */}
              <div className="lg:col-span-3">
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-white/50 shadow-2xl hover:shadow-3xl transition-all duration-500 animate-fade-in-up">
                  <div className="p-8 md:p-12">
                    <div className="text-center md:text-left mb-8">
                      <div className="inline-flex items-center gap-3 bg-blue-100/80 backdrop-blur-sm border border-blue-200/50 px-6 py-3 rounded-full mb-6">
                        <MessageCircle className="w-4 h-4 text-blue-600" />
                        <span className="text-blue-700 font-semibold text-sm uppercase tracking-wider">
                          Investment Inquiry
                        </span>
                      </div>
                      <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-slate-900 to-blue-700 bg-clip-text text-transparent">
                        Explore Investment Plans
                      </h2>
                      <p className="text-lg text-slate-600 font-light">
                        Submit your details and receive personalized investment options within 24 hours.
                      </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <label className="text-sm font-semibold text-slate-700 flex items-center">
                            Full Name <span className="text-red-500 ml-1">*</span>
                          </label>
                          <Input
                            name="full_name"
                            placeholder="Enter your full name"
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 outline-none"
                            value={formData.full_name}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div className="space-y-3">
                          <label className="text-sm font-semibold text-slate-700 flex items-center">
                            Email <span className="text-red-500 ml-1">*</span>
                          </label>
                          <Input
                            name="email"
                            type="email"
                            placeholder="Enter your email address"
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 outline-none"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="text-sm font-semibold text-slate-700 flex items-center">
                          Phone Number <span className="text-red-500 ml-1">*</span>
                        </label>
                        <Input
                          name="phone"
                          type="tel"
                          placeholder="+91-XXXXX-XXXXX"
                          className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 outline-none"
                          value={formData.phone}
                          onChange={handleInputChange}
                          required
                        />
                      </div>

                      <div className="space-y-3">
                        <label className="text-sm font-semibold text-slate-700">
                          Message (Optional)
                        </label>
                        <Textarea
                          name="message"
                          placeholder="Tell us about your investment goals and preferences..."
                          rows={4}
                          className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 outline-none resize-none"
                          value={formData.message}
                          onChange={handleInputChange}
                        />
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 hover:shadow-2xl hover:scale-105 shadow-lg"
                        disabled={isSubmitting}
                      >
                        <Send className="w-5 h-5 mr-3" />
                        {isSubmitting ? "Sending Inquiry..." : "Send Inquiry"}
                      </Button>
                    </form>
                  </div>
                </div>
              </div>

              {/* Investment Sidebar */}
              <div className="lg:col-span-2">
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-white/50 shadow-2xl p-8 space-y-8 lg:sticky lg:top-24 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Building2 className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">Quick Connect</h3>
                    <p className="text-slate-600 font-light">Get immediate assistance from our investment experts</p>
                  </div>

                  <div className="space-y-4">
                    <Button
                      onClick={() => (window.location.href = "tel:9289657657")}
                      className="w-full bg-white border border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 h-14 text-base font-semibold transition-all duration-300 hover:scale-105"
                    >
                      <Phone className="w-5 h-5 mr-3" />
                      Call Now
                    </Button>

                    <Button
                      onClick={() => (window.location.href = "mailto:info@dakshininfrastructures.com")}
                      className="w-full bg-white border border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 h-14 text-base font-semibold transition-all duration-300 hover:scale-105"
                    >
                      <Mail className="w-5 h-5 mr-3" />
                      Send Email
                    </Button>
                  </div>

                  <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100">
                    <div className="flex items-center gap-3 mb-4">
                      <Clock className="w-5 h-5 text-blue-600" />
                      <h4 className="font-semibold text-slate-900">Response Time</h4>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      We typically respond to all inquiries within <span className="font-semibold text-blue-600">24 hours</span> during business days.
                    </p>
                  </div>

                  <div className="bg-green-50/50 rounded-2xl p-6 border border-green-100">
                    <div className="flex items-center gap-3 mb-4">
                      <Users className="w-5 h-5 text-green-600" />
                      <h4 className="font-semibold text-slate-900">Expert Support</h4>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Our dedicated investment consultants are available to guide you through every step.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Contact;