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

const Footer = () => {
  const [contactInfo, setContactInfo] = useState({ phones: [], emails: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8001/api/contactInfo/all");
        const data = await response.json();

        const active = data.filter((c) => c.is_active);
        const phones = active
          .filter((c) => c.contact_type === "phone")
          .sort((a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0));
        const emails = active
          .filter((c) => c.contact_type === "email")
          .sort((a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0));

        setContactInfo({ phones, emails });
      } catch (err) {
        console.error("Failed to fetch contact info:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchContactInfo();
  }, []);

  const quickLinks = [
    { name: "About Us", href: "/about" },
    { name: "Projects", href: "/projects" },
    { name: "Investment", href: "/projects/1" },
    { name: "FAQ", href: "/faq" },
    { name: "Contact", href: "/contact" },
  ];

  const legalLinks = [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms", href: "/terms" },
    { name: "Disclaimer", href: "/disclaimer" },
    { name: "RERA Details", href: "/rera" },
  ];

  return (
    <footer className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-t border-yellow-200">
      {/* Top Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        {/* 1️⃣ Brand & Social */}
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
                className="w-10 h-10 bg-gray-100 hover:bg-yellow-500 rounded-full flex items-center justify-center transition-all duration-300 group"
              >
                <s.icon className="w-5 h-5 text-gray-700 group-hover:text-white" />
              </a>
            ))}
          </div>
        </div>

        {/* 2️⃣ Company Info */}
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

        {/* 3️⃣ Quick Links + Policies */}
        <div>
          <h3 className="text-lg font-bold text-yellow-700 mb-4 uppercase tracking-wide">
            Quick Links
          </h3>
          <ul className="space-y-2 text-sm text-gray-700">
            {quickLinks.map((link, i) => (
              <li key={i}>
                <a
                  href={link.href}
                  className="hover:text-yellow-600 transition-colors"
                >
                  {link.name}
                </a>
              </li>
            ))}
          </ul>

          {/* Policies (now matching Quick Links) */}
          <div className="mt-8">
            <h3 className="text-lg font-bold text-yellow-700 mb-4 uppercase tracking-wide">
              Policies
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              {legalLinks.map((l, i) => (
                <li key={i}>
                  <a
                    href={l.href}
                    className="hover:text-yellow-600 transition-colors"
                  >
                    {l.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 4️⃣ Contact Info */}
        <div>
          <h3 className="text-lg font-bold text-yellow-700 mb-4 uppercase tracking-wide">
            Contact
          </h3>
          {loading ? (
            <p className="text-gray-500 text-sm">Loading contact info...</p>
          ) : (
            <div className="space-y-4 text-sm text-gray-700">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-yellow-600 mt-1 flex-shrink-0" />
                <p>
                  Survey 115/1, ISB Rd, Financial District, Gachibowli, Hyderabad,
                  Telangana - 500032
                </p>
              </div>

              {contactInfo.phones.length > 0 && (
                <div>
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
              )}

              {contactInfo.emails.length > 0 && (
                <div>
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
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-200 bg-gray-50/60 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-800">
            <div className="text-center md:text-left">
              <p>© 2024 Ramya Constructions Ltd. All rights reserved.</p>
              <div className="mt-1 text-xs text-gray-600">
                <a href="/privacy" className="hover:text-yellow-600 mr-3">
                  Privacy
                </a>
                <a href="/terms" className="hover:text-yellow-600 mr-3">
                  Terms
                </a>
                <a href="/disclaimer" className="hover:text-yellow-600">
                  Disclaimer
                </a>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-4 items-center text-xs text-gray-700">
              <span>RERA Approved</span>
              <span className="hidden sm:inline">•</span>
              <span>Returns subject to T&C</span>
              <span className="hidden sm:inline">•</span>
              <span>ISO Certified</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
