import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Phone, Mail, Clock, MessageCircle, Send } from "lucide-react";
import Navigation from "@/components/Navigation";
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";

const Contact = () => {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const contactInfo = [
    {
      icon: MapPin,
      title: "Visit Our Office",
      details: ["40-14-3/1, Chandramoulipuram", "Near Benz Circle, Vijayawada", "Andhra Pradesh, India - 520010"],
    },
    {
      icon: Phone,
      title: "Call Us",
      details: ["+91 9876543210", "+91 8765432109", "Available 9 AM - 8 PM"],
      phoneNumbers: ["+91 9876543210", "+91 8765432109"]
    },
    {
      icon: Mail,
      title: "Email Us",
      details: ["investments@kapilbusinesspark.com", "support@kapilbusinesspark.com", "Quick response guaranteed"],
      emails: ["investments@kapilbusinesspark.com", "support@kapilbusinesspark.com"]
    }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Basic validation
    if (!formData.full_name || !formData.email || !formData.phone) {
      toast({ title: "Error", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("http://localhost:8000/api/contact-inquiry/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to submit inquiry");
      }

      const result = await response.json();
      console.log("Inquiry submitted:", result);
      toast({ title: "Success", description: "Your inquiry has been submitted successfully!" });

      // Reset form
      setFormData({
        full_name: "",
        email: "",
        phone: "",
        message: "",
      });
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({ title: "Error", description: "There was an issue submitting your inquiry. Please try again.", variant: "destructive" });
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
      
      <div className="pt-20 pb-12">
        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
              Get In Touch
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 glow-text">
              Ready to Invest?
              <span className="text-primary block">Connect With Us!</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Own your smart income-generating asset today. Benefit from personalized guidance 
              by our support team remotely. Make your aspirational move today!
            </p>
          </div>
        </section>

        {/* Contact Information */}
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              {contactInfo.map((info, index) => {
                const Icon = info.icon;
                return (
                  <div key={index} className={`card-luxury p-8 text-center animate-fade-in`} style={{animationDelay: `${index * 200}ms`}}>
                    <div className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-6">
                      <Icon className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold mb-4 text-foreground">{info.title}</h3>
                    <div className="space-y-2">
                      {info.details.map((detail, idx) => {
                        // Check if this detail is a phone number
                        if (info.phoneNumbers && info.phoneNumbers.includes(detail)) {
                          return (
                            <p key={idx} className="text-muted-foreground">
                              <button 
                                onClick={() => handlePhoneClick(detail)}
                                className="text-primary hover:text-primary/80 underline transition-colors"
                              >
                                {detail}
                              </button>
                            </p>
                          );
                        }
                        // Check if this detail is an email
                        if (info.emails && info.emails.includes(detail)) {
                          return (
                            <p key={idx} className="text-muted-foreground">
                              <button 
                                onClick={() => handleEmailClick(detail)}
                                className="text-primary hover:text-primary/80 underline transition-colors"
                              >
                                {detail}
                              </button>
                            </p>
                          );
                        }
                        // Regular text
                        return (
                          <p key={idx} className="text-muted-foreground">{detail}</p>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Contact Form & Map */}
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <div className="animate-fade-in">
                <Card className="card-luxury border-0 shadow-none">
                  <CardHeader>
                    <CardTitle className="text-2xl font-bold glow-text">
                      Explore Investment Plans
                    </CardTitle>
                    <p className="text-muted-foreground">
                      Fill out the form below and we'll get back to you within 24 hours with detailed investment information.
                    </p>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-foreground mb-2 block">
                            Full Name *
                          </label>
                          <Input
                            name="full_name"
                            placeholder="Enter your full name"
                            className="bg-background border-border"
                            required
                            value={formData.full_name}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-foreground mb-2 block">
                            Email Id *
                          </label>
                          <Input
                            name="email"
                            type="email"
                            placeholder="Enter your email"
                            className="bg-background border-border"
                            required
                            value={formData.email}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">
                          Country code & Phone number *
                        </label>
                        <Input
                          name="phone"
                          type="tel"
                          placeholder="e.g., +91 98765 43210"
                          className="bg-background border-border"
                          required
                          value={formData.phone}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">
                          Message
                        </label>
                        <Textarea
                          name="message"
                          placeholder="Tell us about your investment goals and any questions you have about Kapil Business Park..."
                          rows={5}
                          className="bg-background border-border resize-none"
                          value={formData.message}
                          onChange={handleInputChange}
                        />
                      </div>

                      <Button type="submit" variant="luxury" className="w-full" disabled={isSubmitting}>
                        <Send className="w-4 h-4 mr-2" />
                        {isSubmitting ? "Submitting..." : "Send Inquiry"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* Information & Quick Contact */}
              <div className="space-y-8 animate-fade-in" style={{animationDelay: "400ms"}}>
                {/* Investment Info */}
                <Card className="card-luxury border-0 shadow-none">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-4 text-foreground">Investment Summary</h3>
                    <div className="space-y-4">
                      <div className="bg-primary/10 p-4 rounded-lg">
                        <h4 className="font-medium text-primary mb-2">Starting Investment</h4>
                        <p className="text-2xl font-bold text-primary">₹36,00,000</p>
                        <p className="text-sm text-muted-foreground">Minimum booking advance: ₹2,00,000</p>
                      </div>
                      
                      <div className="bg-accent/10 p-4 rounded-lg">
                        <h4 className="font-medium text-accent mb-2">Expected Returns</h4>
                        <p className="text-2xl font-bold text-accent">Up to 18%* p.a.</p>
                        <p className="text-sm text-muted-foreground">*Terms and conditions apply</p>
                      </div>
                      
                      <div className="bg-secondary/10 p-4 rounded-lg">
                        <h4 className="font-medium text-secondary mb-2">Rental Formula</h4>
                        <p className="text-lg font-bold text-secondary">₹225 × sq.ft</p>
                        <p className="text-sm text-muted-foreground">Monthly rental calculation</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Contact Options */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-foreground">Quick Contact</h3>
                  
                  <div className="space-y-3">
                    <Button 
                      variant="outline-luxury" 
                      className="w-full justify-start" 
                      size="lg"
                      onClick={() => handlePhoneClick("+91 9876543210")}
                    >
                      <Phone className="w-5 h-5 mr-3" />
                      Call for Investment Details
                    </Button>
                    
                    <Button 
                      variant="outline-luxury" 
                      className="w-full justify-start" 
                      size="lg"
                      onClick={() => window.open("https://wa.me/+919876543210", "_blank")}
                    >
                      <MessageCircle className="w-5 h-5 mr-3" />
                      WhatsApp Inquiry
                    </Button>
                    
                    <Button 
                      variant="outline-luxury" 
                      className="w-full justify-start" 
                      size="lg"
                      onClick={() => handleEmailClick("investments@kapilbusinesspark.com")}
                    >
                      <Mail className="w-5 h-5 mr-3" />
                      Email Investment Team
                    </Button>
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
