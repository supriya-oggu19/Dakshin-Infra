import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Search, Filter, Grid, List, Menu, Building2, MapPin, TrendingUp, Eye } from "lucide-react";
import Navigation from "@/components/Navigation";
import ProjectCard from "@/components/ProjectCard";
import { projectApi } from "@/api/projectApi";
import { ListProjectsRequest, ProjectStatus, PropertyType } from "@/api/models/projectModels";

// Debounce hook
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const Projects = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [priceFilter, setPriceFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProjects, setTotalProjects] = useState(0);

  // Use debounced search term
  const debouncedSearchTerm = useDebounce(searchTerm, 800);

  // Fetch projects when any filter or page changes
  useEffect(() => {
    fetchProjects();
  }, [currentPage, debouncedSearchTerm, statusFilter, priceFilter, typeFilter]);

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      
      const params: ListProjectsRequest = {
        page: currentPage,
        limit: 9,
        ...(debouncedSearchTerm && { search: debouncedSearchTerm }),
        ...(statusFilter && statusFilter !== "all-status" && { 
          status_filter: statusFilter.toLowerCase().replace(' ', '_') as ProjectStatus 
        }),
        ...(typeFilter && typeFilter !== "all-types" && { 
          property_type: typeFilter.toLowerCase() as PropertyType 
        }),
        ...(priceFilter && priceFilter !== "all-prices" && getPriceRangeFilter(priceFilter))
      };

      const response = await projectApi.list(params);
      const data = response.data;
      
      if (!data || !data.projects || !Array.isArray(data.projects)) {
        console.warn("Invalid response data:", data);
        setProjects([]);
        setTotalPages(1);
        setTotalProjects(0);
        setLoading(false);
        return;
      }
      
      const formattedProjects = data.projects.map((project: any) => ({
        ...project,
        status: formatStatus(project.status),
        type: project.property_type.charAt(0).toUpperCase() + project.property_type.slice(1),
        price: `₹${(project.base_price / 100000).toFixed(0)} Lakhs`,
        area: project.available_units + " Sq.ft" || "N/A",
        image: project.gallery_images?.[0] || null,
        priceRange: getPriceRange(project.base_price),
      }));
      
      setProjects(formattedProjects);
      setTotalPages(data.total_pages || 1);
      setTotalProjects(data.total_projects || formattedProjects.length);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setLoading(false);
    }
  }, [currentPage, debouncedSearchTerm, statusFilter, typeFilter, priceFilter]);

  const getPriceRangeFilter = (priceRange: string) => {
    const ranges: { [key: string]: { min_price?: number; max_price?: number } } = {
      "15-20": { min_price: 1500000, max_price: 2000000 },
      "60-70": { min_price: 6000000, max_price: 7000000 },
      "70-80": { min_price: 7000000, max_price: 8000000 },
      "80-90": { min_price: 8000000, max_price: 9000000 },
      "90-100": { min_price: 9000000, max_price: 10000000 },
      "100+": { min_price: 10000000 }
    };
    return ranges[priceRange] || {};
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

  // Handle filter changes - reset to page 1
  const handleFilterChange = (filterType: string, value: string) => {
    setCurrentPage(1);
    switch (filterType) {
      case 'status':
        setStatusFilter(value);
        break;
      case 'price':
        setPriceFilter(value);
        break;
      case 'type':
        setTypeFilter(value);
        break;
    }
  };

  const generatePaginationItems = () => {
  const items = [];
  const maxVisiblePages = 5;
  
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
  
  // Adjust start page if we're near the end
  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }
  
  // First page
  if (startPage > 1) {
    items.push(
      <PaginationItem key={1}>
        <PaginationLink 
          onClick={() => setCurrentPage(1)}
          className={currentPage === 1 ? "bg-blue-600 text-white hover:bg-blue-700" : ""}
        >
          1
        </PaginationLink>
      </PaginationItem>
    );
    if (startPage > 2) {
      items.push(
        <PaginationItem key="ellipsis1">
          <PaginationLink className="cursor-default">...</PaginationLink>
        </PaginationItem>
      );
    }
  }
  
  // Page numbers
  for (let page = startPage; page <= endPage; page++) {
    items.push(
      <PaginationItem key={page}>
        <PaginationLink
          onClick={() => setCurrentPage(page)}
          className={
            page === currentPage 
              ? "bg-blue-600 text-white hover:bg-blue-700" 
              : ""
          }
        >
          {page}
        </PaginationLink>
      </PaginationItem>
    );
  }
  
  // Last page
  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      items.push(
        <PaginationItem key="ellipsis2">
          <PaginationLink className="cursor-default">...</PaginationLink>
        </PaginationItem>
      );
    }
    items.push(
      <PaginationItem key={totalPages}>
        <PaginationLink 
          onClick={() => setCurrentPage(totalPages)}
          className={currentPage === totalPages ? "bg-blue-600 text-white hover:bg-blue-700" : ""}
        >
          {totalPages}
        </PaginationLink>
      </PaginationItem>
    );
  }
  
  return items;
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
      
      {/* Hero Section with Background Pattern */}
      <div className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 pt-20 pb-16">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-600/20 via-transparent to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm border border-white/20 px-6 py-3 rounded-full mb-8">
            <TrendingUp className="w-5 h-5 text-white" />
            <span className="text-white font-semibold text-sm uppercase tracking-wider">
              Investment Opportunities
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Premium Projects
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto font-light">
            Discover luxury properties with guaranteed returns and world-class amenities in prime locations.
          </p>
        </div>
      </div>

      <div className="py-12 -mt-8 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Floating Filter Card */}
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 mb-12 transform -translate-y-12">
            <div className="p-8">
              {/* Search Bar and Filter Toggle */}
              <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <Input
                    placeholder="Search projects by title or location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 bg-slate-50 border-slate-200 rounded-xl h-14 text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                  />
                </div>
                
                {/* Mobile Filter Toggle */}
                <div className="flex gap-2 sm:hidden">
                  <Button
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex-1 bg-slate-50 border-slate-200 rounded-xl h-14"
                  >
                    <Menu className="w-5 h-5 mr-2" />
                    Filters
                  </Button>
                  <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
                    <Button
                      variant={viewMode === "grid" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("grid")}
                      className={`rounded-md transition-all duration-300 ${
                        viewMode === "grid" 
                          ? "bg-blue-600 hover:bg-blue-700 shadow-md text-white" 
                          : "text-slate-600 hover:text-blue-600 hover:bg-white"
                      }`}
                    >
                      <Grid className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("list")}
                      className={`rounded-md transition-all duration-300 ${
                        viewMode === "list" 
                          ? "bg-blue-600 hover:bg-blue-700 shadow-md text-white" 
                          : "text-slate-600 hover:text-blue-600 hover:bg-white"
                      }`}
                    >
                      <List className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Desktop Filters */}
              <div className={`${showFilters ? 'block' : 'hidden'} sm:block`}>
                <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1">
                    <Select 
                      value={statusFilter} 
                      onValueChange={(value) => handleFilterChange('status', value)}
                    >
                      <SelectTrigger className="bg-slate-50 border-slate-200 rounded-xl h-12 text-base">
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-status">All Status</SelectItem>
                        <SelectItem value="Available">Available</SelectItem>
                        <SelectItem value="Sold Out">Sold Out</SelectItem>
                        <SelectItem value="Coming Soon">Coming Soon</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select 
                      value={priceFilter} 
                      onValueChange={(value) => handleFilterChange('price', value)}
                    >
                      <SelectTrigger className="bg-slate-50 border-slate-200 rounded-xl h-12 text-base">
                        <SelectValue placeholder="Price Range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-prices">All Prices</SelectItem>
                        <SelectItem value="15-20">₹15-20L</SelectItem>
                        <SelectItem value="60-70">₹60-70L</SelectItem>
                        <SelectItem value="70-80">₹70-80L</SelectItem>
                        <SelectItem value="80-90">₹80-90L</SelectItem>
                        <SelectItem value="90-100">₹90L-1Cr</SelectItem>
                        <SelectItem value="100+">₹1Cr+</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select 
                      value={typeFilter} 
                      onValueChange={(value) => handleFilterChange('type', value)}
                    >
                      <SelectTrigger className="bg-slate-50 border-slate-200 rounded-xl h-12 text-base">
                        <SelectValue placeholder="Property Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-types">All Types</SelectItem>
                        <SelectItem value="Commercial">Commercial</SelectItem>
                        <SelectItem value="Residential">Residential</SelectItem>
                        <SelectItem value="Plot">Plot</SelectItem>
                        <SelectItem value="Land">Land</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Desktop View Mode Buttons */}
                  <div className="hidden sm:flex gap-1 bg-slate-100 rounded-lg p-1">
                    <Button
                      variant={viewMode === "grid" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("grid")}
                      className={`rounded-md transition-all duration-300 ${
                        viewMode === "grid" 
                          ? "bg-blue-600 hover:bg-blue-700 shadow-md text-white" 
                          : "text-slate-600 hover:text-blue-600 hover:bg-white"
                      }`}
                    >
                      <Grid className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("list")}
                      className={`rounded-md transition-all duration-300 ${
                        viewMode === "list" 
                          ? "bg-blue-600 hover:bg-blue-700 shadow-md text-white" 
                          : "text-slate-600 hover:text-blue-600 hover:bg-white"
                      }`}
                    >
                      <List className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Results Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <div className="flex items-center gap-3 mb-4 sm:mb-0">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-600">
                  Showing {projects.length} of {totalProjects} projects
                </p>
              </div>
            </div>
          </div>

          {/* Projects Grid */}
          <div className={`grid gap-6 lg:gap-8 ${
            viewMode === "grid" 
              ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" 
              : "grid-cols-1"
          }`}>
            {projects.map((project, index) => (
              <div
                key={project.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <ProjectCard {...project} />
              </div>
            ))}
          </div>

          {/* Bottom Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-12">
              <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    {generatePaginationItems()}
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </div>
          )}

          {projects.length === 0 && (
            <div className="text-center py-12">
              <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-12 max-w-2xl mx-auto">
                <Filter className="w-16 h-16 text-slate-300 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-slate-900 mb-4">No projects found</h3>
                <p className="text-slate-600 text-lg mb-8">
                  Try adjusting your search criteria to find more projects.
                </p>
                <Button 
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("");
                    setPriceFilter("");
                    setTypeFilter("");
                  }}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Reset Filters
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Projects;