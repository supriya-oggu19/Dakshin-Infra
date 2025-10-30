import { useState, useEffect } from "react";
import {
  useParams,
  Link,
  useNavigate,
} from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";

import Navigation from "@/components/Navigation";
import InvestmentSchemes from "@/pages/InvestmentSchemes";
import { useAuth } from "@/contexts/AuthContext";
import { projectApi } from "@/api/projectApi";
import {
  ProjectData,
  ProjectStatus,
  PropertyType,
} from "@/api/models/projectModels";

interface FormattedProject
  extends Omit<ProjectData, "status" | "property_type"> {
  status: "Available" | "Sold Out" | "Coming Soon";
  type: string;
  price: string;
  area: string;
  gallery: string[];
  highlights: string[];
  amenities: any[];
  investmentHighlights: { title: string; value: string; subtitle?: string }[];
}

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [project, setProject] = useState<FormattedProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* -------------------------- FETCH -------------------------- */
  useEffect(() => {
    if (id) fetchProject(id);
  }, [id]);

  const fetchProject = async (projectId: string) => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await projectApi.getById(projectId);
      const projectData = data?.data;
      if (!projectData) throw new Error("No project details found");

      const formatted: FormattedProject = {
        ...projectData,
        status: formatStatus(projectData.status),
        type:
          projectData.property_type?.charAt(0).toUpperCase() +
          projectData.property_type?.slice(1) || "Unknown",
        price: projectData.base_price
          ? `₹${(projectData.base_price / 100000).toFixed(0)} Lakhs`
          : "Price not available",
        area: projectData.available_units
          ? `${projectData.available_units} sqft`
          : "N/A",
        gallery:
          projectData.gallery_images?.map((i: any) => i) || [],
        highlights: projectData.key_highlights || [],
        amenities:
          projectData.amenities?.map((a: any) => ({
            ...a,
            icon: getIconComponent(a.icon),
          })) || [],
        investmentHighlights:
          projectData.investment_highlights?.map((h: string) => {
            const [title, ...rest] = h.split(": ");
            return {
              title: title.trim(),
              value: rest.join(": ").trim(),
              subtitle: "",
            };
          }) || [],
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
    s: string
  ): "Available" | "Sold Out" | "Coming Soon" => {
    if (s === "available") return "Available";
    if (s === "sold_out") return "Sold Out";
    if (s === "coming_soon") return "Coming Soon";
    return "Available";
  };

  const getIconComponent = (name?: string) => {
    switch (name?.toLowerCase()) {
      case "shield":
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

  const handleBuyNow = () => {
    if (isAuthenticated) navigate(`/purchase/${id}`);
    else navigate("/login", { state: { from: `/purchase/${id}` } });
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
        {currentImg && (
          <div
            className="absolute inset-0 bg-cover bg-center transition-all duration-500"
            style={{ backgroundImage: `url(${currentImg})` }}
          />
        )}
        <div className="absolute inset-0 bg-black/40" />

        {/* Gallery Nav (hidden on xs) */}
        {project.gallery.length > 1 && (
          <>
            <div className="absolute inset-y-0 left-2 sm:left-4 flex items-center">
              <Button
                variant="outline"
                size="icon"
                onClick={prevImage}
                className="bg-black/30 border-white/30 text-white hover:bg-black/50"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
            </div>
            <div className="absolute inset-y-0 right-2 sm:right-4 flex items-center">
              <Button
                variant="outline"
                size="icon"
                onClick={nextImage}
                className="bg-black/30 border-white/30 text-white hover:bg-black/50"
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
                      <Square className="w-4 h-4 mr-1" />
                      {project.area}
                    </div>
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
        {project.gallery.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
            {project.gallery.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentImageIndex(i)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === currentImageIndex
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
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 bg-card/80 backdrop-blur-sm">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="amenities">Features</TabsTrigger>
                  <TabsTrigger value="investment">Investment</TabsTrigger>
                  <TabsTrigger value="gallery">Gallery</TabsTrigger>
                </TabsList>

                {/* ---- OVERVIEW ---- */}
                <TabsContent value="overview" className="mt-6 space-y-8">
                  {/* Project Overview */}
                  <div className="card-luxury p-6 sm:p-8 rounded-xl">
                    <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-gradient-yellow">
                      Project Overview
                    </h2>
                    {project.description && (
                      <p className="text-muted-foreground leading-relaxed mb-4">
                        {project.description}
                      </p>
                    )}
                    {project.long_description && (
                      <p className="text-muted-foreground leading-relaxed">
                        {project.long_description}
                      </p>
                    )}
                  </div>

                  {/* KEY HIGHLIGHTS – NEW UI */}
                  {project.highlights.length > 0 && (
                    <div className="card-luxury p-6 sm:p-8 rounded-xl">
                      <h3 className="text-xl sm:text-2xl font-bold mb-5 flex items-center text-gradient-yellow">
                        <Star className="w-6 h-6 mr-2 text-yellow-400" />
                        Key Highlights
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

                  {/* INVESTMENT HIGHLIGHTS – NEW UI */}
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

                {/* ---- FEATURES ---- */}
                <TabsContent value="amenities" className="mt-6">
                  <div className="card-luxury p-6 sm:p-8 rounded-xl">
                    <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-gradient-yellow">
                      Features & Amenities
                    </h2>
                    {project.amenities.length ? (
                      <div className="grid sm:grid-cols-2 gap-5">
                        {project.amenities.map((a: any, i) => {
                          const Icon = a.icon;
                          return (
                            <div
                              key={i}
                              className="flex items-start gap-4 p-4 bg-background/50 rounded-lg border border-border/50"
                            >
                              <div className="w-11 h-11 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Icon className="w-6 h-6 text-yellow-50" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-foreground">
                                  {a.name}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  {a.description}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">
                        No amenities listed.
                      </p>
                    )}
                  </div>
                </TabsContent>

                {/* ---- INVESTMENT SCHEMES ---- */}
                <TabsContent value="investment" className="mt-6">
                  <div className="card-luxury p-6 sm:p-8 rounded-xl">
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
                            className="aspect-[4/3] overflow-hidden rounded-lg cursor-pointer group"
                          >
                            <img
                              src={img}
                              alt={`Gallery ${i + 1}`}
                              className="w-full h-full object-cover transition-transform group-hover:scale-110"
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">
                        No images available.
                      </p>
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

                  <Button variant="outline-luxury" className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Download Brochure
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full bg-gradient-to-r from-secondary/10 to-secondary/5"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Virtual Tour
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
                <dl className="space-y-2 text-sm">
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
                  {project.total_units && (
                    <>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Total Units</dt>
                        <dd className="font-medium">{project.total_units}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Available Units</dt>
                        <dd className="font-medium text-green-600">
                          {project.available_units}
                        </dd>
                      </div>
                    </>
                  )}
                </dl>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProjectDetail;