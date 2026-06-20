import Link from "next/link";
import {
  ChefHat,
  Globe,
  MessageCircle,
  Share2,
  Mail,
  MapPin,
  Phone,
  ArrowUpRight,
} from "lucide-react";

const footerLinks = {
  Product: [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Processes", href: "/recipes" },
    { label: "Analytics", href: "/dashboard" },
    { label: "Integrations", href: "/about" },
  ],
  Company: [
    { label: "About Us", href: "/about" },
    { label: "Careers", href: "/about" },
    { label: "Blog", href: "/about" },
    { label: "Contact", href: "/about" },
  ],
  Resources: [
    { label: "Documentation", href: "/about" },
    { label: "API Reference", href: "/about" },
    { label: "Community", href: "/about" },
    { label: "Support", href: "/about" },
  ],
};

const socialLinks = [
  { icon: Globe, href: "#", label: "Website" },
  { icon: MessageCircle, href: "#", label: "Twitter" },
  { icon: Share2, href: "#", label: "LinkedIn" },
  { icon: Mail, href: "#", label: "Email" },
];

export default function Footer() {
  return (
    <footer className="bg-surface border-t border-border mt-auto" id="footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                <ChefHat className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">
                <span className="gradient-text">Food</span>
                <span className="text-foreground">Pro</span>
              </span>
            </Link>
            <p className="text-sm text-muted max-w-sm leading-relaxed">
              Transforming food processing with intelligent automation, real-time monitoring, and advanced quality assurance systems.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted">
                <MapPin className="w-4 h-4 text-primary" />
                <span>123 Processing Blvd, Food City, FC 90210</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted">
                <Phone className="w-4 h-4 text-primary" />
                <span>+1 (555) 123-4567</span>
              </div>
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-semibold text-foreground mb-4 text-sm uppercase tracking-wider">
                {title}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="group text-sm text-muted hover:text-primary transition-colors flex items-center gap-1"
                    >
                      {link.label}
                      <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-0.5 group-hover:opacity-100 group-hover:translate-y-0 transition-all" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted">
            &copy; {new Date().getFullYear()} FoodPro. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            {socialLinks.map((social) => {
              const Icon = social.icon;
              return (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-9 h-9 rounded-lg bg-surface-hover border border-border flex items-center justify-center text-muted hover:text-primary hover:border-primary/40 transition-all duration-200 hover:scale-105"
                >
                  <Icon className="w-4 h-4" />
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
}
