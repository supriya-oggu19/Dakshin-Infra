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
} from "lucide-react";

import { contactInfoApi } from "../api/contactInfoApi";   // adjust path if needed
import { ContactInfo } from "../api/models/contactInfo.model"; // adjust path if needed

const Footer = () => {
  const [contactInfo, setContactInfo] = useState<{
    phones: ContactInfo[];
    emails: ContactInfo[];
  }>({ phones: [], emails: [] });
  const [loading, setLoading] = useState(true);

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

  const quickLinks = [
    { name: "About Us", href: "/about" },
    { name: "Projects", href: "/projects" },
    { name: "Investment", href: "/projects/1" },
    { name: "FAQ", href: "/faq" },
    { name: "Contact", href: "/contact" },
  ];

  const legalLinks = [
    { name: "Privacy Policy", href: "/privacy-policy" },
    { name: "Terms & Conditions", href: "/terms" },
    { name: "Refund Policy", href: "/refund-policy" },
    { name: "Disclaimer", href: "/disclaimer" },
    { name: "RERA Details", href: "/rera" },
  ];

  return (
    <footer className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-t border-yellow-200">
      {/* Top Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        {/* 1. Brand & Social */}
        <div>
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-14 h-14 bg-yellow-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <span className="text-2xl font-bold">
              Ramya <span className="text-yellow-600">Constructions</span>
            </span>
          </div>
          <p className="text-gray-700 leading-relaxed mb-6">
            Redefining modern infrastructure and investment opportunities in
            Hyderabad with excellence and integrity.
          </p>
          <div className="flex space-x-4">
            {[
              { icon: Facebook, href: "#" },
              { icon: Twitter, href: "#" },
              { icon: Linkedin, href: "#" },
              { icon: Instagram, href: "#" },
            ].map((s, i) => (
              <a
                key={i}
                href={s.href}
                className="w-12 h-12 bg-yellow-500 hover:bg-yellow-600 rounded-full flex items-center justify-center transition-all duration-300 group shadow-md"
              >
                <s.icon className="w-6 h-6 text-white group-hover:scale-110 transition-transform duration-300" />
              </a>
            ))}
          </div>
        </div>

        {/* 2. Company Info */}
        <div>
          <h3 className="text-lg font-bold text-yellow-700 mb-4 uppercase tracking-wide">
            Company Details
          </h3>
          <div className="text-gray-700 text-sm space-y-2">
            <p className="font-semibold">Ramya Constructions Ltd.</p>
            <p>CIN: U45200AP1992PLC014532</p>
            <p>Incorporated: 17th Dec 1992</p>
            <p className="text-yellow-600 font-medium pt-2 border-t border-gray-200 mt-2">
              RERA Approved Project
            </p>
          </div>
        </div>

        {/* 3. Quick Links + Policies */}
        <div>
          <h3 className="text-lg font-bold text-yellow-700 mb-4 uppercase tracking-wide">
            Quick Links
          </h3>
          <ul className="space-y-2 text-sm text-gray-700">
            {quickLinks.map((link, i) => (
              <li key={i}>
                <a href={link.href} className="hover:text-yellow-600 transition-colors">
                  {link.name}
                </a>
              </li>
            ))}
          </ul>

          <div className="mt-8">
            <h3 className="text-lg font-bold text-yellow-700 mb-4 uppercase tracking-wide">
              Policies
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              {legalLinks.map((link, i) => (
                <li key={i}>
                  <a href={link.href} className="hover:text-yellow-600 transition-colors">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 4. Contact Info */}
        <div>
          <h3 className="text-lg font-bold text-yellow-700 mb-4 uppercase tracking-wide">
            Contact
          </h3>
          {loading ? (
            <p className="text-gray-500 text-sm">Loading contact info…</p>
          ) : (
            <div className="space-y-4 text-sm text-gray-700">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-yellow-600 mt-1 flex-shrink-0" />
                <p>
                  Survey 115/1, Kapil Towers, ISB Rd, Financial District, Gachibowli, Hyderabad,
                  Telangana - 500032
                </p>
              </div>

              {/* Phones */}
              {contactInfo.phones.length > 0 ? (
                <div className="space-y-2">
                  {contactInfo.phones.map((p) => (
                    <a
                      key={p.id}
                      href={`tel:${p.contact_value}`}
                      className="flex items-center space-x-3 hover:text-yellow-600 transition-colors"
                    >
                      <Phone className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                      <span>{p.contact_value}</span>
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No phone numbers available</p>
              )}

              {/* Emails */}
              {contactInfo.emails.length > 0 ? (
                <div className="space-y-2">
                  {contactInfo.emails.map((e) => (
                    <a
                      key={e.id}
                      href={`mailto:${e.contact_value}`}
                      className="flex items-center space-x-3 hover:text-yellow-600 transition-colors"
                    >
                      <Mail className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                      <span>{e.contact_value}</span>
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No emails available</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-200 bg-gray-50/60 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-800">
            <div className="text-center md:text-left mb-3 md:mb-0">
              <p>© 2024 Ramya Constructions Ltd. All rights reserved.</p>
            </div>

            <div className="flex space-x-6 text-[15px] text-gray-700 font-medium">
              <a href="/privacy-policy" className="hover:text-yellow-600 transition-colors duration-200">
                Privacy
              </a>
              <a href="/terms" className="hover:text-yellow-600 transition-colors duration-200">
                Terms
              </a>
              <a
                href="/#"
                className="hover:text-yellow-600 transition-colors duration-200"
              >
                Disclaimer
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;