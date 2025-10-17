import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Grid, List, Menu } from "lucide-react";
import Navigation from "@/components/Navigation";
import ProjectCard from "@/components/ProjectCard";

const Projects = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [priceFilter, setPriceFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [locations, setLocations] = useState<string[]>([]);

  useEffect(() => {
    fetchProjects();
  }, []);

  // Update filtered projects when search or filters change
  useEffect(() => {
    applyFilters();
  }, [searchTerm, priceFilter, locationFilter, statusFilter, typeFilter, projects]);

  const fetchProjects = async () => {
    try {
const response = await fetch('http://localhost:8001/api/projects/all?page=1&limit=100');
      const data = await response.json();
      
      const formattedProjects = data.projects.map((project: any) => ({
        ...project,
        status: formatStatus(project.status),
        type: project.property_type.charAt(0).toUpperCase() + project.property_type.slice(1),
        price: `₹${(project.base_price / 100000).toFixed(0)} Lakhs`,
        area: project.pricing_details?.sqft ? `${project.pricing_details.sqft} sqft onwards` : 'N/A',
        image: project.gallery_images?.[0]?.url || null,
        priceRange: getPriceRange(project.base_price),
      }));
      
      setProjects(formattedProjects);
      setFilteredProjects(formattedProjects);
      
      // Extract unique locations
      const uniqueLocations = Array.from(
        new Set(formattedProjects.map((p: any) => p.location))
      ) as string[];
      setLocations(uniqueLocations.sort());
      
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

  const applyFilters = () => {
    const filtered = projects.filter(project => {
      const matchesSearch = 
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.location.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesLocation = 
        locationFilter === "" || 
        locationFilter === "all-locations" || 
        project.location.toLowerCase() === locationFilter.toLowerCase();
      
      const matchesStatus = 
        statusFilter === "" || 
        statusFilter === "all-status" || 
        project.status === statusFilter;
      
      const matchesPrice = 
        priceFilter === "" || 
        priceFilter === "all-prices" || 
        project.priceRange === priceFilter;
      
      const matchesType = 
        typeFilter === "" || 
        typeFilter === "all-types" || 
        project.type === typeFilter;
      
      return matchesSearch && matchesLocation && matchesStatus && matchesPrice && matchesType;
    });
    
    setFilteredProjects(filtered);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-20 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-lg text-muted-foreground">Loading projects...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-16 sm:pt-20 pb-8 sm:pb-12">
        {/* Header */}
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-12">
          <div className="text-center mb-8 sm:mb-12">
            <Badge className="mb-3 sm:mb-4 bg-primary/20 text-primary border-primary/30 text-xs sm:text-sm">
              Investment Opportunities
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 glow-text">
              Premium Projects
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
              Discover luxury properties with guaranteed returns and world-class amenities in prime locations.
            </p>
          </div>

          {/* Filters */}
          <div className="card-luxury p-4 sm:p-6 mb-6 sm:mb-8">
            {/* Search Bar and Filter Toggle */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center mb-4 sm:mb-0">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search projects or locations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-background border-border h-10 sm:h-auto"
                />
              </div>
              
              {/* Mobile Filter Toggle */}
              <div className="flex gap-2 sm:hidden">
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex-1"
                >
                  <Menu className="w-4 h-4 mr-2" />
                  Filters
                </Button>
                <div className="flex gap-1">
                  <Button
                    variant={viewMode === "grid" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className={`px-3 ${viewMode === "grid" ? "bg-amber-500 hover:bg-amber-600" : ""}`}
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className={`px-3 ${viewMode === "list" ? "bg-amber-500 hover:bg-amber-600" : ""}`}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Desktop Filters */}
            <div className={`${showFilters ? 'block' : 'hidden'} sm:block`}>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
                <div className="grid grid-cols-2 sm:flex gap-2 sm:gap-4 flex-1">
                  <Select value={locationFilter} onValueChange={setLocationFilter}>
                    <SelectTrigger className="bg-background border-border focus:border-amber-500 text-sm">
                      <SelectValue placeholder="All Locations" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border-border">
                      <SelectItem value="all-locations">All Locations</SelectItem>
                      {locations.map((loc) => (
                        <SelectItem key={loc} value={loc}>
                          {loc}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="bg-background border-border focus:border-amber-500 text-sm">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border-border">
                      <SelectItem value="all-status">All Status</SelectItem>
                      <SelectItem value="Available">Available</SelectItem>
                      <SelectItem value="Sold Out">Sold Out</SelectItem>
                      <SelectItem value="Coming Soon">Coming Soon</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={priceFilter} onValueChange={setPriceFilter}>
                    <SelectTrigger className="bg-background border-border focus:border-amber-500 text-sm">
                      <SelectValue placeholder="Price Range" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border-border">
                      <SelectItem value="all-prices">All Prices</SelectItem>
                      <SelectItem value="15-20">₹15-20L</SelectItem>
                      <SelectItem value="60-70">₹60-70L</SelectItem>
                      <SelectItem value="70-80">₹70-80L</SelectItem>
                      <SelectItem value="80-90">₹80-90L</SelectItem>
                      <SelectItem value="90-100">₹90L-1Cr</SelectItem>
                      <SelectItem value="100+">₹1Cr+</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="bg-background border-border focus:border-amber-500 text-sm">
                      <SelectValue placeholder="Property Type" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border-border">
                      <SelectItem value="all-types">All Types</SelectItem>
                      <SelectItem value="Commercial">Commercial</SelectItem>
                      <SelectItem value="Residential">Residential</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Desktop View Mode Buttons */}
                <div className="hidden sm:flex gap-2">
                  <Button
                    variant={viewMode === "grid" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className={viewMode === "grid" ? "bg-amber-500 hover:bg-amber-600" : ""}
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className={viewMode === "list" ? "bg-amber-500 hover:bg-amber-600" : ""}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="flex justify-between items-center mb-4 sm:mb-6 px-1">
            <p className="text-sm sm:text-base text-gray-600">
              Showing {filteredProjects.length} of {projects.length} projects
            </p>
          </div>

          {/* Projects Grid */}
          <div className={`grid gap-4 sm:gap-6 lg:gap-8 ${
            viewMode === "grid" 
              ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" 
              : "grid-cols-1"
          }`}>
            {filteredProjects.map((project, index) => (
              <div
                key={project.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <ProjectCard {...project} />
              </div>
            ))}
          </div>

          {filteredProjects.length === 0 && (
            <div className="text-center py-8 sm:py-12">
              <div className="bg-white p-6 sm:p-12 rounded-xl border border-gray-200 shadow-md mx-4">
                <Filter className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg sm:text-xl font-semibold mb-2 text-gray-900">No projects found</h3>
                <p className="text-sm sm:text-base text-gray-600">
                  Try adjusting your search criteria to find more projects.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Projects;