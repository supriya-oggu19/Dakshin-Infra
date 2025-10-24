import { useState, useEffect } from "react";
import { Building2, MapPin, Phone, Mail, ArrowRight, Facebook, Twitter, Linkedin, Instagram } from "lucide-react";

const Footer = () => {
  const [contactInfo, setContactInfo] = useState({
    phones: [],
    emails: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8001/api/contactInfo/all");
        const data = await response.json();
        
        const activeContacts = data.filter(contact => contact.is_active);
        const phones = activeContacts.filter(contact => contact.contact_type === "phone");
        const emails = activeContacts.filter(contact => contact.contact_type === "email");
        
        phones.sort((a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0));
        emails.sort((a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0));
        
        setContactInfo({ phones, emails });
      } catch (error) {
        console.error("Failed to fetch contact info:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchContactInfo();
  }, []);

  const NavLink = ({ href, children, className = "" }) => (
    <a href={href} className={className}>{children}</a>
  );

  return (
    <footer className="relative bg-gradient-to-br from-yellow-100 via-yellow-50 to-yellow-100 text-black overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-200 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-yellow-300 rounded-full filter blur-3xl"></div>
      </div>

      <div className="relative">
        {/* Main Footer Content */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          {/* Top Section - Company Branding */}
          <div className="mb-12 pb-12 border-b border-gray-200 opacity-0 animate-slide-up">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
              <div className="max-w-2xl">
                <a href="/" className="inline-flex items-center space-x-3 mb-4 group">
                  <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center shadow-2xl transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    <Building2 className="w-8 h-8 text-white" />
                  </div>
                  <span className="text-2xl sm:text-3xl font-bold">
                    Ramya <span className="text-yellow-600">Constructions</span>
                  </span>
                </a>
                <p className="text-black text-base sm:text-lg leading-relaxed max-w-xl">
                  Redefining modern business infrastructure and investment opportunities in Hyderabad with excellence and integrity.
                </p>
              </div>
              
              {/* Social Media */}
              <div className="flex gap-3">
                {[
                  { icon: Facebook, href: "#" },
                  { icon: Twitter, href: "#" },
                  { icon: Linkedin, href: "#" },
                  { icon: Instagram, href: "#" }
                ].map((social, idx) => (
                  <a
                    key={idx}
                    href={social.href}
                    className="w-12 h-12 bg-gray-100 hover:bg-yellow-400 rounded-xl flex items-center justify-center transition-all duration-300 transform hover:scale-110 hover:-translate-y-1 group"
                  >
                    <social.icon className="w-5 h-5 text-black group-hover:text-white transition-colors" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Links Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12 mb-12">
            {/* Company Info */}
            <div className="lg:col-span-4 opacity-0 animate-slide-up" style={{ animationDelay: "0.1s" }}>
              <h4 className="text-lg font-bold text-black mb-6 uppercase tracking-wider">Company Details</h4>
              <div className="space-y-3 text-sm text-black">
                <div className="p-4 bg-gray-50/50 rounded-lg backdrop-blur-sm border border-gray-200">
                  <p className="font-semibold text-black mb-2">Ramya Constructions Ltd.</p>
                  <p className="text-xs text-black">CIN: U45200AP1992PLC014532</p>
                  <p className="text-xs text-black">Incorporated: 17th December 1992</p>
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-yellow-600 font-medium">RERA Approved Project</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="lg:col-span-2 opacity-0 animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <h4 className="text-lg font-bold text-black mb-6 uppercase tracking-wider">Explore</h4>
              <div className="space-y-3">
                {[
                  { name: "About Us", href: "/about" },
                  { name: "Projects", href: "/projects" },
                  { name: "Investment", href: "/projects/1" },
                  { name: "FAQ", href: "/faq" },
                  { name: "Contact", href: "/contact" },
                ].map((link, index) => (
                  <NavLink
                    key={index}
                    href={link.href}
                    className="flex items-center group text-black hover:text-yellow-600 transition-all duration-300"
                  >
                    <ArrowRight className="w-4 h-4 mr-2 transform group-hover:translate-x-1 transition-transform" />
                    <span className="text-sm">{link.name}</span>
                  </NavLink>
                ))}
              </div>
            </div>

            {/* Legal */}
            <div className="lg:col-span-2 opacity-0 animate-slide-up" style={{ animationDelay: "0.3s" }}>
              <h4 className="text-lg font-bold text-black mb-6 uppercase tracking-wider">Legal</h4>
              <div className="space-y-3">
                {[
                  { name: "Privacy Policy", href: "/privacy" },
                  { name: "Terms", href: "/terms" },
                  { name: "Disclaimer", href: "/disclaimer" },
                  { name: "RERA Details", href: "/rera" },
                ].map((link, index) => (
                  <NavLink
                    key={index}
                    href={link.href}
                    className="flex items-center group text-black hover:text-yellow-600 transition-all duration-300"
                  >
                    <ArrowRight className="w-4 h-4 mr-2 transform group-hover:translate-x-1 transition-transform" />
                    <span className="text-sm">{link.name}</span>
                  </NavLink>
                ))}
              </div>
            </div>

            {/* Contact Info */}
            <div className="lg:col-span-4 opacity-0 animate-slide-up" style={{ animationDelay: "0.4s" }}>
              <h4 className="text-lg font-bold text-black mb-6 uppercase tracking-wider">Get In Touch</h4>
              <div className="space-y-4">
                {loading ? (
                  <div className="flex items-center justify-center p-4 bg-gray-50/30 rounded-lg">
                    <div className="w-5 h-5 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="ml-3 text-sm text-black">Loading...</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Address */}
                    <div className="flex items-start space-x-3 p-4 bg-gray-50/30 rounded-lg border border-gray-200/50 hover:border-yellow-600/50 transition-all duration-300">
                      <MapPin className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-black leading-relaxed">
                        <p>Survey 115/1, ISB Rd, Financial District</p>
                        <p>Gachibowli, Hyderabad, Nanakramguda</p>
                        <p>Telangana - 500032</p>
                      </div>
                    </div>

                    {/* Phone Numbers */}
                    {contactInfo.phones.length > 0 && (
                      <div className="space-y-2">
                        {contactInfo.phones.map((phone) => (
                          <a
                            key={phone.id}
                            href={`tel:${phone.contact_value}`}
                            className="flex items-center space-x-3 p-3 bg-gray-50/30 rounded-lg border border-gray-200/50 hover:border-yellow-600/50 hover:bg-gray-50/50 transition-all duration-300 group"
                          >
                            <Phone className="w-5 h-5 text-yellow-600 flex-shrink-0 group-hover:scale-110 transition-transform" />
                            <span className="text-sm text-black group-hover:text-yellow-600 transition-colors">
                              {phone.contact_value}
                            </span>
                          </a>
                        ))}
                      </div>
                    )}

                    {/* Email Addresses */}
                    {contactInfo.emails.length > 0 && (
                      <div className="space-y-2">
                        {contactInfo.emails.map((email) => (
                          <a
                            key={email.id}
                            href={`mailto:${email.contact_value}`}
                            className="flex items-center space-x-3 p-3 bg-gray-50/30 rounded-lg border border-gray-200/50 hover:border-yellow-600/50 hover:bg-gray-50/50 transition-all duration-300 group"
                          >
                            <Mail className="w-5 h-5 text-yellow-600 flex-shrink-0 group-hover:scale-110 transition-transform" />
                            <span className="text-sm text-black group-hover:text-yellow-600 transition-colors break-all">
                              {email.contact_value}
                            </span>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 bg-gray-50/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 opacity-0 animate-slide-up" style={{ animationDelay: "0.5s" }}>
              <div className="text-sm text-black text-center md:text-left">
                <p>&copy; 2024 Ramya Constructions Ltd. All rights reserved.</p>
              </div>
              <div className="flex flex-wrap justify-center gap-6 text-xs text-black">
                <span>RERA Approved</span>
                <span className="hidden sm:inline">•</span>
                <span>Returns subject to T&C</span>
                <span className="hidden sm:inline">•</span>
                <span>ISO Certified</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slide-up {
          animation: slide-up 0.8s ease-out forwards;
        }
      `}</style>
    </footer>
  );
};

export default Footer;