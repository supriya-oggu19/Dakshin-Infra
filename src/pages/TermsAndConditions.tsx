// pages/TermsAndConditions.tsx
import { useEffect } from "react";

const TermsAndConditionsPage = () => {
  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Terms and Conditions</h1>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="prose prose-lg max-w-none">
            {/* Agreement to Terms */}
            <section className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Agreement to Terms</h3>
              <p className="text-gray-700 mb-4">
                If you continue to browse and use this website (<strong>www.dakshininfrastructures.com</strong>) and engage with our services, you are agreeing to comply with and be bound by the following terms and conditions of use, which together with our privacy policy govern Dakshin Infra Structures' relationship with you in relation to this website and our commercial real estate services.
              </p>
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 my-4">
                <p className="text-yellow-800 font-semibold">
                  IF YOU DISAGREE WITH ANY PART OF THESE TERMS AND CONDITIONS, PLEASE DO NOT USE OUR WEBSITE OR SERVICES.
                </p>
              </div>
              <p className="text-gray-700">
                The term 'Dakshin Infra Structures' or 'us' or 'we' refers to the owner of the website and the commercial real estate development company. The term 'you' refers to the user, visitor, customer, or client of our website and services.
              </p>
            </section>

            {/* Company Information */}
            <section className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Company Information</h3>
              <p className="text-gray-700"><strong>Dakshin Infra Structures</strong></p>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                <li><strong>Registered Office:</strong> [Complete Business Address]</li>
                <li><strong>Website:</strong> www.dakshininfrastructures.com</li>
                <li><strong>Email:</strong> info@dakshininfrastructures.com</li>
                <li><strong>Phone:</strong> [Phone Number]</li>
                <li><strong>Business:</strong> Commercial real estate development, construction, and sales</li>
                <li><strong>Services:</strong> Commercial space units, office complexes, retail spaces, warehouses, industrial units</li>
              </ul>
            </section>

            {/* Website Terms of Use */}
            <section className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Website Terms of Use</h3>

              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">Content and Information</h4>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>The content of the pages of this website is for your general information and use only. It is subject to change without notice.</li>
                  <li>All project information, unit specifications, pricing, and timelines mentioned on this website are indicative and subject to change based on approvals, market conditions, and other factors.</li>
                  <li>Neither we nor any third parties provide any warranty or guarantee as to the accuracy, timeliness, performance, completeness, or suitability of the information and materials found or offered on this website for any particular purpose.</li>
                  <li>You acknowledge that such information and materials may contain inaccuracies or errors, and we expressly exclude liability for any such inaccuracies or errors to the fullest extent permitted by law.</li>
                </ul>
              </div>

              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">Risk and Responsibility</h4>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>Your use of any information or materials on this website is entirely at your own risk, for which we shall not be liable.</li>
                  <li>It shall be your own responsibility to ensure that any products, services, or information available through this website meet your specific requirements.</li>
                  <li>All property investments carry inherent risks, and past performance does not guarantee future returns.</li>
                </ul>
              </div>

              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">Intellectual Property Rights</h4>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>This website contains material which is owned by or licensed to us. This material includes, but is not limited to, the design, layout, look, appearance, graphics, photographs, project images, floor plans, and written content.</li>
                  <li>All trademarks, logos, and brand names displayed on this website are the property of Dakshin Infra Structures or used with permission.</li>
                  <li>Reproduction, distribution, or unauthorized use of this material is prohibited other than in accordance with the copyright notice, which forms part of these terms and conditions.</li>
                  <li>Unauthorized use of this website may give rise to a claim for damages and/or be a criminal offense.</li>
                </ul>
              </div>

              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">Third-Party Links</h4>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>From time to time, this website may include links to other websites such as banks, legal service providers, or government portals. These links are provided for your convenience to provide further information.</li>
                  <li>They do not signify that we endorse the website(s). We have no responsibility for the content of the linked website(s).</li>
                </ul>
              </div>
            </section>

            {/* Commercial Real Estate Services Terms */}
            <section className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Commercial Real Estate Services Terms</h3>

              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">Property Sales and Bookings</h4>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>All commercial unit bookings are subject to availability and company approval</li>
                  <li>Booking requires submission of completed application form with necessary documents</li>
                  <li>Non-refundable booking amount (typically 10-20% of unit price) must be paid to confirm reservation</li>
                  <li>Units are allocated on a first-come, first-served basis</li>
                  <li>Final allotment is subject to verification of documents and creditworthiness</li>
                </ul>
              </div>

              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">Pricing and Payments</h4>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>All unit prices mentioned are base prices and exclude taxes, registration charges, legal fees, and other statutory charges</li>
                  <li>Prices are subject to change without prior notice until booking confirmation</li>
                  <li>Payment schedule will be provided at the time of booking and forms part of the sale agreement</li>
                  <li>Delayed payments may attract penalty charges and interest as per agreed terms</li>
                  <li>All payments must be made through legitimate banking channels for legal compliance</li>
                </ul>
              </div>

              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">Unit Specifications and Modifications</h4>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>Unit areas mentioned are super built-up areas unless specifically stated otherwise</li>
                  <li>Minor variations in unit dimensions (up to 3%) are acceptable due to architectural requirements</li>
                  <li>Project specifications, amenities, and common areas are subject to change based on approvals and feasibility</li>
                  <li>The company reserves the right to make minor modifications for structural, technical, or legal reasons</li>
                </ul>
              </div>

              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">Construction and Delivery</h4>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>Possession dates are estimated timelines and not contractual commitments</li>
                  <li>Delays due to force majeure, government approvals, or unforeseen circumstances are not attributable to the company</li>
                  <li>Grace period of 6-12 months may apply for possession delays beyond estimated completion</li>
                  <li>Regular project updates will be provided through email, SMS, or customer portal</li>
                </ul>
              </div>

              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">Quality Standards</h4>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>Construction will meet all applicable building codes, safety standards, and government regulations</li>
                  <li>All materials and workmanship will conform to industry standards and specifications</li>
                  <li>Structural defects reported within 12 months of possession will be rectified at no cost</li>
                  <li>Warranty period of 5 years applies to structural elements from the date of possession</li>
                </ul>
              </div>
            </section>

            {/* Legal and Compliance */}
            <section className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Legal and Compliance</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>All projects have necessary approvals from relevant municipal and government authorities</li>
                <li>Copies of approvals, NOCs, and clearances are available for inspection during office hours</li>
                <li>Sale deeds will be registered as per applicable laws and regulations</li>
                <li>Buyers are responsible for verification of all legal documents before purchase</li>
                <li>The company guarantees clear and marketable title to all units sold</li>
                <li>Ownership transfer will be completed within 6 months of final payment and possession</li>
                <li>Property registration charges, stamp duty, and legal fees are to be borne by the buyer</li>
              </ul>
            </section>

            {/* Cancellation and Refund Policy */}
            <section className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Cancellation and Refund Policy</h3>
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">Buyer-Initiated Cancellation</h4>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>Cancellation requests must be submitted in writing with reasons</li>
                  <li>Booking amounts are generally non-refundable as per booking terms</li>
                  <li>Refunds, if applicable, will be processed within 120 days after deducting administrative charges</li>
                </ul>
              </div>
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">Company-Initiated Cancellation</h4>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>In case of project cancellation due to regulatory or other issues, full refund will be provided</li>
                  <li>Refunds will include simple interest at prevailing bank rates from the date of payment</li>
                  <li>Alternative unit options in other projects may be offered with mutual consent</li>
                </ul>
              </div>
            </section>

            {/* Customer Rights and Obligations */}
            <section className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Customer Rights and Obligations</h3>
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">Customer Rights</h4>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>Right to receive all project-related information and updates</li>
                  <li>Right to inspect the unit before taking possession</li>
                  <li>Right to receive possession on completion as per agreement</li>
                  <li>Right to form association for common area management</li>
                  <li>Right to approach consumer forums for grievance redressal</li>
                </ul>
              </div>
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">Customer Obligations</h4>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>Provide accurate and complete information for all documentation</li>
                  <li>Make payments as per agreed schedule without default</li>
                  <li>Comply with all society rules and regulations post-possession</li>
                  <li>Obtain necessary insurance for the purchased unit</li>
                  <li>Pay applicable maintenance charges and utility bills</li>
                </ul>
              </div>
            </section>

            {/* Limitations of Liability */}
            <section className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Limitations of Liability</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Our liability is limited to the amount paid by the customer for the specific unit</li>
                <li>We are not liable for consequential, indirect, or speculative damages</li>
                <li>Force majeure events including natural disasters, government actions, or pandemics absolve the company from performance obligations</li>
                <li>We are not responsible for market fluctuations affecting property values post-purchase</li>
              </ul>
            </section>

            {/* Dispute Resolution */}
            <section className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Dispute Resolution</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Your use of this website and any dispute arising out of such use is subject to the laws of India</li>
                <li>All disputes related to property transactions will be subject to the jurisdiction of courts in [City Name]</li>
                <li>Alternative dispute resolution through arbitration may be pursued as per the Indian Arbitration Act</li>
                <li>Initial complaints should be addressed to our customer service team</li>
                <li>We aim to resolve all genuine grievances within 30 days of receipt</li>
              </ul>
            </section>

            {/* Privacy and Data Protection */}
            <section className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Privacy and Data Protection</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Your personal information is protected as per our Privacy Policy</li>
                <li>We comply with applicable data protection laws and regulations</li>
                <li>Customer information may be shared with banks, legal consultants, and government authorities as required for transactions</li>
                <li>Marketing communications will be sent only with your consent, and you can opt-out at any time</li>
              </ul>
            </section>

            {/* Contact Information */}
            <section className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Contact Information</h3>
              <p className="text-gray-700 mb-4">
                For any questions, concerns, or clarifications regarding these Terms and Conditions:
              </p>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700"><strong>Dakshin Infra Structures</strong></p>
                <p className="text-gray-700">Address: [Complete Business Address]</p>
                <p className="text-gray-700">Phone: [Phone Number]</p>
                <p className="text-gray-700">Email: info@dakshininfrastructures.com</p>
                <p className="text-gray-700">Customer Service: support@dakshininfrastructures.com</p>
                <p className="text-gray-700">Legal Department: legal@dakshininfrastructures.com</p>
                <p className="text-gray-700">Website: www.dakshininfrastructures.com</p>
                <p className="text-gray-700">Business Hours: Monday to Saturday, 9:00 AM to 6:00 PM</p>
                <p className="text-gray-700">Emergency Contact: [Emergency Phone Number]</p>
              </div>
            </section>

            {/* Acknowledgment */}
            <section className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Acknowledgment</h3>
              <p className="text-gray-700">
                By using our website and services, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions. You also acknowledge that you have read our Privacy Policy and agree to the collection and use of your information as described therein.
              </p>
            </section>

            {/* Footer Note */}
            <div className="border-t border-gray-200 pt-4">
              <p className="text-sm text-gray-600 italic">
                Note: These Terms and Conditions are governed by the laws of India and comply with applicable regulations. Please review this document periodically as we may update it from time to time.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditionsPage;