import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Square, ArrowRight, Star, Building2 } from "lucide-react";
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

const getStatusConfig = (status: ProjectCardProps["status"]) => {
  switch (status) {
    case "Available":
      return {
        bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
        dot: "bg-emerald-500",
        label: "Available",
      };
    case "Sold Out":
      return {
        bg: "bg-rose-50 text-rose-700 border-rose-200",
        dot: "bg-rose-500",
        label: "Sold Out",
      };
    case "Coming Soon":
      return {
        bg: "bg-amber-50 text-amber-700 border-amber-200",
        dot: "bg-amber-500",
        label: "Coming Soon",
      };
    default:
      return {
        bg: "bg-gray-50 text-gray-600 border-gray-200",
        dot: "bg-gray-400",
        label: status,
      };
  }
};

export default function ProjectCard({
  id,
  title,
  location,
  price,
  image,
  area,
  status,
  description,
}: ProjectCardProps) {
  const placeholder =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23f9fafb' width='400' height='300'/%3E%3Ctext x='50%25' y='50%25' font-size='18' fill='%239ca3af' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E";

  const displayImage = image || placeholder;
  const statusConfig = getStatusConfig(status);

  return (
    <div className="group w-full max-w-sm mx-auto overflow-hidden rounded-2xl bg-white/80 backdrop-blur-sm shadow-lg transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 border border-white/50">
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-slate-100 to-blue-50">
        <img
          src={displayImage}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          onError={(e) => {
            e.currentTarget.src = placeholder;
          }}
        />

        {/* Status Badge with Dot */}
        <div className="absolute left-4 top-4 flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${statusConfig.dot}`} />
          <Badge
            variant="outline"
            className={`border ${statusConfig.bg} px-3 py-1 text-xs font-semibold tracking-wide backdrop-blur-sm`}
          >
            {statusConfig.label}
          </Badge>
        </div>

        {/* Price Badge */}
        <div className="absolute right-4 top-4">
          <div className="rounded-xl bg-white/95 px-4 py-2 shadow-lg backdrop-blur-sm ring-1 ring-black/5">
            <span className="text-lg font-bold text-blue-600 tracking-tight">{price}</span>
          </div>
        </div>

        {/* Hover Gradient + Description */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        <div className="absolute inset-x-4 bottom-4 translate-y-4 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
          <p className="rounded-xl bg-white/20 p-3 text-sm font-medium text-white backdrop-blur-sm line-clamp-2">
            {description || "Premium property investment opportunity"}
          </p>
        </div>
      </div>

      {/* Card Body */}
      <div className="flex flex-col p-6">
        {/* Title */}
        <h3 className="line-clamp-2 text-xl font-bold text-slate-900 transition-colors duration-300 group-hover:text-blue-700 mb-3">
          {title}
        </h3>

        {/* Location */}
        <div className="flex items-center text-sm text-slate-600 mb-4">
          <MapPin className="mr-2 size-4 flex-shrink-0 text-blue-500" />
          <span className="line-clamp-1 font-medium">{location}</span>
        </div>

        {/* Area & Premium Tags */}
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-4">
          <div className="flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700">
            <Building2 className="size-3.5 text-blue-500" />
            {area}
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700">
            <Star className="size-3.5 fill-blue-500 text-blue-500" />
            Premium
          </div>
        </div>

        {/* CTA Button */}
        <Link to={`/projects/${id}`} className="block">
          <Button
            className={`
              group/btn relative w-full overflow-hidden rounded-xl
              bg-gradient-to-r from-blue-600 to-blue-700
              px-6 py-4 text-base font-semibold text-white
              shadow-lg transition-all duration-300
              hover:from-blue-700 hover:to-blue-800
              hover:shadow-xl hover:-translate-y-1
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
            `}
          >
            <span className="relative z-10">View Details</span>
            <ArrowRight className="relative z-10 ml-3 size-4 transition-transform duration-300 group-hover/btn:translate-x-1" />

            {/* Shine effect on hover */}
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover/btn:translate-x-full" />
          </Button>
        </Link>
      </div>

      {/* Top Accent Line */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-500 opacity-0 transition-opacity duration-500 group-hover:opacity-100 rounded-t-2xl" />
    </div>
  );
}