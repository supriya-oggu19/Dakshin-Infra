// pages/PrivacyPolicy.tsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const PrivacyPolicyPage = () => {
  const location = useLocation();

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
        </div>

       {/* Content */}
          <div className="px-6 py-4 overflow-y-auto max-h-[calc(90vh-80px)]">
            <div className="prose prose-lg max-w-none">
              {/* Introduction */}
              <section className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Introduction</h3>
                <p className="text-gray-700 mb-4">
                  Ramya Constructions ("we" or "us" or "our") respects the privacy of our users ("user" or "you"). 
                  We make every effort to treat your personal information as safely and securely as reasonably possible. 
                  This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you 
                  visit our website (www.ramyaconstructions.com) and when you engage with our services for commercial 
                  real estate development and sales.
                </p>
                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 my-4">
                  <p className="text-yellow-800 font-semibold">
                    IF YOU DO NOT AGREE WITH THE TERMS OF THIS PRIVACY POLICY, PLEASE DO NOT ACCESS OR USE OUR WEBSITE OR SERVICES.
                  </p>
                </div>
                <p className="text-gray-700">
                  We reserve the right to make changes to this Privacy Policy at any time and for any reason. 
                  We will alert you about any changes by updating the "Last updated" date of this Privacy Policy. 
                  You are encouraged to periodically review this Privacy Policy to stay informed of updates. 
                  You will be deemed to have been made aware of, will be subject to, and will be deemed to have 
                  accepted the changes in any revised Privacy Policy by your continued use of our website or 
                  services after the date such revised Privacy Policy is posted.
                </p>
              </section>

              {/* What We Collect */}
              <section className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">What We Collect</h3>
                <p className="text-gray-700 mb-4">
                  We may collect the following information:
                </p>

                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">Personal Information</h4>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li><strong>Name and Contact Details:</strong> Full name, email address, phone number, postal address, business address</li>
                    <li><strong>Identification Information:</strong> PAN card details, Aadhaar card information, passport details, driving license information</li>
                    <li><strong>Professional Information:</strong> Job title, company name, business registration details, GST information</li>
                    <li><strong>Demographic Information:</strong> Age, location preferences, investment capacity, budget range</li>
                  </ul>
                </div>

                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">Financial Information</h4>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li><strong>Payment Details:</strong> Credit/debit card information, bank account details, payment history</li>
                    <li><strong>Financial Status:</strong> Income details, employment information, credit history, investment portfolio</li>
                    <li><strong>Transaction Data:</strong> Purchase details, booking amounts, payment schedules, transaction IDs</li>
                  </ul>
                </div>

                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">Property-Related Information</h4>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li><strong>Preferences:</strong> Budget range, location preferences, unit size requirements, commercial space needs</li>
                    <li><strong>Investment Timeline:</strong> Project timelines, possession requirements, future investment plans</li>
                    <li><strong>Communication Records:</strong> Email correspondence, phone call records, meeting notes, site visit details</li>
                  </ul>
                </div>

                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">Technical Information</h4>
                  <p className="text-gray-700 mb-3">
                    When you visit our website, we automatically collect:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li><strong>Device Information:</strong> IP address, browser type and version, operating system, mobile device ID</li>
                    <li><strong>Usage Data:</strong> Pages visited, time spent, referring URLs, search queries, click patterns</li>
                    <li><strong>Location Data:</strong> Geographic location information (with your consent)</li>
                    <li><strong>Cookies and Tracking:</strong> Web beacons, tracking pixels, session data</li>
                  </ul>
                </div>
              </section>

              {/* How We Use Your Information */}
              <section className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">How We Use Your Information</h3>
                <p className="text-gray-700 mb-4">
                  We require this information to understand your needs and provide you with better service, and in particular for the following reasons:
                </p>

                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">Primary Business Purposes</h4>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>Property Sales and Services: Processing unit bookings, managing sales transactions, providing project updates</li>
                    <li>Customer Service: Responding to inquiries, handling complaints, providing technical support</li>
                    <li>Communication: Sending project updates, payment reminders, construction progress reports</li>
                    <li>Legal Compliance: Meeting KYC requirements, regulatory compliance, documentation processes</li>
                  </ul>
                </div>

                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">Secondary Purposes</h4>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>Marketing Communications: Sending information about new projects, special offers, market insights</li>
                    <li>Internal Operations: Record keeping, improving our products and services, staff training</li>
                    <li>Research and Analytics: Understanding customer preferences, market research, website optimization</li>
                    <li>Fraud Prevention: Monitoring transactions, preventing unauthorized access, security measures</li>
                  </ul>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-2">Specific Uses Include:</h4>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                    <li>Create and manage your customer account</li>
                    <li>Process bookings, payments, and other transactions</li>
                    <li>Deliver targeted information about our commercial properties</li>
                    <li>Email you regarding your account, bookings, or purchases</li>
                    <li>Generate personalized property recommendations</li>
                    <li>Monitor and analyze website usage patterns</li>
                    <li>Notify you of website updates or new features</li>
                    <li>Request feedback about our services</li>
                    <li>Resolve disputes and troubleshoot problems</li>
                  </ul>
                </div>
              </section>

              {/* Disclosure of Your Information */}
              <section className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Disclosure of Your Information</h3>
                <p className="text-gray-700 mb-4">
                  We may share information we have collected about you in certain situations:
                </p>

                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">Legal Requirements</h4>
                  <p className="text-gray-700">
                    If we believe the release of information about you is necessary to respond to legal process, 
                    to investigate or remedy potential violations of our policies, or to protect the rights, property, 
                    and safety of others, we may share your information as permitted or required by any applicable law, rule, or regulation.
                  </p>
                </div>

                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">Business Partners</h4>
                  <p className="text-gray-700 mb-2">We may share your information with:</p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li><strong>Financial Institutions:</strong> Banks and NBFCs for loan processing and payment verification</li>
                    <li><strong>Legal Service Providers:</strong> Lawyers, notaries, and legal consultants for documentation</li>
                    <li><strong>Construction Partners:</strong> Contractors, architects, and consultants involved in project delivery</li>
                    <li><strong>Government Authorities:</strong> Regulatory bodies, municipal corporations, and approval authorities</li>
                    <li><strong>Marketing Partners:</strong> Advertising agencies and marketing service providers (with your consent)</li>
                  </ul>
                </div>

                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">Third-Party Service Providers</h4>
                  <p className="text-gray-700 mb-2">
                    We may share your information with third parties that perform services for us, including:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>Payment processing and financial services</li>
                    <li>Email delivery and SMS services</li>
                    <li>Website hosting and maintenance</li>
                    <li>Customer relationship management</li>
                    <li>Data analysis and market research</li>
                    <li>Security and fraud prevention</li>
                  </ul>
                </div>

                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
                  <p className="text-yellow-800">
                    We are not responsible for the actions of third parties with whom you share personal or sensitive data, 
                    and we have no authority to manage or control third-party solicitations.
                  </p>
                </div>
              </section>

              {/* Security of Your Information */}
              <section className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Security of Your Information</h3>
                <p className="text-gray-700 mb-4">
                  We are committed to ensuring that your information is secure. In order to prevent unauthorized access 
                  or disclosure, we have put in place suitable physical, electronic, and managerial procedures to safeguard 
                  and secure the information we collect:
                </p>

                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">Technical Security Measures</h4>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>SSL encryption for all data transmissions</li>
                    <li>Secure servers with regular security updates</li>
                    <li>Access controls and user authentication systems</li>
                    <li>Regular security audits and vulnerability assessments</li>
                    <li>Secure backup and disaster recovery systems</li>
                  </ul>
                </div>

                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">Physical Security</h4>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>Restricted access to physical documents and servers</li>
                    <li>Locked storage systems for sensitive information</li>
                    <li>Secure office premises with access controls</li>
                    <li>CCTV monitoring in document storage areas</li>
                  </ul>
                </div>

                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">Administrative Safeguards</h4>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>Employee training on privacy and security practices</li>
                    <li>Confidentiality agreements with all staff and partners</li>
                    <li>Regular review and update of security policies</li>
                    <li>Incident response and breach notification procedures</li>
                  </ul>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 italic">
                    While we have taken reasonable steps to secure your personal information, please be aware that 
                    no security measures are perfect or impenetrable, and no method of data transmission can be 
                    guaranteed against interception or misuse.
                  </p>
                </div>
              </section>

              {/* Cookies and Tracking Technologies */}
              <section className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Cookies and Tracking Technologies</h3>

                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">How We Use Cookies</h4>
                  <p className="text-gray-700 mb-4">
                    A cookie is a small file which asks permission to be placed on your computer's hard drive. 
                    Once you agree, the file is added and the cookie helps analyze web traffic or lets you know 
                    when you visit a particular site.
                  </p>
                  <p className="text-gray-700 mb-3">We use cookies for the following purposes:</p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li><strong>Essential Cookies:</strong> Required for basic website functionality</li>
                    <li><strong>Analytics Cookies:</strong> To understand how visitors use our website</li>
                    <li><strong>Marketing Cookies:</strong> To deliver relevant advertisements and measure campaign effectiveness</li>
                    <li><strong>Preference Cookies:</strong> To remember your settings and provide personalized experience</li>
                  </ul>
                </div>

                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">Your Cookie Choices</h4>
                  <p className="text-gray-700">
                    You can choose to accept or decline cookies. Most web browsers automatically accept cookies, 
                    but you can modify your browser settings to decline cookies if you prefer. However, this may 
                    prevent you from taking full advantage of the website.
                  </p>
                </div>

                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">Third-Party Websites</h4>
                  <p className="text-gray-700">
                    Our website may contain links to other websites of interest, including advertisements and external services. 
                    Once you have used these links to leave our site, you should note that we do not have any control over those websites. 
                    Therefore, we cannot be responsible for the protection and privacy of any information which you provide whilst 
                    visiting such sites, and such sites are not governed by this privacy statement. You should exercise caution 
                    and look at the privacy statement applicable to the website in question.
                  </p>
                </div>
              </section>

              {/* Your Rights and Choices */}
              <section className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Your Rights and Choices</h3>

                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">Controlling Your Personal Information</h4>
                  <p className="text-gray-700 mb-3">
                    You may choose to restrict the collection or use of your personal information in the following ways:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li><strong>Opt-out of Marketing:</strong> You can opt-out of receiving promotional emails by clicking the unsubscribe link or contacting us directly</li>
                    <li><strong>Access Your Information:</strong> You can request access to the personal information we hold about you</li>
                    <li><strong>Update Information:</strong> You can update or correct your personal information through your account or by contacting us</li>
                    <li><strong>Data Portability:</strong> You can request your data in a portable format for transfer to another service provider</li>
                    <li><strong>Deletion Rights:</strong> You can request deletion of your personal information, subject to legal and contractual obligations</li>
                  </ul>
                </div>

                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">Account Management</h4>
                  <p className="text-gray-700 mb-3">
                    You may at any time review or change the information in your account by:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>Logging into your account and updating your profile</li>
                    <li>Contacting our customer service team</li>
                    <li>Visiting our office during business hours</li>
                  </ul>
                  <p className="text-gray-700 mt-3">
                    Upon your request to terminate your account, we will deactivate or delete your account and information 
                    from our active databases. However, some information may be retained to prevent fraud, troubleshoot 
                    problems, assist with investigations, or comply with legal requirements.
                  </p>
                </div>

                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">Data Retention</h4>
                  <p className="text-gray-700 mb-3">
                    We will retain your personal information only for as long as necessary to:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>Fulfill the purposes outlined in this Privacy Policy</li>
                    <li>Comply with our legal obligations</li>
                    <li>Resolve disputes and enforce our agreements</li>
                    <li>Prevent fraud and abuse</li>
                  </ul>
                  <p className="text-gray-700 mt-3 font-semibold">Typical retention periods include:</p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li><strong>Customer Records:</strong> 7 years after transaction completion</li>
                    <li><strong>Marketing Communications:</strong> Until you unsubscribe or withdraw consent</li>
                    <li><strong>Website Analytics:</strong> 24 months from collection</li>
                    <li><strong>Financial Records:</strong> As required by applicable laws and regulations</li>
                  </ul>
                </div>
              </section>

              {/* Marketing Communications */}
              <section className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Marketing Communications</h3>

                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">Consent and Communication</h4>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>We may periodically send promotional emails about new projects, special offers, or other information which we think you may find interesting using the email address you have provided</li>
                    <li>We may contact you by email, phone, SMS, or WhatsApp for marketing purposes</li>
                    <li>You can withdraw your consent at any time by contacting us at unsubscribe@ramyaconstructions.com</li>
                  </ul>
                </div>

                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
                  <h4 className="font-semibold text-yellow-800 mb-2">Override of DND/NDNC</h4>
                  <p className="text-yellow-800">
                    In case you have submitted your personal information and contact details, we reserve the right to call, 
                    SMS, email, or WhatsApp you about our products and offers, even if your number has DND activated on it.
                  </p>
                  <p className="text-yellow-800 mt-2 font-semibold">
                    By providing your contact information, you authorize Ramya Constructions and its representatives to 
                    contact you via email, SMS, call, or WhatsApp, which overrides DND/NDNC Registration.
                  </p>
                </div>
              </section>

              {/* Contact Information */}
              <section className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Contact Information</h3>
                <p className="text-gray-700 mb-4">
                  If you have questions or comments about this Privacy Policy, or if you believe that any information 
                  we are holding about you is incorrect or incomplete, please contact us as soon as possible:
                </p>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700"><strong>Ramya Constructions</strong></p>
                  <p className="text-gray-700">Address: [Complete Business Address]</p>
                  <p className="text-gray-700">Phone: [Phone Number]</p>
                  <p className="text-gray-700">Email: info@ramyaconstructions.com</p>
                  <p className="text-gray-700">Privacy Officer: privacy@ramyaconstructions.com</p>
                  <p className="text-gray-700">Unsubscribe: unsubscribe@ramyaconstructions.com</p>
                </div>
                <p className="text-gray-700 mt-4">
                  We will promptly correct any information found to be incorrect and respond to your privacy-related 
                  inquiries within a reasonable timeframe.
                </p>
              </section>

              {/* Footer Note */}
              <div className="border-t border-gray-200 pt-4">
                <p className="text-sm text-gray-600 italic">
                  Note: This Privacy Policy is governed by the laws of India and complies with applicable data 
                  protection regulations. Please review this policy periodically as we may update it from time 
                  to time to reflect changes in our practices or legal requirements.
                </p>
              </div>
            </div>
          </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;   