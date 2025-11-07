// Project Status Enum
export enum ProjectStatus {
  AVAILABLE = "available",
  SOLD_OUT = "sold_out",
  COMING_SOON = "coming_soon",
}

// Property Type Enum
export enum PropertyType {
  COMMERCIAL = "commercial",
  RESIDENTIAL = "residential",
  PLOT = "plot",
  LAND = "land",
  MIXED_USE = "mixed_use",
}

// Gallery Image Interface
export interface GalleryImage {
  id?: string;
  url: string;
  alt_text?: string;
  is_primary?: boolean;
}

// Amenity Interface
export interface Amenity {
  id?: string;
  name: string;
  icon?: string;
  description?: string;
}

// Pricing Details Interface
export interface PricingDetails {
  price_per_sqft?: number;
  maintenance_charges?: number;
  booking_amount?: number;
  payment_plan?: string;
  additional_costs?: Record<string, number>;
}

// Quick Info Interface
export interface QuickInfo {
  possession_date?: string;
  rera_registered?: boolean;
  total_towers?: number;
  total_floors?: number;
  unit_variants?: string[];
}

// Project Data Interface (Single Project)
export interface ProjectData {
  id: string;
  title: string;
  location: string;
  description?: string;
  long_description?: string;
  website_url?: string;
  status: ProjectStatus;
  base_price: number;
  property_type: PropertyType;
  has_rental_income: boolean;
  floor_number: number;
  project_code: string;
  
  // JSON fields
  pricing_details?: PricingDetails;
  quick_info?: QuickInfo;
  gallery_images?: GalleryImage[];
  brochure?: string[];
  key_highlights?: string[];
  features?: string[];
  investment_highlights?: string[];
  amenities?: Amenity[];
  
  // Unit inventory
  total_units: number;
  available_units: number;
  sold_units: number;
  reserved_units: number;
  
  // Legal info
  rera_number?: string;
  building_permission?: string;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface ProjectResponse {
  message: string;
  data: ProjectData;
}

// List Projects Request Parameters
export interface ListProjectsRequest {
  page?: number;
  limit?: number;
  property_type?: PropertyType;
  status_filter?: ProjectStatus;
  search?: string;
  min_price?: number;
  max_price?: number;
}

// List Projects Response
export interface ListProjectResponse {
  message: string;
  page: number;
  limit: number;
  total_pages: number;
  is_previous: boolean;
  is_next: boolean;
  total_projects: number;
  projects: ProjectData[];
}