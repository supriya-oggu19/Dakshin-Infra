// src/components/FAQ.tsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqs = [
  {
    question: "What is the minimum investment amount?",
    answer:
      "Start your investment journey with just ₹36 lakhs for a commercial unit that offering up to 18%* annual returns.",
  },
  {
    question: "How many Payment options are available?",
    answer:
      "You can choose between two payment options – a single  payment or a monthly installment plan. Pick the one that suits you best.",
  },
  {
    question: "How does the installment plan work?",
    answer:
      "You can opt for a flexible installment plan where you make monthly payments for a set duration. Once all installments are completed, you start receiving a fixed rental income every month thereafter.",
  },
  

  // -------------------------------------------------
  //  ORIGINAL FAQS (kept in the same order)
  // -------------------------------------------------
  {
    question: "Are returns guaranteed and secure?",
    answer:
      "Yes, we guarantee uninterrupted rental income regardless of occupancy, backed by our comprehensive tenant management and legal compliance.",
  },
  {
    question: "Can NRIs invest in this project?",
    answer:
      "Absolutely. NRIs can invest subject to FEMA compliance, with our team providing complete documentation support through our secure platform.",
  },
  {
    question: "Who handles property management?",
    answer:
      "Our professional facility management team handles everything - tenant relations, maintenance, legal compliance - ensuring truly passive income for you.",
  },
  {
    question: "What legal documentation is provided?",
    answer:
      "You receive comprehensive legal documents defining your ownership rights, terms, and obligations, all reviewed by legal professionals for complete transparency.",
  },
];


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 py-20">
      <div className="container-professional">
        <div className="text-center mb-16 animate-fade-in-scale">
          <div className="inline-block mb-4">
            <span className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full text-sm font-semibold">
              Got Questions?
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
            Frequently Asked <span className="text-yellow-600">Questions</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Find answers to common questions about investing in Kapil Business Park
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="group animate-slide-in-up"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full text-left bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden"
              >
                <div className="p-6 md:p-8">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-yellow-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-yellow-600 font-bold text-sm">
                            Q{index + 1}
                          </span>
                        </div>
                        <h3 className="text-lg md:text-xl font-bold text-gray-900 group-hover:text-yellow-600 transition-colors duration-300">
                          {faq.question}
                        </h3>
                      </div>
                    </div>
                    <div
                      className={`w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                        openIndex === index ? "rotate-180 bg-yellow-600" : ""
                      }`}
                    >
                      <ArrowRight
                        className={`w-5 h-5 transition-colors duration-300 ${
                          openIndex === index ? "text-white" : "text-yellow-600"
                        } transform rotate-90`}
                      />
                    </div>
                  </div>

                  <div
                    className={`overflow-hidden transition-all duration-500 ease-in-out ${
                      openIndex === index
                        ? "max-h-96 opacity-100 mt-4"
                        : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="pl-11 pr-4">
                      <div className="h-px bg-gradient-to-r from-yellow-200 via-yellow-400 to-transparent mb-4"></div>
                      <p className="text-gray-700 leading-relaxed text-base">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>

                {openIndex === index && (
                  <div className="h-1 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600"></div>
                )}
              </button>
            </div>
          ))}
        </div>

        <div
          className="mt-16 text-center animate-fade-in-scale"
          style={{ animationDelay: "0.5s" }}
        >
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 md:p-10 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-4 text-gray-900">
              Still have questions?
            </h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Our investment consultants are here to help you make informed decisions
            </p>
            <Link to="/contact">
              <Button className="bg-yellow-600 hover:bg-yellow-700 text-white px-8 py-3 text-base font-semibold rounded-lg transition-all duration-300 hover:transform hover:scale-105">
                Contact Our Team
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;