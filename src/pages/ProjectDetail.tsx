import { useState, useEffect } from "react";
import {
  useParams,
  Link,
  useNavigate,
} from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
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
  Loader,
  Building,
  Calendar,
  Layers,
  Home,
  Image as ImageIcon,
  FileText,
} from "lucide-react";

import Navigation from "@/components/Navigation";
import InvestmentSchemes from "@/pages/InvestmentSchemes";
import { useAuth } from "@/contexts/AuthContext";
import { projectApi } from "@/api/projectApi";
import {
  ProjectData,
  ProjectStatus,
  PropertyType,
  Amenity,
  GalleryImage,
} from "@/api/models/projectModels";
import { clearPurchaseAndBillingSession } from "@/utils/clearPurchaseBilling";

interface FormattedProject
  extends Omit<ProjectData, "status" | "property_type"> {
  status: "Available" | "Sold Out" | "Coming Soon";
  type: string;
  price: string;
  area: string;
  gallery: string[];
  highlights: string[];
  features: string[];
  amenities: Amenity[];
  investmentHighlights: { title: string; value: string; subtitle?: string }[];
  quickInfoItems: { label: string; value: string; icon: any }[];
}

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [project, setProject] = useState<FormattedProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageLoadError, setImageLoadError] = useState<{ [key: string]: boolean }>({});

  /* -------------------------- FETCH -------------------------- */
  useEffect(() => {
    if (id) fetchProject(id);
  }, [id]);

  useEffect(() => {
    if (!project?.gallery?.length) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((i) => (i + 1) % project.gallery.length);
    }, 4000); // every 4 seconds

    return () => clearInterval(interval);
  }, [project]);
  const { toast } = useToast();
  const fetchProject = async (projectId: string) => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await projectApi.getById(projectId);
      const projectData = data?.data;
      if (!projectData) throw new Error("No project details found");

      console.log("Project Data:", projectData); // Debug log
      console.log("Gallery Images:", projectData.gallery_images); // Debug log

      // Format quick info items
      const quickInfoItems = [];
      if (projectData.quick_info?.possession_date) {
        quickInfoItems.push({
          label: "Possession Date",
          value: projectData.quick_info.possession_date,
          icon: Calendar,
        });
      }
      if (projectData.quick_info?.total_towers) {
        quickInfoItems.push({
          label: "Total Towers",
          value: projectData.quick_info.total_towers.toString(),
          icon: Building,
        });
      }
      if (projectData.quick_info?.total_floors) {
        quickInfoItems.push({
          label: "Total Floors",
          value: projectData.quick_info.total_floors.toString(),
          icon: Layers,
        });
      }
      if (projectData.quick_info?.unit_variants?.length) {
        quickInfoItems.push({
          label: "Unit Variants",
          value: projectData.quick_info.unit_variants.join(", "),
          icon: Home,
        });
      }

      // Process gallery images - handle different possible formats
      let galleryUrls: string[] = [];
      if (projectData.gallery_images && Array.isArray(projectData.gallery_images)) {
        galleryUrls = projectData.gallery_images.map((img: any) => {
          if (typeof img === 'string') {
            return img; // If it's already a string URL
          } else if (img && typeof img === 'object') {
            return img.url || img.image_url || img.src || ''; // Extract URL from object
          }
          return '';
        }).filter(url => url && url.trim() !== ''); // Remove empty URLs
      }

      const formatted: FormattedProject = {
        ...projectData,
        status: formatStatus(projectData.status),
        type: formatPropertyType(projectData.property_type),
        price: projectData.base_price
          ? `₹${(projectData.base_price / 100000).toFixed(0)} Lakhs`
          : "Price not available",
        area: projectData.available_units
          ? `${projectData.available_units} sqft`
          : "N/A",
        gallery: galleryUrls,
        highlights: projectData.key_highlights || [],
        features: projectData.features || [],
        amenities: projectData.amenities || [],
        investmentHighlights:
          projectData.investment_highlights?.map((h: string) => {
            const [title, ...rest] = h.split(": ");
            return {
              title: title.trim(),
              value: rest.join(": ").trim(),
              subtitle: "",
            };
          }) || [],
        quickInfoItems,
      };

      setProject(formatted);
    } catch (err: any) {
      console.error(err);
      setError(err.message ?? "Failed to load project");
    } finally {
      setLoading(false);
    }
  };

  const formatStatus = (
    s: ProjectStatus
  ): "Available" | "Sold Out" | "Coming Soon" => {
    if (s === ProjectStatus.AVAILABLE) return "Available";
    if (s === ProjectStatus.SOLD_OUT) return "Sold Out";
    if (s === ProjectStatus.COMING_SOON) return "Coming Soon";
    return "Available";
  };

  const formatPropertyType = (type: PropertyType): string => {
    switch (type) {
      case PropertyType.COMMERCIAL:
        return "Commercial";
      case PropertyType.RESIDENTIAL:
        return "Residential";
      case PropertyType.PLOT:
        return "Plot";
      case PropertyType.LAND:
        return "Land";
      case PropertyType.MIXED_USE:
        return "Mixed Use";
      default:
        return "Unknown";
    }
  };

  const getIconComponent = (name?: string) => {
    switch (name?.toLowerCase()) {
      case "shield":
      case "shieldcheck":
        return ShieldCheck;
      case "utensils":
        return Utensils;
      case "dumbbell":
        return Dumbbell;
      case "car":
        return Car;
      case "wifi":
        return Wifi;
      case "waves":
        return Waves;
      case "star":
        return Star;
      case "trendingup":
        return TrendingUp;
      case "mappin":
        return MapPin;
      case "square":
        return Square;
      case "phone":
        return Phone;
      case "mail":
        return Mail;
      case "play":
        return Play;
      case "download":
        return Download;
      case "building":
        return Building;
      case "calendar":
        return Calendar;
      case "layers":
        return Layers;
      case "home":
        return Home;
      case "image":
      case "imageicon":
        return ImageIcon;
      default:
        return Star;
    }
  };

  /* -------------------------- HANDLERS -------------------------- */
  const nextImage = () =>
    project?.gallery.length &&
    setCurrentImageIndex(
      (i) => (i + 1) % project.gallery.length
    );
  const prevImage = () =>
    project?.gallery.length &&
    setCurrentImageIndex(
      (i) => (i - 1 + project.gallery.length) % project.gallery.length
    );

  const handleWebsiteClick = () => {
    project?.website_url &&
      window.open(project.website_url, "_blank", "noopener,noreferrer");
  };
  const [isBrochureOpen, setIsBrochureOpen] = useState(false);
  const [activeBrochureIndex, setActiveBrochureIndex] = useState(0);

  const isImageFile = (url: string) => {
    const imageExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
    return imageExtensions.some((ext) => url.toLowerCase().endsWith(ext));
  };

  const handleDownloadFile = async (url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const fileName = url.split("/").pop() || "file";
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      toast({
        title: "Download failed",
        description: "Could not download file. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleBuyNow = () => {
    clearPurchaseAndBillingSession();

    sessionStorage.setItem("currentProjectId", id);

    if (isAuthenticated) {
      navigate(`/purchase/${id}`, {
        state: { projectName: project?.title },
      });
    } else {
      navigate("/login", { state: { from: `/purchase/${id}` } });
    }
  };

  const handleImageError = (imageUrl: string) => {
    setImageLoadError(prev => ({ ...prev, [imageUrl]: true }));
  };

  /* -------------------------- RENDER -------------------------- */
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center pt-20 min-h-screen">
          <Loader className="w-9 h-9 animate-spin text-yellow-500" />
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center pt-20 min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">
              {error ? "Error Loading Project" : "Project Not Found"}
            </h1>
            {error && (
              <p className="text-muted-foreground mb-6">{error}</p>
            )}
            <Link to="/projects">
              <Button variant="luxury">Back to Projects</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentImg = project.gallery[currentImageIndex] ?? null;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* ==== HERO ==== */}
      <section className="relative h-[55vh] sm:h-[65vh] lg:h-[70vh] overflow-hidden">
        {currentImg && !imageLoadError[currentImg] ? (
          <>
            <div
              className="absolute inset-0 bg-cover bg-center transition-all duration-500"
              style={{ backgroundImage: `url(${currentImg})` }}
            />
            <div className="absolute inset-0 bg-black/40" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center">
            <div className="text-center text-white">
              <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-lg">No image available</p>
            </div>
          </div>
        )}

        {/* Gallery Nav (hidden on xs) */}
        {project.gallery.length > 1 && currentImg && !imageLoadError[currentImg] && (
          <>
            <div className="absolute inset-y-0 left-2 sm:left-4 flex items-center z-20">
              <Button
                variant="outline"
                size="icon"
                onClick={prevImage}
                className="z-20 bg-black/30 border-white/30 text-white hover:bg-black/50"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
            </div>
            <div className="absolute inset-y-0 right-2 sm:right-4 flex items-center z-20">
              <Button
                variant="outline"
                size="icon"
                onClick={nextImage}
                className="z-20 bg-black/30 border-white/30 text-white hover:bg-black/50"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </>
        )}

        {/* Overlay Content */}
        <div className="absolute inset-0 flex items-end">
          <div className="w-full p-4 sm:p-6 bg-gradient-to-t from-black/90 via-black/60 to-transparent">
            <div className="max-w-7xl mx-auto">
              <Link
                to="/projects"
                className="inline-flex items-center text-white/80 hover:text-white mb-3 text-sm sm:text-base"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Projects
              </Link>

              <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                      {project.status}
                    </Badge>
                    {project.website_url && (
                      <button
                        onClick={handleWebsiteClick}
                        className="inline-flex items-center gap-1 text-white/80 hover:text-white bg-black/30 px-3 py-1.5 rounded-md border border-white/20 text-sm"
                      >
                        <Globe className="w-4 h-4" />
                        Website
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white glow-text mb-2">
                    {project.title}
                  </h1>

                  <div className="flex items-center text-white/80 mb-2 text-sm sm:text-base">
                    <MapPin className="w-4 h-4 mr-1" />
                    {project.location}
                  </div>

                  <div className="flex flex-wrap gap-4 text-white/70 text-sm sm:text-base">

                    <div className="flex items-center">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      {project.type}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-yellow-400 glow-text">
                    {project.price}
                  </div>
                  <div className="text-white/60 text-sm">
                    Starting investment
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dots */}
        {project.gallery.length > 1 && currentImg && !imageLoadError[currentImg] && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
            {project.gallery.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentImageIndex(i)}
                className={`w-2 h-2 rounded-full transition-colors ${i === currentImageIndex
                  ? "bg-yellow-400"
                  : "bg-white/40"
                  }`}
              />
            ))}
          </div>
        )}
      </section>

      {/* ==== MAIN CONTENT ==== */}
      <section className="py-10 sm:py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
            {/* LEFT – TABS */}
            <div className="lg:col-span-2 space-y-8">
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 bg-yellow-500/10 backdrop-blur-sm border border-yellow-500/20">
                  <TabsTrigger
                    value="overview"
                    className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black data-[state=active]:font-semibold"
                  >
                    Overview
                  </TabsTrigger>
                  <TabsTrigger
                    value="amenities"
                    className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black data-[state=active]:font-semibold"
                  >
                    Features
                  </TabsTrigger>
                  <TabsTrigger
                    value="investment"
                    className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black data-[state=active]:font-semibold"
                  >
                    Investment
                  </TabsTrigger>
                  <TabsTrigger
                    value="gallery"
                    className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black data-[state=active]:font-semibold"
                  >
                    Gallery
                  </TabsTrigger>
                </TabsList>

                {/* ---- OVERVIEW ---- */}
                <TabsContent value="overview" className="mt-6 space-y-8">
                  {/* Project Overview */}
                  {/* Project Overview */}
                  <div className="card-luxury p-6 sm:p-8 rounded-xl">
                    <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-gradient-yellow">
                      Project Overview
                    </h2>
                    {project.long_description ? (
                      <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                        {project.long_description}
                      </p>
                    ) : (
                      <p className="text-muted-foreground italic">
                        No detailed description available.
                      </p>
                    )}
                  </div>

                  {/* KEY HIGHLIGHTS */}
                  {project.highlights.length > 0 && (
                    <div className="card-luxury p-6 sm:p-8 rounded-xl">
                      <h3 className="text-xl sm:text-2xl font-bold mb-5 flex items-center text-gradient-yellow">
                        <Star className="w-6 h-6 mr-2 text-yellow-400" />
                        Project Highlights
                      </h3>
                      <ul className="space-y-3">
                        {project.highlights.map((h, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-3 p-3 rounded-lg bg-background/50 border border-border/50 transition-transform hover:scale-[1.02] hover:bg-background/80"
                          >
                            <Star className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                            <span className="text-foreground leading-snug">
                              {h}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* INVESTMENT HIGHLIGHTS */}
                  {project.investmentHighlights.length > 0 && (
                    <div className="card-luxury p-6 sm:p-8 rounded-xl">
                      <h3 className="text-xl sm:text-2xl font-bold mb-6 flex items-center text-gradient-yellow">
                        <TrendingUp className="w-6 h-6 mr-2 text-yellow-400" />
                        Investment Highlights
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {project.investmentHighlights.map(
                          (item, idx) => (
                            <div
                              key={idx}
                              className="text-center p-5 bg-gradient-to-br from-background to-background/80 rounded-xl border border-border/50 shadow-sm transition-transform hover:scale-105"
                            >
                              <div className="text-2xl sm:text-3xl font-bold text-yellow-400 glow-text animate-in fade-in duration-500">
                                {item.value}
                              </div>
                              <div className="mt-1 font-medium text-foreground">
                                {item.title}
                              </div>
                              {item.subtitle && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  {item.subtitle}
                                </div>
                              )}
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </TabsContent>

                {/* ---- FEATURES (COMBINED FEATURES & AMENITIES) ---- */}
                <TabsContent value="amenities" className="mt-6">
                  <div className="space-y-8">
                    {project.amenities.length > 0 ? (
                      <div className="card-luxury p-6 sm:p-8 rounded-xl">
                        <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-gradient-yellow">
                          Features & Aminities
                        </h2>

                        <div className="grid sm:grid-cols-2 gap-5">
                          {project.amenities.map((amenity, index) => {
                            const Icon = getIconComponent(amenity.icon);
                            return (
                              <div
                                key={index}
                                className="flex items-start gap-4 p-4 bg-background/50 rounded-lg border border-border/50 hover:border-yellow-500/30 transition-all duration-300"
                              >
                                <div className="w-11 h-11 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <Icon className="w-6 h-6 text-yellow-50" />
                                </div>
                                <div>
                                  <h4 className="font-semibold text-foreground mb-1">
                                    {amenity.name}
                                  </h4>
                                  {amenity.description && (
                                    <p className="text-sm text-muted-foreground">
                                      {amenity.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="card-luxury p-6 sm:p-8 rounded-xl">
                        <p className="text-muted-foreground text-center py-8">
                          No features listed.
                        </p>
                      </div>
                    )}
                  </div>
                </TabsContent>
                {/* ---- INVESTMENT SCHEMES ---- */}
                <TabsContent value="investment">
                  <div className="card-luxury rounded-xl">
                    <InvestmentSchemes
                      projectName={project.title}
                      projectId={project.id}
                      minInvestmentAmount={project.base_price}
                    />
                  </div>
                </TabsContent>

                {/* ---- GALLERY ---- */}
                <TabsContent value="gallery" className="mt-6">
                  <div className="card-luxury p-6 sm:p-8 rounded-xl">
                    <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-gradient-yellow">
                      Project Gallery
                    </h2>
                    {project.gallery.length ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {project.gallery.map((img, i) => (
                          <div
                            key={i}
                            onClick={() => setCurrentImageIndex(i)}
                            className="aspect-[4/3] overflow-hidden rounded-lg cursor-pointer group bg-gray-100 dark:bg-gray-800 flex items-center justify-center"
                          >
                            {!imageLoadError[img] ? (
                              <img
                                src={img}
                                alt={`Gallery ${i + 1}`}
                                className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                onError={() => handleImageError(img)}
                              />
                            ) : (
                              <div className="text-center text-gray-500">
                                <ImageIcon className="w-8 h-8 mx-auto mb-2" />
                                <p className="text-sm">Failed to load</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <ImageIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-muted-foreground">No images available.</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* RIGHT – SIDEBAR */}
            <aside className="space-y-6 lg:sticky lg:top-20 lg:self-start">
              {/* CTA Card */}
              <div className="card-luxury p-5 sm:p-6 rounded-xl">
                <h3 className="text-lg sm:text-xl font-semibold mb-3 text-foreground">
                  Ready to Invest?
                </h3>
                <p className="text-sm text-muted-foreground mb-5">
                  Secure your premium commercial property today.
                </p>

                <div className="space-y-3">
                  <Button
                    onClick={handleBuyNow}
                    variant="luxury"
                    size="lg"
                    className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-500/90 hover:to-yellow-600/90"
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    {isAuthenticated ? "Buy Now" : "Login to Buy"}
                  </Button>

                  <Button
                    onClick={() => {
                      if (!isAuthenticated) {
                        toast({
                          title: "Authentication Required",
                          description: "Please login to view brochures",
                          variant: "destructive",
                        });
                        navigate("/login", { state: { from: `/project/${id}` } });
                      } else {
                        setIsBrochureOpen(true);
                      }
                    }}
                    variant="outline-luxury"
                    className="w-full"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    View Brochures
                  </Button>


                </div>

                <div className="mt-5 pt-4 border-t border-border">
                  <h4 className="font-medium mb-2 text-foreground">
                    Contact Experts
                  </h4>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-2 text-yellow-500" />
                      Available on website
                    </div>
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-2 text-yellow-500" />
                      Contact form available
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Info */}
              <div className="card-luxury p-5 sm:p-6 rounded-xl">
                <h3 className="text-lg font-semibold mb-4 text-foreground">
                  Quick Information
                </h3>
                <dl className="space-y-4">
                  {/* Dynamic Quick Info Items */}
                  {project.quickInfoItems.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-yellow-500" />
                          <dt className="text-muted-foreground">{item.label}</dt>
                        </div>
                        <dd className="font-medium text-right">{item.value}</dd>
                      </div>
                    );
                  })}

                  {/* Static Quick Info Items */}
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Property Type</dt>
                    <dd className="font-medium">{project.type}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">RERA Number</dt>
                    <dd className="font-medium">
                      {project.rera_number || "N/A"}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Building Permission</dt>
                    <dd className="font-medium">
                      {project.building_permission || "N/A"}
                    </dd>
                  </div>
                </dl>
              </div>
            </aside>
          </div>
        </div>
      </section>
      {/* ==== BROCHURE POPUP ==== */}
      <Dialog open={isBrochureOpen} onOpenChange={setIsBrochureOpen}>
        <DialogContent className="max-w-4xl bg-background/95 backdrop-blur-xl border-border">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gradient-yellow">
              Project Brochures
            </DialogTitle>
          </DialogHeader>

          {project?.brochure?.length ? (
            <div className="mt-4 space-y-6">
              {/* IMAGE PREVIEW SECTION */}
              {isImageFile(project.brochure[activeBrochureIndex]) ? (
                <div className="relative aspect-video rounded-lg overflow-hidden bg-black/20 flex items-center justify-center">
                  <img
                    src={project.brochure[activeBrochureIndex]}
                    alt="Brochure preview"
                    className="object-contain max-h-[70vh]"
                  />
                  {project.brochure.length > 1 && (
                    <>
                      <button
                        onClick={() =>
                          setActiveBrochureIndex(
                            (i) =>
                              (i - 1 + project.brochure.length) %
                              project.brochure.length
                          )
                        }
                        className="absolute left-2 bg-black/40 hover:bg-black/60 p-2 rounded-full"
                      >
                        <ChevronLeft className="w-5 h-5 text-white" />
                      </button>
                      <button
                        onClick={() =>
                          setActiveBrochureIndex(
                            (i) => (i + 1) % project.brochure.length
                          )
                        }
                        className="absolute right-2 bg-black/40 hover:bg-black/60 p-2 rounded-full"
                      >
                        <ChevronRight className="w-5 h-5 text-white" />
                      </button>
                    </>
                  )}
                </div>
              ) : (
                /* NON-IMAGE FILES */
                <div className="space-y-3">
                  {project.brochure.map((file, i) => {
                    const fileName = file.split("/").pop();
                    return (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3 border rounded-lg bg-card/50"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="w-5 h-5 text-yellow-500" />
                          <span className="text-sm truncate max-w-[250px]">
                            {fileName}
                          </span>
                        </div>
                        <Button
                          variant="outline-luxury"
                          size="sm"
                          onClick={() => handleDownloadFile(file)}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* DOWNLOAD BUTTON */}
              {isImageFile(project.brochure[activeBrochureIndex]) && (
                <div className="flex justify-center">
                  <Button
                    onClick={() =>
                      handleDownloadFile(project.brochure[activeBrochureIndex])
                    }
                    variant="luxury"
                    className="w-auto"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download This Image
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground">No brochures available.</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectDetail;