import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Card({
  title,
  description,
  icon: Icon,
  image,
  actionText = "Learn More",
  actionHref = "#",
  gradient = "from-primary to-accent",
  className = "",
}) {
  return (
    <div
      className={`group relative bg-surface border border-border rounded-2xl overflow-hidden shadow-[var(--card-shadow)] hover:shadow-[var(--card-shadow-hover)] hover:-translate-y-1 transition-all duration-300 ${className}`}
    >
      {/* Optional Image */}
      {image && (
        <div className="h-48 overflow-hidden">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      )}

      <div className="p-6">
        {/* Icon */}
        {Icon && (
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        )}

        {/* Title */}
        <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors duration-200">
          {title}
        </h3>

        {/* Description */}
        <p className="text-sm text-muted leading-relaxed mb-4">
          {description}
        </p>

        {/* Action */}
        {actionText && (
          <Link
            href={actionHref}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-dark transition-colors group/link"
          >
            {actionText}
            <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform" />
          </Link>
        )}
      </div>

      {/* Decorative corner gradient */}
      <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl ${gradient} opacity-5 rounded-bl-full group-hover:opacity-10 transition-opacity duration-300`} />
    </div>
  );
}
