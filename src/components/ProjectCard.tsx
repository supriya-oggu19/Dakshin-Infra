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
    <div className="card-professional group h-full flex flex-col relative overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500">
      <div className="aspect-[4/3] overflow-hidden relative rounded-t-xl">
        <img
          src={displayImage}
          alt={title}
          className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-90"
          onError={(e) => {
            e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23f0f0f0' width='400' height='300'/%3E%3Ctext x='50%' y='50%' font-size='24' fill='%23999' text-anchor='middle' dy='.3em'%3EImage Not Found%3C/text%3E%3C/svg%3E";
          }}
        />
        
        {/* Status Badge */}
        <div className="absolute top-4 left-4 z-10">
          <Badge className={`${getStatusBadgeClass(status)} shadow-lg border-2 backdrop-blur-sm font-semibold px-3 py-1`}>
            {status}
          </Badge>
        </div>

        {/* Price Badge */}
        <div className="absolute top-4 right-4 z-10">
          <div className="bg-white/98 backdrop-blur-md px-5 py-2.5 rounded-xl shadow-2xl border border-primary/10 transition-all duration-300 group-hover:scale-105 group-hover:shadow-primary/20">
            <span className="text-2xl font-bold text-display text-primary tracking-tight">{price}</span>
          </div>
        </div>
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
        
        {/* Hover Content */}
        <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-6 group-hover:translate-y-0">
          <p className="text-white text-sm bg-white/15 backdrop-blur-lg rounded-xl p-4 leading-relaxed border border-white/30 shadow-xl line-clamp-3 font-medium">
            {description || "Premium property investment opportunity"}
          </p>
        </div>
      </div>

      <div className="p-7 flex-1 flex flex-col bg-gradient-to-b from-white to-gray-50/30">
        <div className="mb-4">
          <h3 className="text-display text-2xl font-bold mb-3 text-foreground group-hover:text-primary transition-all duration-300 line-clamp-2 leading-tight">
            {title}
          </h3>
          
          <div className="flex items-center text-muted-foreground mb-5">
            <div className="bg-primary/10 rounded-full p-1.5 mr-2">
              <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
            </div>
            <span className="text-sm font-medium leading-relaxed line-clamp-1">{location}</span>
          </div>

          <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200/60">
            <div className="flex items-center bg-secondary/10 rounded-lg px-3 py-2">
              <Square className="w-4 h-4 mr-2 text-secondary flex-shrink-0" />
              <span className="text-sm font-semibold text-muted-foreground">{area}</span>
            </div>
            <div className="flex items-center bg-primary/10 rounded-lg px-3 py-2">
              <Star className="w-4 h-4 mr-1 text-primary fill-current" />
              <span className="text-sm font-semibold text-muted-foreground">Premium</span>
            </div>
          </div>
        </div>

        {/* Spacer to push button to bottom */}
        <div className="flex-1"></div>

        <Link to={`/projects/${id}`} className="mt-auto">
          <Button className="btn-outline-gold w-full group/btn text-base font-semibold py-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300">
            View Details
            <ArrowRight className="w-5 h-5 ml-2 transition-transform duration-300 group-hover/btn:translate-x-2" />
          </Button>
        </Link>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute -bottom-2 -right-2 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-all duration-500" />
    </div>
  );
};

export default ProjectCard;