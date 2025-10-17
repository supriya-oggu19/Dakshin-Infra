import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Square, ArrowRight, Star } from "lucide-react";
import { Link } from "react-router-dom";

interface ProjectCardProps {
  id: string;
  title: string;
  location: string;
  price: string;
  image: string | null;
  area: string;
  status: "Available" | "Sold Out" | "Coming Soon";
  description: string;
}

const ProjectCard = ({
  id,
  title,
  location,
  price,
  image,
  area,
  status,
  description,
}: ProjectCardProps) => {
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "Available":
        return "badge-success";
      case "Sold Out":
        return "bg-red-50 text-red-600 border-red-200";
      case "Coming Soon":
        return "badge-gold";
      default:
        return "bg-gray-50 text-gray-600 border-gray-200";
    }
  };

  // Use placeholder if no image is available
  const displayImage = image || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23f0f0f0' width='400' height='300'/%3E%3Ctext x='50%' y='50%' font-size='24' fill='%23999' text-anchor='middle' dy='.3em'%3ENo Image Available%3C/text%3E%3C/svg%3E";

  return (
    <div className="card-professional group h-full flex flex-col">
      <div className="aspect-[4/3] overflow-hidden relative">
        <img
          src={displayImage}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23f0f0f0' width='400' height='300'/%3E%3Ctext x='50%' y='50%' font-size='24' fill='%23999' text-anchor='middle' dy='.3em'%3EImage Not Found%3C/text%3E%3C/svg%3E";
          }}
        />
        
        {/* Status Badge */}
        <div className="absolute top-6 left-6">
          <Badge className={`${getStatusBadgeClass(status)} shadow-sm`}>
            {status}
          </Badge>
        </div>

        {/* Price Badge */}
        <div className="absolute top-6 right-6">
          <div className="bg-white/95 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg">
            <span className="text-xl font-bold text-display text-primary">{price}</span>
          </div>
        </div>
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Hover Content */}
        <div className="absolute bottom-6 left-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
          <p className="text-white text-sm bg-white/10 backdrop-blur-md rounded-lg p-4 leading-relaxed border border-white/20 line-clamp-3">
            {description || "Premium property investment opportunity"}
          </p>
        </div>
      </div>

      <div className="p-8 flex-1 flex flex-col">
        <div className="mb-4">
          <h3 className="text-display text-2xl mb-3 text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-2">
            {title}
          </h3>
          
          <div className="flex items-center text-muted-foreground mb-4">
            <MapPin className="w-4 h-4 mr-2 text-primary flex-shrink-0" />
            <span className="text-sm leading-relaxed line-clamp-1">{location}</span>
          </div>

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Square className="w-4 h-4 mr-2 text-secondary flex-shrink-0" />
              <span className="text-sm font-medium text-muted-foreground">{area}</span>
            </div>
            <div className="flex items-center">
              <Star className="w-4 h-4 mr-1 text-primary fill-current" />
              <span className="text-sm font-medium text-muted-foreground">Premium</span>
            </div>
          </div>
        </div>

        {/* Spacer to push button to bottom */}
        <div className="flex-1"></div>

        <Link to={`/projects/${id}`} className="mt-auto">
          <Button className="btn-outline-gold w-full group/btn text-base font-semibold py-4">
            View Details
            <ArrowRight className="w-5 h-5 ml-2 transition-transform duration-300 group-hover/btn:translate-x-1" />
          </Button>
        </Link>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  );
};

export default ProjectCard;