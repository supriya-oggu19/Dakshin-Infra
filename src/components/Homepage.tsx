import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Play, Building2, TrendingUp, Award, Users, MapPin, Phone, Mail, Star, Shield, Zap, Briefcase, ShieldCheck } from "lucide-react";
import Navigation from "@/components/Navigation";
import ProjectCard from "@/components/ProjectCard";
import heroImage from "@/assets/image.png";
import { Link } from "react-router-dom";

import { projectApi } from "@/api/projectApi";
import FAQ from "@/components/FAQ";

// NO Footer import here
// NO <Footer /> in return

const Homepage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [featuredProjects, setFeaturedProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedProjects();
  }, []);

  const fetchFeaturedProjects = async () => {
    try {
      const response = await projectApi.list({ page: 1, limit: 3 });
      const data = response.data;

      const formattedProjects = data.projects.map((project: any) => ({
        ...project,
        status: formatStatus(project.status),
        type: project.property_type.charAt(0).toUpperCase() + project.property_type.slice(1),
        price: `₹${(project.base_price / 100000).toFixed(0)} Lakhs`,
        area: project.available_units + " Sq.ft" || "N/A",
        image: project.gallery_images?.[0] || null,
        priceRange: getPriceRange(project.base_price),
        description: project.description || "Premium property investment opportunity",
      }));

      setFeaturedProjects(formattedProjects);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setLoading(false);
    }
  };

  const formatStatus = (status: string): "Available" | "Sold Out" | "Coming Soon" => {
    if (status === "available") return "Available";
    if (status === "sold_out") return "Sold Out";
    if (status === "coming_soon") return "Coming Soon";
    return "Available";
  };

  const getPriceRange = (basePrice: number): string => {
    const lakhs = basePrice / 100000;
    if (lakhs <= 20) return "15-20";
    if (lakhs <= 70) return "60-70";
    if (lakhs <= 80) return "70-80";
    if (lakhs <= 90) return "80-90";
    if (lakhs <= 100) return "90-100";
    return "100+";
  };

  const stats = [
    { number: "500+", label: "Happy Investors", icon: Users, color: "text-primary" },
    { number: "₹250Cr+", label: "Assets Under Management", icon: Building2, color: "text-secondary" },
    { number: "18%*", label: "Up to Returns", icon: TrendingUp, color: "text-primary" },
    { number: "5+", label: "Premium Projects", icon: Award, color: "text-secondary" }
  ];

  const benefits = [
    {
      title: "Financial Security",
      description: "Build a recession-proof income stream that protects your financial future",
      icon: Shield
    },
    {
      title: "Family Care",
      description: "Ensure your parents and Childern' needs are met with steady passive income",
      icon: Users
    },
    {
      title: "Steady Growth",
      description: "Navigate business off-seasons with confidence and consistent returns",
      icon: TrendingUp
    },
    {
      title: "Inflation Protection",
      description: "Safeguard your wealth against inflation with appreciating real estate income",
      icon: Zap
    },
    {
      title: "Retirement Planning",
      description: "Create a worry-free retirement with guaranteed rental income",
      icon: Star
    },
    {
      title: "Life Goals",
      description: "Achieve  financial milestone without compromising your lifestyle",
      icon: Award
    }
  ];

  const testimonials = [
    {
      name: "Sarvesh Kalyan",
      role: "Businessman",
      content: "The Kapil Group's stellar reputation and proven track record in Hyderabad's financial district made this investment decision effortless. Their transparency and professionalism are unmatched.",
      rating: 5,
      image: "SK"
    },
    {
      name: "Lakkineni Sravani",
      role: "IT Professional",
      content: "As a working professional, I needed an investment that didn't require active management. Kapil Business Park delivers exactly that - passive income with professional oversight.",
      rating: 5,
      image: "LS"
    },
    {
      name: "Anil Kumar",
      role: "Doctor",
      content: "The location near the international airport and the quality of tenants attracted to this project ensure stable, long-term rental income. It's a smart investment choice.",
      rating: 5,
      image: "AK"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero Section */}
      <section
        className="relative min-h-screen flex items-center justify-center pt-20 pb-16"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(63, 63, 65, 0.8) 0%, rgba(78, 79, 82, 0.6) 50%, rgba(84, 88, 91, 0.4) 100%), url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="relative z-10 container-professional text-center text-white">
          <div className="max-w-5xl mx-auto">
            <div className="mb-8 animate-slide-in-up" style={{ animationDelay: '0.1s' }}>
              <Badge className="bg-yellow-600/20 text-yellow-300 border-yellow-600/30 px-4 py-2 text-sm font-medium backdrop-blur-sm">
                Premium Commercial Real Estate Investment
              </Badge>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 leading-tight animate-slide-in-up" style={{ animationDelay: '0.2s' }}>
              Build Wealth with
              <span className="text-yellow-400 block mt-2">Smart Real Estate Investment</span>
            </h1>

            <p className="text-lg md:text-xl mb-12 text-white/90 leading-relaxed max-w-3xl mx-auto animate-slide-in-up" style={{ animationDelay: '0.3s' }}>
              Own premium commercial properties in Hyderabad's fastest-growing business district.
              Start with ₹36 lakhs and earn guaranteed rental income up to 18%<sup>*</sup> annually.
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto animate-fade-in-scale" style={{ animationDelay: '0.4s' }}>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center border border-white/20">
                <div className="text-2xl font-bold text-yellow-400 mb-2">₹36L</div>
                <div className="text-sm text-white/80 font-medium">Minimum Investment</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center border border-white/20">
                <div className="text-2xl font-bold text-yellow-400 mb-2">
                  Upto 18%<sup>*</sup>
                </div>
                <div className="text-sm text-white/80 font-medium">Annual Returns</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center border border-white/20">
                <div className="text-2xl font-bold text-yellow-400 mb-2">500+</div>
                <div className="text-sm text-white/80 font-medium">Happy Investors</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-in-up" style={{ animationDelay: '0.5s' }}>
              <Link to="/projects">
                <Button className="bg-yellow-600 hover:bg-yellow-700 text-white px-8 py-4 text-base font-semibold rounded-lg transition-all duration-300 hover:transform hover:scale-105">
                  Explore Investment Options
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/login">
                <Button className="border-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-blue-900 px-8 py-4 text-base font-semibold rounded-lg bg-transparent transition-all duration-300 hover:transform hover:scale-105">
                  <Play className="mr-2 w-5 h-5" />
                  Start Investing Now
                </Button>
              </Link>
            </div>

            <div className="mt-12 animate-fade-in-scale" style={{ animationDelay: '0.6s' }}>
              <div className="inline-flex items-center bg-green-600/20 border border-green-500/30 px-4 py-2 rounded-lg backdrop-blur-sm">
                <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
                <span className="text-sm font-medium text-green-300">RERA Approved & Legally Compliant</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - FIXED: All cards same height & responsive */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container-professional">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 min-h-[240px] md:min-h-[300px]">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="group relative h-full animate-slide-in-up hover:-translate-y-2 transition-all duration-500"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className="relative h-full bg-gradient-to-br from-white via-gray-50 to-white 
                            p-5 sm:p-6 md:p-8 rounded-3xl shadow-lg border border-gray-100 
                            overflow-hidden flex flex-col justify-between 
                            w-[90%] sm:w-auto mx-auto">
                    {/* Hover gradient layers */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div className="absolute inset-0 bg-gradient-to-br from-yellow-50 via-transparent to-yellow-50"></div>
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-yellow-100 to-transparent rounded-full transform translate-x-16 -translate-y-16"></div>
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-yellow-100 to-transparent rounded-full transform -translate-x-12 translate-y-12"></div>
                    </div>

                    <div className="absolute top-0 left-1/2 w-0 h-1 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 group-hover:w-full group-hover:left-0 transition-all duration-700 ease-out"></div>

                    <div className="relative z-10 flex flex-col items-center text-center flex-1 justify-center space-y-3 sm:space-y-4">
                      {/* Fixed-size icon container */}
                      <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-yellow-100 via-yellow-50 to-white rounded-2xl flex items-center justify-center mx-auto transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 shadow-md">
                        <Icon className="w-7 h-7 sm:w-8 sm:h-8 text-yellow-600 group-hover:text-yellow-700 transition-colors duration-300" />
                      </div>

                      {/* Number */}
                      <div className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-800 via-gray-900 to-black bg-clip-text text-transparent group-hover:from-yellow-600 group-hover:via-yellow-700 group-hover:to-yellow-800 transition-all duration-500">
                        {stat.number}
                      </div>

                      {/* Label */}
                      <div className="text-xs sm:text-sm md:text-base font-semibold text-gray-700 group-hover:text-gray-900 transition-colors duration-300 text-balance">
                        {stat.label}
                      </div>
                    </div>

                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-200 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </div>

                  <div className="absolute inset-0 rounded-3xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md bg-gradient-to-br from-yellow-100 to-yellow-200"></div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="py-20 bg-white">
        <div className="container-professional">
          <div className="text-center mb-16 animate-fade-in-scale">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
              Featured <span className="text-yellow-600">Projects</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Discover our premium commercial properties offering exceptional investment opportunities
              in Hyderabad's most promising locations.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {loading ? (
              <div className="col-span-3 text-center py-12">
                <p className="text-lg text-gray-600">Loading featured projects...</p>
              </div>
            ) : (
              featuredProjects.map((project, index) => (
                <div key={project.id} className="animate-slide-in-up" style={{ animationDelay: `${index * 200}ms` }}>
                  <ProjectCard {...project} />
                </div>
              ))
            )}
          </div>

          <div className="text-center mt-16 animate-slide-in-up" style={{ animationDelay: '0.6s' }}>
            <Link to="/projects">
              <Button className="border-2 border-yellow-600 text-yellow-600 hover:bg-yellow-600 hover:text-white px-10 py-4 text-lg bg-transparent transition-all duration-300 hover:transform hover:scale-105">
                Explore Investment Opurtunities
                <ArrowRight className="ml-3 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container-professional">
          <div className="text-center mb-16 animate-fade-in-scale">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
              Start <span className="text-yellow-600">Investment</span> for a Stable Life
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Transform your financial future with strategic real estate investment. Here is how{" "}
              <span className="font-semibold text-yellow-600">Kapil Business Park</span> becomes your pathway to financial freedom and peace of mind.
            </p>
          </div>



          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="group relative bg-white shadow-md border rounded-xl animate-slide-in-up hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden" style={{ animationDelay: `${index * 150}ms` }}>
                <div className="absolute top-0 left-1/2 w-0 h-1 bg-gradient-to-r from-yellow-400 to-yellow-600 group-hover:w-full group-hover:left-0 transition-all duration-500 ease-out"></div>
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-6 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                    <benefit.icon className="w-8 h-8 text-yellow-600 group-hover:text-yellow-700" />
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-gray-900 group-hover:text-yellow-600 transition-colors duration-300">{benefit.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="container-professional">
          <div className="text-center mb-16 animate-fade-in-scale">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
              What Our <span className="text-yellow-600">Investors</span> Say
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Hear from successful investors who have achieved financial security through strategic real estate investment with us.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="group relative bg-white shadow-md border rounded-xl animate-slide-in-up hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden" style={{ animationDelay: `${index * 200}ms` }}>
                <div className="absolute top-0 left-1/2 w-0 h-1 bg-gradient-to-r from-yellow-400 to-yellow-600 group-hover:w-full group-hover:left-0 transition-all duration-500 ease-out"></div>
                <CardContent className="p-8">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mr-4 transition-transform duration-300 hover:scale-110">
                      <span className="text-yellow-600 font-semibold text-sm">{testimonial.image}</span>
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">{testimonial.name}</div>
                      <div className="text-sm text-gray-600">{testimonial.role}</div>
                    </div>
                  </div>
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current text-yellow-500" />
                    ))}
                  </div>
                  <p className="text-gray-600 leading-relaxed italic">"{testimonial.content}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <FAQ />

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-gray-100 to-blue-50">
        <div className="container-professional">
          <div className="max-w-4xl mx-auto text-center animate-fade-in-scale">
            <div className="mb-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
                Why Ramya Constructions is Your{" "}
                <span className="text-yellow-600">Passport to Prosperity</span>
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
                A perfect combination of affordability, transparency, and professional
                management that creates a win-win opportunity for every investor.
              </p>
            </div>

            {/* --- 3 Feature Cards --- */}
            <div className="grid md:grid-cols-3 gap-6 mb-10">
              {[
                {
                  icon: TrendingUp,
                  title: "Unmatched Affordability",
                  desc: "Starting at just ₹36 lakhs, we’ve made premium commercial real estate accessible to smart investors. Experience wealth creation that’s both affordable and exceptionally rewarding.",
                  color: "yellow",
                },
                {
                  icon: ShieldCheck,
                  title: "Complete Transparency",
                  desc: "We help investors make confident choices by ensuring every property we recommend is transparent, legally verified, and RERA-compliant.",
                  color: "blue",
                },
                {
                  icon: Briefcase,
                  title: "Professional Management",
                  desc: "You own the asset, and we assist in handling everything else. Our expert facility management team ensures your investment generates returns while you focus on what matters most.",
                  color: "yellow",
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="group relative bg-white p-6 text-center rounded-xl shadow-md border animate-slide-in-up hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div
                    className={`absolute top-0 left-1/2 w-0 h-1 ${item.color === "yellow"
                      ? "bg-gradient-to-r from-yellow-400 to-yellow-600"
                      : "bg-gradient-to-r from-blue-400 to-blue-600"
                      } group-hover:w-full group-hover:left-0 transition-all duration-500 ease-out`}
                  ></div>

                  <div
                    className={`w-12 h-12 ${item.color === "yellow" ? "bg-yellow-100" : "bg-blue-100"
                      } rounded-xl flex items-center justify-center mx-auto mb-3 transition-transform duration-300 hover:scale-110`}
                  >
                    <item.icon
                      className={`w-6 h-6 ${item.color === "yellow" ? "text-yellow-600" : "text-blue-900"
                        }`}
                    />
                  </div>
                  <h3 className="text-base font-bold mb-2 text-gray-900">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </div>
              ))}
            </div>

           

            {/* --- CTA Buttons --- */}
            <div
              className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-in-up"
              style={{ animationDelay: "0.4s" }}
            >
              <Link to="/login">
                <Button className="bg-yellow-600 hover:bg-yellow-700 text-white px-8 py-4 text-base font-semibold rounded-lg transition-all duration-300 hover:transform hover:scale-105">
                  Start Your Investment Journey
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button className="border-2 border-yellow-600 text-yellow-600 hover:bg-yellow-600 hover:text-white px-8 py-4 text-base font-semibold rounded-lg bg-transparent transition-all duration-300 hover:transform hover:scale-105">
                  Schedule a Consultation
                  <Phone className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>




    </div>
  );
};

export default Homepage;