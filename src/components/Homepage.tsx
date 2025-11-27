import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Play,
  Building2,
  TrendingUp,
  Award,
  Users,
  Star,
  Zap,
  Shield,
} from "lucide-react";

import Navigation from "@/components/Navigation";
import ProjectCard from "@/components/ProjectCard";
import heroImage from "@/assets/image2.png";
import { Link } from "react-router-dom";

import { projectApi } from "@/api/projectApi";
import FAQ from "@/components/FAQ";

const Homepage = () => {
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
        status:
          project.status === "available"
            ? "Available"
            : project.status === "sold_out"
            ? "Sold Out"
            : "Coming Soon",
        type:
          project.property_type.charAt(0).toUpperCase() +
          project.property_type.slice(1),
        price: `₹${(project.base_price / 100000).toFixed(0)} Lakhs`,
        area: project.available_units + " Sq.ft",
        image: project.gallery_images?.[0] || null,
        priceRange: getPriceRange(project.base_price),
        description:
          project.description || "Premium commercial real estate opportunity",
      }));

      setFeaturedProjects(formattedProjects);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching projects:", error);
      setLoading(false);
    }
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
    { number: "500+", label: "Happy Investors", icon: Users },
    { number: "₹250Cr+", label: "Assets Managed", icon: Building2 },
    { number: "18%*", label: "Up to Returns", icon: TrendingUp },
    { number: "5+", label: "Premium Projects", icon: Award },
  ];

  const benefits = [
    {
      title: "Financial Security",
      description:
        "Build steady, recession-proof passive income with commercial real estate.",
      icon: Shield,
    },
    {
      title: "Stable Growth",
      description:
        "Earn consistent rental returns backed by institutional-grade real estate.",
      icon: TrendingUp,
    },
    {
      title: "Inflation-Proof Wealth",
      description:
        "Real estate protects your money from inflation & market volatility.",
      icon: Zap,
    },
  ];

  const testimonials = [
    {
      name: "Sarvesh Kalyan",
      role: "Businessman",
      content:
        "Their transparency and professionalism made the investment process smooth and trustworthy.",
      rating: 5,
      image: "SK",
    },
    {
      name: "Lakkineni Sravani",
      role: "IT Professional",
      content:
        "A perfect passive investment — zero management headache.",
      rating: 5,
      image: "LS",
    },
    {
      name: "Anil Kumar",
      role: "Doctor",
      content:
        "A great location and stable tenants ensure long-term rental income.",
      rating: 5,
      image: "AK",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* ================= HERO SECTION (Updated: No Overlay) ================= */}
      <section
        className="relative min-h-screen flex items-center justify-center pt-20 pb-16"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Slight dark fade only at bottom to read text */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40"></div>

        <div className="relative z-10 container-professional text-center text-white">
          <Badge className="bg-white/20 text-white px-4 py-2 text-sm font-medium backdrop-blur-sm mb-6">
            Premium Commercial Real Estate Investment
          </Badge>

          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6 drop-shadow-lg">
            Secure Your Future With
            <span className="block mt-2 text-[#0E7FF5] drop-shadow-lg">
              Smart Real Estate Investing
            </span>
          </h1>

          <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto mb-10 drop-shadow-lg">
            Invest in Hyderabad’s fastest-growing commercial hub.  
            Start with ₹36 lakhs and get stable rental income up to 18%* yearly.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/projects">
              <Button className="bg-[#0A4D96] hover:bg-[#003B73] text-white px-8 py-4 text-base font-semibold rounded-lg">
                Explore Investment Options
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>

            <Link to="/login">
              <Button className="border-2 border-[#0E7FF5] text-white bg-[#0E7FF5] hover:bg-[#0E7FF5] hover:text-white px-8 py-4 text-base font-semibold rounded-lg">
                <Play className="mr-2 w-5 h-5" />
                Start Investing Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

     {/* ================= STATS ================= */}
<section className="py-24 bg-white">
  <div className="container-professional">
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <div
            key={i}
            className="group text-center p-8 border border-gray-100 bg-white 
                       hover:shadow-lg transition-all duration-300 rounded-xl 
                       hover:border-blue-200 relative overflow-hidden"
          >
            {/* Hover effect bar */}
            <div className="absolute top-0 left-0 w-full h-1 bg-transparent group-hover:bg-blue-600 transition-colors duration-300" />
            
            <div className="relative">
              {/* Icon with subtle background */}
              <div className="w-16 h-16 mx-auto mb-6 rounded-lg bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors duration-300">
                <Icon className="w-7 h-7 text-blue-600" />
              </div>
              
              {/* Stat number */}
              <h3 className="text-3xl font-bold text-gray-900 mb-3 font-sans">
                {stat.number}
              </h3>
              
              {/* Stat label */}
              <p className="text-gray-600 font-medium text-base tracking-normal">
                {stat.label}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  </div>
</section>

      {/* ================= FEATURED PROJECTS ================= */}
     <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
  <div className="container-professional text-center">
    {/* Header Section */}
    <div className="max-w-2xl mx-auto mb-16">
      <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
        Featured <span className="text-blue-600 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">Projects</span>
      </h2>
      <p className="text-xl text-gray-600 leading-relaxed">
        Explore high-return commercial spaces in Hyderabad's prime growth zones with exceptional investment potential.
      </p>
    </div>

    {/* Projects Grid */}
    <div className="grid md:grid-cols-3 gap-8 mb-12">
      {loading ? (
        <div className="col-span-3 flex justify-center items-center py-12">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-600 text-lg">Loading featured projects...</span>
          </div>
        </div>
      ) : (
        featuredProjects.map((p, i) => <ProjectCard key={i} {...p} />)
      )}
    </div>

    {/* CTA Button */}
    <Link to="/projects">
      <button className="group relative bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold px-12 py-4 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-lg border border-blue-500/30 flex items-center gap-3 mx-auto">
        <span>View All Projects</span>
        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
        
        {/* Hover effect background */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-700 to-blue-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
      </button>
    </Link>

    {/* Background decorative elements */}
    <div className="absolute top-20 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-10 blur-xl"></div>
    <div className="absolute bottom-20 right-10 w-24 h-24 bg-blue-300 rounded-full opacity-10 blur-xl"></div>
  </div>
</section>

      {/* ================= BENEFITS ================= */}
      <section className="py-24 bg-gradient-to-br from-blue-50/60 to-gray-100/80">
  <div className="container-professional">
    <div className="text-center max-w-3xl mx-auto">
      <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 tracking-tight">
        Why Invest With <span className="text-[#0A4D96]">Us?</span>
      </h2>
      <p className="text-xl text-gray-600 leading-relaxed">
        Strategic advantages that set us apart in commercial real estate investment
      </p>
    </div>

    <div className="grid md:grid-cols-3 gap-8 mt-16">
      {benefits.map((benefit, i) => {
        const Icon = benefit.icon;
        return (
          <Card
            key={i}
            className="group p-10 bg-white/90 backdrop-blur-sm border border-gray-200/60 
                       shadow-lg hover:shadow-2xl transition-all duration-500 rounded-3xl 
                       hover:-translate-y-2 relative overflow-hidden"
          >
            {/* Background gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white to-blue-50/0 
                          group-hover:to-blue-50/30 transition-all duration-500" />
            
            {/* Animated border effect */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent 
                          via-blue-100/20 to-transparent opacity-0 group-hover:opacity-100 
                          transition-opacity duration-700" />
            
            <div className="relative z-10">
              <div className="w-20 h-20 mx-auto mb-8 rounded-2xl bg-gradient-to-br from-blue-100 
                            to-indigo-100 flex items-center justify-center group-hover:from-blue-200 
                            group-hover:to-indigo-200 transition-all duration-500 shadow-inner">
                <Icon className="w-9 h-9 text-[#0A4D96] group-hover:scale-110 transition-transform duration-500" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-4 tracking-tight text-center">
                {benefit.title}
              </h3>
              
              <p className="text-gray-600 text-lg leading-relaxed text-center">
                {benefit.description}
              </p>
              
              {/* Subtle divider */}
              <div className="w-16 h-1 bg-gradient-to-r from-[#0A4D96] to-blue-400 
                            mx-auto mt-8 rounded-full opacity-0 group-hover:opacity-100 
                            transition-opacity duration-500" />
            </div>
          </Card>
        );
      })}
    </div>
  </div>
</section>

      {/* ================= TESTIMONIALS ================= */}
  <section className="py-24 bg-gradient-to-br from-gray-50 to-blue-50/20">
  <div className="container-professional">
    <div className="text-center max-w-3xl mx-auto mb-20">
      <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 tracking-tight">
        What Our <span className="text-[#0A4D96]">Investors</span> Say
      </h2>
      <p className="text-xl text-gray-600 leading-relaxed">
        Real experiences from our valued partners and investors
      </p>
    </div>

    <div className="grid md:grid-cols-3 gap-12 mt-8">
      {testimonials.map((t, i) => (
        <div 
          key={i} 
          className="group relative"
        >
          {/* Circular testimonial card */}
          <div className="relative p-12 bg-white/90 backdrop-blur-sm border-2 border-gray-200/60 
                        shadow-2xl hover:shadow-3xl transition-all duration-500 rounded-full 
                        h-96 w-96 mx-auto flex flex-col items-center justify-center 
                        hover:scale-105 hover:border-blue-200/80">
            
            {/* Background gradient */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white to-blue-50/20 
                          group-hover:from-blue-50/30 group-hover:to-indigo-50/10 transition-all duration-500" />
            
            {/* Subtle border animation */}
            <div className="absolute inset-0 rounded-full border-2 border-transparent bg-gradient-to-r from-blue-100/50 to-indigo-100/50 
                          opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative z-10 text-center">
              {/* Circular avatar */}
              <div className="w-20 h-20 bg-gradient-to-br from-[#0A4D96] to-blue-600 rounded-full 
                            flex items-center justify-center text-white font-bold text-xl mb-6 
                            mx-auto shadow-lg border-4 border-white/80">
                {t.image}
              </div>

              {/* Rating stars */}
              <div className="flex justify-center mb-6">
                {[...Array(t.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 text-[#0A4D96] fill-[#0A4D96] mx-1 transform group-hover:scale-110 transition-transform duration-300"
                  />
                ))}
              </div>

              {/* Testimonial content */}
              <div className="mb-6 max-w-xs">
                <p className="text-gray-700 text-base leading-relaxed font-medium line-clamp-4">
                  "{t.content}"
                </p>
              </div>

              {/* Client info */}
              <div>
                <h4 className="font-bold text-gray-900 text-lg mb-1">{t.name}</h4>
                <p className="text-gray-600 text-sm">{t.role}</p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>

    {/* Background decorative elements */}
    <div className="absolute left-10 top-1/4 w-32 h-32 bg-blue-200/10 rounded-full blur-xl" />
    <div className="absolute right-20 bottom-1/4 w-40 h-40 bg-indigo-200/10 rounded-full blur-xl" />
  </div>
</section>

      <FAQ />
    </div>
  );
};

export default Homepage;
