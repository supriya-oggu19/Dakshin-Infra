// components/Footer.tsx
import { useState, useEffect } from "react";
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  ArrowUp,
} from "lucide-react";

import { contactInfoApi } from "../api/contactInfoApi";
import { ContactInfo } from "../api/models/contactInfo.model";

const Footer = () => {
  const [contactInfo, setContactInfo] = useState<{
    phones: ContactInfo[];
    emails: ContactInfo[];
  }>({ phones: [], emails: [] });
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const loadContacts = async () => {
      try {
        const { data } = await contactInfoApi.getAll();
        const active = data.filter((c) => c.is_active);

        const phones = active
          .filter((c) => c.contact_type === "phone")
          .sort((a, b) => Number(b.is_primary) - Number(a.is_primary));

        const emails = active
          .filter((c) => c.contact_type === "email")
          .sort((a, b) => Number(b.is_primary) - Number(a.is_primary));

        setContactInfo({ phones, emails });
      } catch (err) {
        console.error("Failed to fetch contact info:", err);
      } finally {
        setLoading(false);
      }
    };

    loadContacts();
  }, []);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const quickLinks = [
    { name: "About Us", href: "/about" },
    { name: "Projects", href: "/projects" },
    { name: "FAQ", href: "/faq" },
    { name: "Contact", href: "/contact" },
  ];

  const legalLinks = [
    { name: "Privacy Policy", href: "/privacy-policy" },
    { name: "Terms & Conditions", href: "/terms" },
    { name: "Refund Policy", href: "/refund-policy" },
  ];

  const socialLinks = [
    { icon: Facebook, href: "#", color: "hover:bg-blue-500" },
    { icon: Twitter, href: "#", color: "hover:bg-sky-400" },
    { icon: Linkedin, href: "#", color: "hover:bg-blue-600" },
    { icon: Instagram, href: "#", color: "hover:bg-pink-500" },
  ];

  return (
    <footer className="relative bg-gradient-to-br from-slate-50 to-gray-100 border-t border-gray-200">
      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-8 right-8 w-12 h-12 bg-blue-600 hover:bg-blue-500 rounded-full flex items-center justify-center transition-all duration-300 z-50 shadow-2xl ${
          isVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-10 pointer-events-none"
        }`}
      >
        <ArrowUp className="w-6 h-6 text-white" />
      </button>

      {/* Main Content */}
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column - Brand & Description */}
          <div className="space-y-8">
            <div className="flex items-center space-x-4 group">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl group-hover:scale-105 transition-transform duration-300">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900">
                  Dakshin Infra Structures
                </h2>
                <p className="text-blue-600 font-medium text-sm mt-1">
                  Building Tomorrow's Landmarks
                </p>
              </div>
            </div>

            <p className="text-gray-600 leading-relaxed text-lg max-w-md">
              Redefining modern infrastructure and investment opportunities in
              Hyderabad with excellence, innovation, and unwavering integrity.
            </p>

            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className={`w-12 h-12 bg-white border border-gray-200 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-sm ${social.color}`}
                >
                  <social.icon className="w-5 h-5 text-gray-600 hover:text-white transition-colors" />
                </a>
              ))}
            </div>
          </div>

          {/* Right Column - Links & Contact */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-300">
                Quick Links
              </h3>
              <ul className="space-y-3">
                {quickLinks.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      className="text-gray-600 hover:text-blue-600 transition-all duration-300 hover:translate-x-2 flex items-center group font-medium"
                    >
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-3 group-hover:bg-blue-600 transition-colors" />
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Policies */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-300">
                Policies
              </h3>
              <ul className="space-y-3">
                {legalLinks.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      className="text-gray-600 hover:text-blue-600 transition-all duration-300 hover:translate-x-2 flex items-center group font-medium"
                    >
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-3 group-hover:bg-blue-600 transition-colors" />
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-300">
                Contact
              </h3>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((n) => (
                    <div
                      key={n}
                      className="h-4 bg-gray-300 rounded animate-pulse"
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-start space-x-3 group">
                    <MapPin className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0 group-hover:scale-110 transition-transform" />
                    <p className="text-gray-600 text-sm leading-relaxed group-hover:text-gray-900 transition-colors">
                      Kapil Towers, Survey 115/1, ISB Rd, Financial District,
                      Gachibowli, Hyderabad, Telangana - 500032
                    </p>
                  </div>

                  {/* Phones */}
                  {contactInfo.phones.length > 0 ? (
                    <div className="space-y-2">
                      {contactInfo.phones.map((phone) => (
                        <a
                          key={phone.id}
                          href={`tel:${phone.contact_value}`}
                          className="flex items-center space-x-3 text-gray-600 hover:text-blue-600 transition-all duration-300 group font-medium"
                        >
                          <Phone className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform" />
                          <span className="text-sm">{phone.contact_value}</span>
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No phone numbers available</p>
                  )}

                  {/* Emails */}
                  {contactInfo.emails.length > 0 ? (
                    <div className="space-y-2">
                      {contactInfo.emails.map((email) => (
                        <a
                          key={email.id}
                          href={`mailto:${email.contact_value}`}
                          className="flex items-center space-x-3 text-gray-600 hover:text-blue-600 transition-all duration-300 group font-medium"
                        >
                          <Mail className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform" />
                          <span className="text-sm">{email.contact_value}</span>
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No emails available</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Company Info Bar */}
        <div className="mt-12 pt-8 border-t border-gray-300">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
            <div className="text-center lg:text-left">
              <p className="text-gray-700 font-semibold">
                Dakshin Infra Structures Pvt Ltd.
              </p>
              <p className="text-gray-600 text-sm mt-1">
                CIN: U45200AP1992PLC014532 • Incorporated: 17th Dec 1992
              </p>
            </div>
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-2 rounded-full shadow-lg">
              <span className="text-white font-medium text-sm">
                🏢 RERA Approved & Registered
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="bg-white border-t border-gray-300">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-3 md:space-y-0">
            <div className="text-center md:text-left">
              <p className="text-gray-600 text-sm">
                © 2024 Dakshin Infra Structures Pvt Ltd. All rights reserved.
              </p>
            </div>
            <div className="flex space-x-6 text-gray-600 text-sm">
              <a
                href="/privacy-policy"
                className="hover:text-blue-600 transition-colors duration-200 hover:underline font-medium"
              >
                Privacy
              </a>
              <a
                href="/terms"
                className="hover:text-blue-600 transition-colors duration-200 hover:underline font-medium"
              >
                Terms
              </a>
              <a
                href="/refund-policy"
                className="hover:text-blue-600 transition-colors duration-200 hover:underline font-medium"
              >
                Refunds
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;