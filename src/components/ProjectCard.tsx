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
    <div className="group w-full max-w-sm mx-auto overflow-hidden rounded-xl bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <img
          src={displayImage}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.src = placeholder;
          }}
        />

        {/* Status Badge with Dot */}
        <div className="absolute left-3 top-3 flex items-center gap-1.5">
          <div className={`h-2 w-2 rounded-full ${statusConfig.dot}`} />
          <Badge
            variant="outline"
            className={`border ${statusConfig.bg} px-2.5 py-0.5 text-xs font-semibold tracking-wide`}
          >
            {statusConfig.label}
          </Badge>
        </div>

        {/* Price Badge */}
        <div className="absolute right-3 top-3">
          <div className="rounded-lg bg-white/95 px-3 py-1.5 shadow-md backdrop-blur-sm ring-1 ring-black/5">
            <span className="text-lg font-bold text-primary tracking-tight">{price}</span>
          </div>
        </div>

        {/* Hover Gradient + Description */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        <div className="absolute inset-x-3 bottom-3 translate-y-3 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100 md:block">
          <p className="line-clamp-2 rounded-md bg-white/20 p-2.5 text-xs font-medium text-white backdrop-blur-sm">
            {description || "Premium property investment opportunity"}
          </p>
        </div>
      </div>

      {/* Card Body */}
      <div className="flex flex-col p-4 md:p-5">
        {/* Title */}
        <h3 className="line-clamp-2 text-lg font-bold text-gray-900 transition-colors duration-300 group-hover:text-primary md:text-xl">
          {title}
        </h3>

        {/* Location */}
        <div className="mt-2 flex items-center text-sm text-gray-600">
          <MapPin className="mr-1.5 size-4 flex-shrink-0 text-primary" />
          <span className="line-clamp-1 font-medium">{location}</span>
        </div>

        {/* Area & Premium Tags */}
        <div className="mt-3 flex items-center justify-between gap-3 border-b border-gray-100 pb-3">
          <div className="flex items-center gap-1.5 rounded-md bg-gray-50 px-2.5 py-1.5 text-xs font-semibold text-gray-700">
            <Square className="size-3.5 text-gray-500" />
            {area}
          </div>
          <div className="flex items-center gap-1.5 rounded-md bg-amber-50 px-2.5 py-1.5 text-xs font-semibold text-amber-700">
            <Star className="size-3.5 fill-amber-500 text-amber-500" />
            Premium
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* CTA Button */}
        {/* CTA Button – YELLOW BACKGROUND */}
        <Link to={`/projects/${id}`} className="mt-4 block">
          <Button
            className={`
      group/btn relative w-full overflow-hidden rounded-lg
      bg-gradient-to-r from-yellow-400 to-yellow-500
      px-6 py-5 text-sm font-bold text-gray-900
      shadow-md transition-all duration-300
      hover:from-yellow-500 hover:to-yellow-600
      hover:shadow-lg hover:-translate-y-0.5
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2
    `}
          >
            <span className="relative z-10">View Details</span>
            <ArrowRight className="relative z-10 ml-2 size-4 transition-transform duration-300 group-hover/btn:translate-x-1" />

            {/* Shine effect on hover */}
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover/btn:translate-x-full" />
          </Button>
        </Link>
      </div>

      {/* Top Accent Line */}
      <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
    </div>
  );
}