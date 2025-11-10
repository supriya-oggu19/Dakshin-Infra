import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Phone, Mail, Send, MessageCircle } from "lucide-react";
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
    details: ["Survey 115/1, Kapil Towers, ISB Rd , Financial District, Gachibowli, Hyderabad, Nanakramguda, Telangana 500032"],
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
            details: ["Survey 115/1, ISB Rd, Kapil Towers, Financial District, Gachibowli, Hyderabad, Nanakramguda, Telangana 500032"],
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
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="pt-16 md:pt-20">
        {/* Hero Section */}
        <section className="py-16 md:py-24 px-4 md:px-6 text-center">
          <div className="max-w-4xl mx-auto">
            <Badge className="mb-4 text-sm md:text-base bg-primary/20 text-primary border-primary/30 px-4 py-1.5">
              Get In Touch
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-5 leading-tight">
              Ready to Invest?
              <span className="block text-primary mt-2">Let’s Connect!</span>
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Secure your income-generating asset with expert guidance. Our team is here to help you every step of the way.
            </p>
          </div>
        </section>

        {/* Contact Info Cards */}
        <section className="py-12 md:py-16 px-4 md:px-6 bg-muted/30">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {contactInfo.map((info, index) => {
                const Icon = info.icon;
                return (
                  <Card
                    key={index}
                    className="card-luxury border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] text-center p-6 md:p-8"
                  >
                    <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-5">
                      <Icon className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold mb-4 text-foreground">{info.title}</h3>
                    <div className="space-y-2 text-sm md:text-base">
                      {info.details.map((detail, idx) => {
                        const isPhone = info.phoneNumbers?.includes(detail);
                        const isEmail = info.emails?.includes(detail);

                        if (isPhone) {
                          return (
                            <button
                              key={idx}
                              onClick={() => handlePhoneClick(detail)}
                              className="block w-full text-primary hover:text-primary/80 underline font-medium transition-colors"
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
                              className="block w-full text-primary hover:text-primary/80 underline font-medium transition-colors break-all"
                            >
                              {detail}
                            </button>
                          );
                        }
                        return (
                          <p key={idx} className="text-muted-foreground">{detail}</p>
                        );
                      })}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Form + Sidebar */}
        <section className="py-16 md:py-20 px-4 md:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
              {/* Contact Form */}
              <div className="lg:col-span-3">
                <Card className="card-luxury border-0 shadow-lg">
                  <CardHeader className="text-center md:text-left pb-6">
                    <CardTitle className="relative inline-block text-2xl md:text-3xl font-bold mb-3">
                      <span className="relative z-10 bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
                        Explore Investment Plans
                      </span>

                      {/* Glowing Underline */}
                      <span className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 via-accent to-primary/50 rounded-full blur-md"></span>
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary to-accent rounded-full"></span>
                    </CardTitle>

                    <p className="text-muted-foreground text-sm md:text-base">
                      Submit your details and receive personalized investment options within 24 hours.
                    </p>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-foreground flex items-center">
                            Full Name <span className="text-destructive ml-1">*</span>
                          </label>
                          <Input
                            name="full_name"
                            placeholder="Enter Name"
                            className="h-12 bg-background"
                            value={formData.full_name}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-foreground flex items-center">
                            Email <span className="text-destructive ml-1">*</span>
                          </label>
                          <Input
                            name="email"
                            type="email"
                            placeholder="Enter your email address"
                            className="h-12 bg-background"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground flex items-center">
                          Phone Number <span className="text-destructive ml-1">*</span>
                        </label>
                        <Input
                          name="phone"
                          type="tel"
                          placeholder="+91-XXXXX-XXXXX"
                          className="h-12 bg-background"
                          value={formData.phone}
                          onChange={handleInputChange}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">
                          Message (Optional)
                        </label>
                        <Textarea
                          name="message"
                          placeholder="Tell us about your investment goals..."
                          rows={4}
                          className="resize-none bg-background"
                          value={formData.message}
                          onChange={handleInputChange}
                        />
                      </div>

                      <Button
                        type="submit"
                        variant="luxury"
                        className="w-full h-14 text-lg font-semibold"
                        disabled={isSubmitting}
                      >
                        <Send className="w-5 h-5 mr-2" />
                        {isSubmitting ? "Sending..." : "Send Inquiry"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* Investment Sidebar */}
              <div className="lg:col-span-2">
                <Card className="card-luxury border-0 shadow-lg lg:sticky lg:top-24">
                  <CardContent className="p-6 space-y-7">
                    <div className="pt-4 border-t border-border">
                      <h4 className="font-semibold text-foreground mb-4 text-center md:text-left">
                        Quick Actions
                      </h4>
                      <div className="space-y-3">
                        {/* Call Button */}
                        <Button
                          variant="outline-luxury"
                          className="w-full justify-start h-12"
                          onClick={() => (window.location.href = "tel:9289657657")}
                        >
                          <Phone className="w-5 h-5 mr-3" />
                          Call Now
                        </Button>

                        {/* Email Button */}
                        <Button
                          variant="outline-luxury"
                          className="w-full justify-start h-12"
                          onClick={() => (window.location.href = "mailto:info@ramyaconstructions.com")}
                        >
                          <Mail className="w-5 h-5 mr-3" />
                          Send Email
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Contact;