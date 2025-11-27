import { Badge } from "@/components/ui/badge";
import { Award, Users, TrendingUp, Shield, Star, Target, Building2, Quote } from "lucide-react";
import Navigation from "@/components/Navigation";

const About = () => {
  const stats = [
    { label: "Years of Excellence", value: "32+", icon: Award },
    { label: "States of Operation", value: "2", icon: Users },
    { label: "Real Estate Projects", value: "Multiple", icon: TrendingUp },
    { label: "Approved", value: "RERA", icon: Target },
  ];

  const values = [
    {
      icon: Shield,
      title: "Trust & Transparency",
      description:
        "We believe in complete transparency in all our dealings, ensuring our investors make informed decisions.",
    },
    {
      icon: Star,
      title: "Quality Excellence",
      description:
        "Every property is carefully selected and developed to meet the highest standards of luxury and quality.",
    },
    {
      icon: TrendingUp,
      title: "Guaranteed Returns",
      description:
        "Our proven track record of delivering guaranteed rental returns makes us a reliable investment partner.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 overflow-x-hidden relative">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-blue-200/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-sky-200/10 rounded-full blur-2xl"></div>

      <Navigation />

      <div className="pt-20 pb-12 space-y-16 md:space-y-20 relative z-10">
        {/* Hero Section */}
        <section className="pt-12 md:pt-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center px-2 animate-fade-in">
              <Badge className="mb-6 bg-blue-100/80 backdrop-blur-sm text-blue-700 border-blue-200/50 px-4 py-2 rounded-full text-sm font-semibold">
                About Dakshin Infra Structures
              </Badge>
              <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6 leading-tight">
                <span className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-800 bg-clip-text text-transparent">
                  Your Trusted Partner
                </span>
                <br />
                <span className="bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                  in Commercial Real Estate
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-slate-600 max-w-4xl mx-auto leading-relaxed font-light">
                Dakshin Infra Structures Pvt Ltd., incorporated on 17th December 1992, is a
                reputed realty company operating under the Kapil Group — a leading
                conglomerate in Telangana and Andhra Pradesh.
              </p>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 md:py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={index}
                    className="group bg-white/80 backdrop-blur-sm rounded-3xl p-8 text-center hover:shadow-2xl transition-all duration-500 border border-white/50 hover:border-blue-200/50 animate-slide-in-up"
                    style={{ animationDelay: `${index * 150}ms` }}
                  >
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <Icon className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-3xl font-bold text-slate-900 mb-2">
                      {stat.value}
                    </h3>
                    <p className="text-slate-600 font-medium">
                      {stat.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Our Story */}
        <section className="py-12 md:py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12 animate-fade-in">
              <Badge className="mb-4 bg-blue-100/80 backdrop-blur-sm text-blue-700 border-blue-200/50 px-4 py-2 rounded-full text-sm font-semibold">
                Our Story
              </Badge>
              <h2 className="text-4xl sm:text-5xl font-bold mb-6 leading-tight">
                <span className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  Building Dreams,
                </span>
                <br />
                <span className="bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                  Creating Wealth
                </span>
              </h2>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-white/50 shadow-xl hover:shadow-2xl transition-all duration-500">
              <div className="flex items-start gap-6 mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">
                    Three Decades of Excellence
                  </h3>
                  <div className="prose prose-lg max-w-none text-slate-700 leading-relaxed space-y-6">
                    <p>
                      Dakshin Infra Structures Pvt Ltd., incorporated on 17th December 1992,
                      is a reputed realty company operating under the Kapil Group — a
                      leading conglomerate in Telangana and Andhra Pradesh.
                      Headquartered in Vijayawada, Andhra Pradesh (CIN:
                      U45200AP1992PLC014532).
                    </p>

                    <p>
                      Over the years, Dakshin Infra Structures has delivered landmark
                      projects across Telangana and Andhra Pradesh, fulfilling 
                      the aspirations of both individuals and businesses with 
                      unparalleled commitment and expertise.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Our Values */}
        <section className="py-12 md:py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12 animate-fade-in">
              <Badge className="mb-4 bg-blue-100/80 backdrop-blur-sm text-blue-700 border-blue-200/50 px-4 py-2 rounded-full text-sm font-semibold">
                Our Values
              </Badge>
              <h2 className="text-4xl sm:text-5xl font-bold mb-6 leading-tight">
                <span className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  What Drives Us
                </span>
                <br />
                <span className="bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                  Forward
                </span>
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto font-light">
                Our core values shape every decision we make and every
                relationship we build.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {values.map((value, index) => {
                const Icon = value.icon;
                return (
                  <div
                    key={index}
                    className="group bg-white/80 backdrop-blur-sm rounded-3xl p-8 text-center hover:shadow-2xl transition-all duration-500 border border-white/50 hover:border-blue-200/50 hover:transform hover:-translate-y-2 animate-slide-in-up"
                    style={{ animationDelay: `${index * 200}ms` }}
                  >
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <Icon className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-4">
                      {value.title}
                    </h3>
                    <p className="text-slate-600 leading-relaxed font-light">
                      {value.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Leadership Message */}
        <section className="py-12 md:py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12 animate-fade-in">
              <Badge className="mb-4 bg-blue-100/80 backdrop-blur-sm text-blue-700 border-blue-200/50 px-4 py-2 rounded-full text-sm font-semibold">
                Leadership Message
              </Badge>
              <h2 className="text-4xl sm:text-5xl font-bold mb-6 leading-tight">
                <span className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  Our Commitment
                </span>
                <br />
                <span className="bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                  To You
                </span>
              </h2>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-white/50 shadow-xl hover:shadow-2xl transition-all duration-500 relative">
              <div className="absolute top-6 left-6 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Quote className="w-6 h-6 text-blue-600" />
              </div>
              <blockquote className="text-lg md:text-xl text-slate-700 leading-relaxed text-center italic font-light pt-4">
                "Commercial real estate is not just about buildings and land;
                it's about dreams, aspirations, and creating lasting value for
                our investors. Every project we undertake is a testament to our
                commitment to excellence and our belief in the transformative
                power of strategic real estate investments."
              </blockquote>
              <div className="text-center mt-8 pt-6 border-t border-slate-200/50">
                <p className="text-slate-600 font-semibold">
                  Team, Dakshin Infra Structures Pvt Ltd.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Floating Elements */}
      <div className="absolute bottom-20 left-10 w-6 h-6 bg-blue-400/30 rounded-full animate-float"></div>
      <div className="absolute top-40 right-20 w-8 h-8 bg-indigo-400/20 rounded-full animate-float" style={{animationDelay: '2s'}}></div>
      <div className="absolute top-60 left-1/4 w-4 h-4 bg-sky-400/30 rounded-full animate-float" style={{animationDelay: '4s'}}></div>
    </div>
  );
};

export default About;