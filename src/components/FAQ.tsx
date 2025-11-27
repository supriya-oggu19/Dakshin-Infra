// src/components/FAQ.tsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, ChevronDown, MessageCircle, Star } from "lucide-react";
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
        "You can choose between two payment options – a single payment or a monthly installment plan. Pick the one that suits you best.",
    },
    {
      question: "How does the installment plan work?",
      answer:
        "You can opt for a flexible installment plan where you make monthly payments for a set duration. Once all installments are completed, you start receiving a fixed rental income every month thereafter.",
    },
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden py-20">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-blue-200/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-sky-200/10 rounded-full blur-2xl"></div>

      <div className="container-professional relative z-10">
        {/* Header Section */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 bg-blue-100/80 backdrop-blur-sm border border-blue-200 px-6 py-3 rounded-full mb-6 animate-fade-in">
            <MessageCircle className="w-5 h-5 text-blue-600" />
            <span className="text-blue-700 font-semibold text-sm uppercase tracking-wide">
              Frequently Asked Questions
            </span>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-slate-900 via-blue-900 to-slate-800 bg-clip-text text-transparent">
            Your Questions
            <span className="block text-blue-600 mt-2">Answered</span>
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-light">
            Comprehensive insights to help you make informed investment decisions 
            with confidence and clarity
          </p>
        </div>

        {/* FAQ Grid */}
        <div className="grid lg:grid-cols-2 gap-6 max-w-7xl mx-auto">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="group animate-slide-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div
                className={`bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-2xl border border-white/50 transition-all duration-500 overflow-hidden ${
                  openIndex === index 
                    ? "ring-2 ring-blue-500/20 shadow-xl" 
                    : "hover:ring-1 hover:ring-blue-200/50"
                }`}
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full text-left p-8 hover:bg-white/50 transition-colors duration-300"
                >
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex items-start gap-4 flex-1">
                      {/* Number Badge */}
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg group-hover:shadow-blue-500/25 transition-shadow duration-300">
                          <span className="text-white font-bold text-sm">
                            {String(index + 1).padStart(2, '0')}
                          </span>
                        </div>
                      </div>
                      
                      {/* Question */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-slate-900 group-hover:text-blue-700 transition-colors duration-300 leading-relaxed">
                          {faq.question}
                        </h3>
                      </div>
                    </div>

                    {/* Chevron Icon */}
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${
                      openIndex === index 
                        ? "bg-blue-600 text-white rotate-180" 
                        : "bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white"
                    }`}>
                      <ChevronDown className="w-5 h-5 transition-transform duration-500" />
                    </div>
                  </div>

                  {/* Answer */}
                  <div
                    className={`overflow-hidden transition-all duration-700 ease-in-out ${
                      openIndex === index
                        ? "max-h-96 opacity-100 mt-6"
                        : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="pl-16 pr-4">
                      <div className="h-px bg-gradient-to-r from-blue-200 via-blue-400 to-transparent mb-6"></div>
                      <p className="text-slate-700 leading-relaxed text-base font-light bg-blue-50/50 rounded-2xl p-6 border border-blue-100">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </button>

                {/* Active Indicator Bar */}
                {openIndex === index && (
                  <div className="h-1.5 bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600"></div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 p-12 max-w-4xl mx-auto relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100/50 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-100/50 rounded-full translate-y-12 -translate-x-12"></div>
            
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-blue-600/10 px-4 py-2 rounded-full mb-6">
                <Star className="w-4 h-4 text-blue-600" />
                <span className="text-blue-700 font-semibold text-sm">Expert Support</span>
              </div>
              
              <h3 className="text-3xl font-bold text-slate-900 mb-4">
                Still have questions?
              </h3>
              <p className="text-slate-600 mb-8 text-lg max-w-2xl mx-auto leading-relaxed">
                Our investment consultants are ready to provide personalized guidance 
                and help you make the right investment decision
              </p>
              
              <Link to="/contact">
                <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-10 py-6 text-base font-semibold rounded-2xl transition-all duration-300 hover:shadow-2xl hover:scale-105 shadow-lg group">
                  <MessageCircle className="mr-3 w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                  Speak with Our Experts
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute bottom-10 left-10 w-6 h-6 bg-blue-400/30 rounded-full animate-float"></div>
      <div className="absolute top-20 right-20 w-8 h-8 bg-indigo-400/20 rounded-full animate-float" style={{animationDelay: '2s'}}></div>
      <div className="absolute top-40 left-1/4 w-4 h-4 bg-sky-400/30 rounded-full animate-float" style={{animationDelay: '4s'}}></div>
    </div>
  );
};

export default FAQ;