import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  MapPin, 
  Square, 
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Globe,
  ShoppingCart,
  Download,
  Play,
  Phone,
  Mail,
  Star,
  TrendingUp,
  ShieldCheck,
  Utensils,
  Dumbbell,
  Car,
  Wifi,
  Waves,
  Loader
} from "lucide-react";
import Navigation from "@/components/Navigation";
import InvestmentSchemes from "@/pages/InvestmentSchemes";
import { useAuth } from "@/contexts/AuthContext";
import { projectApi } from "@/api/projectApi";
import { ProjectData, ProjectStatus, PropertyType } from "@/api/models/projectModels";

interface FormattedProject extends Omit<ProjectData, 'status' | 'property_type'> {
  status: "Available" | "Sold Out" | "Coming Soon";
  type: string;
  price: string;
  area: string;
  gallery: string[];
  highlights: string[];
  amenities: any[];
  investmentHighlights: any[];
}

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [project, setProject] = useState<FormattedProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchProject(id);
    }
  }, [id]);

  const fetchProject = async (projectId: string) => {
  try {
    setLoading(true);
    setError(null);
    
    const response = await projectApi.getById(projectId);
    const data = response.data;
    
    if (!data) {
      throw new Error("No project data received");
    }

    const projectData = data.data;

    if (!projectData) {
      throw new Error("No project details found");
    }

    const formattedProject: FormattedProject = {
      ...projectData,
      status: formatStatus(projectData.status),
      type: projectData.property_type ? 
        projectData.property_type.charAt(0).toUpperCase() + projectData.property_type.slice(1) : 
        'Unknown',
      price: projectData.base_price ? `₹${(projectData.base_price / 100000).toFixed(0)} Lakhs` : 'Price not available',
      area: projectData.available_units ? `${projectData.available_units} sqft` : 'N/A',
      gallery: projectData.gallery_images?.map((img: any) => img.url) || [],
      highlights: projectData.key_highlights || [],
      amenities: projectData.amenities?.map((amenity: any) => ({
        ...amenity,
        icon: getIconComponent(amenity.icon),
      })) || [],
      investmentHighlights: projectData.investment_highlights?.map((highlight: string) => {
        const [title, ...valueParts] = highlight.split(': ');
        return { 
          title: title.trim(), 
          value: valueParts.join(': ').trim(), 
          subtitle: '' 
        };
      }) || [],
    };
    
    setProject(formattedProject);
    setLoading(false);
  } catch (error) {
    console.error('Error fetching project:', error);
    setError('Failed to load project details. Please try again later.');
    setLoading(false);
  }
  };

  const formatStatus = (status: string): "Available" | "Sold Out" | "Coming Soon" => {
    if (status === "available") return "Available";
    if (status === "sold_out") return "Sold Out";
    if (status === "coming_soon") return "Coming Soon";
    return "Available";
  };

  const getIconComponent = (iconName: string) => {
    switch (iconName?.toLowerCase()) {
      case 'shield': return ShieldCheck;
      case 'utensils': return Utensils;
      case 'dumbbell': return Dumbbell;
      case 'car': return Car;
      case 'wifi': return Wifi;
      case 'waves': return Waves;
      default: return Star;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-20 flex items-center justify-center min-h-screen">
          <Loader className="w-8 h-8 animate-spin text-yellow-500" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-20 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Error Loading Project</h1>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Link to="/projects">
              <Button variant="luxury">Back to Projects</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-20 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Project Not Found</h1>
            <Link to="/projects">
              <Button variant="luxury">Back to Projects</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % project.gallery.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + project.gallery.length) % project.gallery.length);
  };

  const handleWebsiteClick = () => {
    if (project.website_url) {
      window.open(project.website_url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleBuyNow = () => {
    if (isAuthenticated) {
      navigate(`/purchase/${id}`);
    } else {
      navigate('/login', { state: { from: `/purchase/${id}` } });
    }
  };

  const currentImage = project.gallery?.length > 0 ? project.gallery[currentImageIndex] : null;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-16">
        {/* Hero Banner */}
        <section className="relative h-[70vh] overflow-hidden">
          {currentImage && (
            <div 
              className="absolute inset-0 bg-cover bg-center transition-all duration-500"
              style={{ backgroundImage: `url(${currentImage})` }}
            />
          )}
          <div className="absolute inset-0 bg-black/40" />
          
          {/* Gallery Navigation */}
          {project.gallery?.length > 1 && (
            <>
              <div className="absolute inset-y-0 left-4 flex items-center">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={prevImage}
                  className="bg-black/20 border-white/20 text-white hover:bg-black/40"
                >
                  <ChevronLeft className="w-6 h-6" />
                </Button>
              </div>
              
              <div className="absolute inset-y-0 right-4 flex items-center">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={nextImage}
                  className="bg-black/20 border-white/20 text-white hover:bg-black/40"
                >
                  <ChevronRight className="w-6 h-6" />
                </Button>
              </div>
            </>
          )}

          {/* Content Overlay */}
          <div className="absolute inset-0 flex items-end">
            <div className="w-full p-8 bg-gradient-to-t from-black/80 to-transparent">
              <div className="max-w-7xl mx-auto">
                <Link to="/projects" className="inline-flex items-center text-white/80 hover:text-white mb-4 transition-colors">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Projects
                </Link>
                
                <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
                  <div>
                    <div className="flex items-center gap-4 mb-4 flex-wrap">
                      <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30">
                        {project.status}
                      </Badge>
                      {project.website_url && (
                        <button
                          onClick={handleWebsiteClick}
                          className="inline-flex items-center text-white/80 hover:text-white transition-colors bg-black/20 px-3 py-2 rounded-lg border border-white/20 hover:border-white/40"
                        >
                          <Globe className="w-4 h-4 mr-2" />
                          <span className="text-sm">Visit Website</span>
                          <ExternalLink className="w-3 h-3 ml-2" />
                        </button>
                      )}
                    </div>
                    <h1 className="text-4xl lg:text-6xl font-bold text-white glow-text mb-4">
                      {project.title}
                    </h1>
                    <div className="flex items-center text-white/80 mb-4">
                      <MapPin className="w-5 h-5 mr-2" />
                      <span className="text-lg">{project.location}</span>
                    </div>
                    <div className="flex items-center gap-6 text-white/80 flex-wrap">
                      <div className="flex items-center">
                        <Square className="w-5 h-5 mr-2" />
                        <span>{project.area}</span>
                      </div>
                      <div className="flex items-center">
                        <TrendingUp className="w-5 h-5 mr-2" />
                        <span>{project.type}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-4xl lg:text-5xl font-bold text-yellow-500 glow-text mb-2">
                      {project.price}
                    </div>
                    <div className="text-white/60">
                      Starting investment
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Gallery Indicators */}
          {project.gallery?.length > 1 && (
            <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex gap-2">
              {project.gallery.map((_: any, index: number) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentImageIndex ? 'bg-yellow-500' : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
          )}
        </section>

        {/* Main Content */}
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-3 gap-12">
              {/* Left Content */}
              <div className="lg:col-span-2 space-y-8">
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-4 bg-card">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="amenities">Features</TabsTrigger>
                    <TabsTrigger value="investment">Investment</TabsTrigger>
                    <TabsTrigger value="gallery">Gallery</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview" className="space-y-6">
                    <div className="card-luxury p-8">
                      <h2 className="text-2xl font-bold mb-4 glow-text">Project Overview</h2>
                      {project.description && (
                        <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                          {project.description}
                        </p>
                      )}
                      {project.long_description && (
                        <p className="text-muted-foreground leading-relaxed mb-6">
                          {project.long_description}
                        </p>
                      )}
                      
                      {project.highlights?.length > 0 && (
                        <>
                          <h3 className="text-xl font-semibold mb-4 text-foreground">Key Highlights</h3>
                          <div className="grid md:grid-cols-2 gap-3">
                            {project.highlights.map((highlight: string, index: number) => (
                              <div key={index} className="flex items-center">
                                <Star className="w-4 h-4 text-yellow-500 mr-3" />
                                <span className="text-muted-foreground">{highlight}</span>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>

                    {/* Investment Highlights */}
                    {project.investmentHighlights?.length > 0 && (
                      <div className="card-luxury p-8">
                        <h3 className="text-xl font-semibold mb-6 text-foreground flex items-center">
                          <TrendingUp className="w-5 h-5 mr-2 text-yellow-500" />
                          Investment Highlights
                        </h3>
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                          {project.investmentHighlights.map((item: any, index: number) => (
                            <div key={index} className="text-center p-4 bg-background rounded-lg border border-border">
                              <div className="text-2xl font-bold text-yellow-500 glow-text mb-1">
                                {item.value}
                              </div>
                              <div className="font-medium text-foreground mb-1">{item.title}</div>
                              {item.subtitle && (
                                <div className="text-sm text-muted-foreground">{item.subtitle}</div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="amenities">
                    <div className="card-luxury p-8">
                      <h2 className="text-2xl font-bold mb-6 glow-text">Project Features & Amenities</h2>
                      {project.amenities?.length > 0 ? (
                        <div className="grid md:grid-cols-2 gap-6">
                          {project.amenities.map((amenity: any, index: number) => {
                            const Icon = amenity.icon;
                            return (
                              <div key={index} className="flex items-start space-x-4 p-4 bg-background rounded-lg border border-border">
                                <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <Icon className="w-6 h-6 text-yellow-50" />
                                </div>
                                <div>
                                  <h4 className="font-semibold text-foreground mb-1">{amenity.name}</h4>
                                  <p className="text-sm text-muted-foreground">{amenity.description}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-muted-foreground">No amenities information available.</p>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="investment">
                    <div className="card-luxury p-8">
                      <InvestmentSchemes projectName={project.title} />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="gallery">
                    <div className="card-luxury p-8">
                      <h2 className="text-2xl font-bold mb-6 glow-text">Project Gallery</h2>
                      {project.gallery?.length > 0 ? (
                        <div className="grid md:grid-cols-2 gap-4">
                          {project.gallery.map((image: string, index: number) => (
                            <div 
                              key={index} 
                              className="aspect-[4/3] overflow-hidden rounded-lg cursor-pointer group"
                              onClick={() => setCurrentImageIndex(index)}
                            >
                              <img
                                src={image}
                                alt={`Gallery ${index + 1}`}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground">No gallery images available.</p>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Right Sidebar */}
              <div className="space-y-6">
                {/* CTA Card */}
                <div className="card-luxury p-6">
                  <h3 className="text-xl font-semibold mb-4 text-foreground">Ready to Invest?</h3>
                  <p className="text-muted-foreground mb-6">
                    Join thousands of successful investors and secure your commercial property today.
                  </p>
                  
                  <div className="space-y-3 mb-6">
                    <Button 
                      onClick={handleBuyNow}
                      variant="luxury" 
                      className="w-full shadow-none bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-500/90 hover:to-yellow-600/90" 
                      size="lg"
                    >
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      {isAuthenticated ? 'Buy Now' : 'Login to Buy'}
                    </Button>
                    
                    <Button variant="outline-luxury" className="w-full">
                      <Download className="w-4 h-4 mr-2" />
                      Download Brochure
                    </Button>
                    
                    <Button variant="outline" className="w-full bg-gradient-to-r from-secondary/10 to-secondary/5 hover:from-secondary/20 hover:to-secondary/10">
                      <Play className="w-4 h-4 mr-2" />
                      Virtual Tour
                    </Button>
                  </div>

                  <div className="border-t border-border pt-4">
                    <h4 className="font-medium mb-3 text-foreground">Contact Our Experts</h4>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Phone className="w-4 h-4 mr-2 text-yellow-500" />
                        Available on website
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Mail className="w-4 h-4 mr-2 text-yellow-500" />
                        Contact form available
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Info */}
                <div className="card-luxury p-6">
                  <h3 className="text-lg font-semibold mb-4 text-foreground">Quick Information</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Property Type</span>
                      <span className="text-foreground">{project.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">RERA Number</span>
                      <span className="text-foreground">{project.rera_number || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Building Permission</span>
                      <span className="text-foreground">{project.building_permission || 'N/A'}</span>
                    </div>
                    {project.total_units && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Units</span>
                          <span className="text-foreground">{project.total_units}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Available Units</span>
                          <span className="text-foreground text-green-600">{project.available_units}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProjectDetail;