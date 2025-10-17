import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Award, Users, TrendingUp, Shield, Star, Target } from "lucide-react";
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
      description: "We believe in complete transparency in all our dealings, ensuring our investors make informed decisions."
    },
    {
      icon: Star,
      title: "Quality Excellence",
      description: "Every property is carefully selected and developed to meet the highest standards of luxury and quality."
    },
    {
      icon: TrendingUp,
      title: "Guaranteed Returns",
      description: "Our proven track record of delivering guaranteed rental returns makes us a reliable investment partner."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-20 pb-12">
        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
              About Ramya Constructions
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 glow-text">
              Your Trusted Partner in
              <span className="text-primary block">Commercial Real Estate</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Ramya Constructions Ltd., incorporated on 17th December 1992, is a reputed realty company 
              operating under the Kapil Group — a leading conglomerate in Telangana and Andhra Pradesh.
            </p>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 px-4 bg-card/30">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className={`card-luxury text-center p-8 animate-fade-in`} style={{animationDelay: `${index * 200}ms`}}>
                    <div className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-6">
                      <Icon className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <h3 className="text-3xl font-bold text-primary glow-text mb-2">{stat.value}</h3>
                    <p className="text-muted-foreground">{stat.label}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Our Story */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
                Our Story
              </Badge>
              <h2 className="text-4xl font-bold mb-6 glow-text">
                Building Dreams, Creating Wealth
              </h2>
            </div>
            
            <div className="card-luxury p-8 md:p-12">
              <div className="prose prose-lg max-w-none">
                <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                  Ramya Constructions Ltd., incorporated on 17th December 1992, is a reputed realty company 
                  operating under the Kapil Group — a leading conglomerate in Telangana and Andhra Pradesh. 
                  Headquartered in Vijayawada, Andhra Pradesh (CIN: U45200AP1992PLC014532).
                </p>
                
                <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                  Over the years, Ramya Constructions has delivered landmark projects across Telangana and 
                  Andhra Pradesh, spanning commercial spaces, residential apartments, and open plots — 
                  fulfilling the aspirations of both individuals and businesses.
                </p>
                
                <p className="text-muted-foreground text-lg leading-relaxed">
                  The company is also a promoter of Kapil Business Park, Shamshabad, a flagship commercial 
                  project redefining modern business infrastructure in Hyderabad. Within this development, 
                  Ramya Constructions oversees the sale of commercial units on the 4th floor, comprising 
                  36,945 sq.ft. of built-up area and 467.66 sq.yds. of undivided land share.
                </p>
        
              </div>
            </div>
          </div>
        </section>

        {/* Our Values */}
        <section className="py-20 px-4 bg-card/30">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
                Our Values
              </Badge>
              <h2 className="text-4xl font-bold mb-6 glow-text">
                What Drives Us Forward
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Our core values shape every decision we make and every relationship we build.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {values.map((value, index) => {
                const Icon = value.icon;
                return (
                  <div key={index} className={`card-luxury p-8 text-center animate-fade-in`} style={{animationDelay: `${index * 200}ms`}}>
                    <div className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-6">
                      <Icon className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold mb-4 text-foreground">{value.title}</h3>
                    <p className="text-muted-foreground">{value.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Leadership Message */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
                Leadership Message
              </Badge>
              <h2 className="text-4xl font-bold mb-6 glow-text">
                Our Commitment To You
              </h2>
            </div>
            
            <div className="card-luxury p-8 md:p-12">
              <blockquote className="text-xl text-muted-foreground italic leading-relaxed text-center">
                "Commercial real estate is not just about buildings and land; it's about dreams, aspirations, and 
                creating lasting value for our investors. Every project we undertake is a testament to 
                our commitment to excellence and our belief in the transformative power of strategic real estate investments."
              </blockquote>
              <div className="text-center mt-8">
              <p className="text-muted-foreground">Team, Ramya Constructions Ltd.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;