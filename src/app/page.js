import Hero from "@/components/Hero";
import Card from "@/components/Card";
import {
  Factory,
  Thermometer,
  PackageCheck,
  FlaskConical,
  Truck,
  ShieldCheck,
} from "lucide-react";

const features = [
  {
    title: "Automated Production Lines",
    description:
      "Fully integrated automation systems that manage mixing, heating, cooling, and packaging with minimal human intervention.",
    icon: Factory,
    gradient: "from-primary to-emerald-400",
    actionHref: "/dashboard",
  },
  {
    title: "Temperature Monitoring",
    description:
      "Real-time thermal tracking across all production zones with instant alerts for critical deviations.",
    icon: Thermometer,
    gradient: "from-red-500 to-orange-400",
    actionHref: "/dashboard",
  },
  {
    title: "Quality Assurance",
    description:
      "AI-driven inspection systems that detect contaminants, measure consistency, and ensure every batch meets standards.",
    icon: FlaskConical,
    gradient: "from-accent to-blue-400",
    actionHref: "/recipes",
  },
  {
    title: "Smart Packaging",
    description:
      "Intelligent packaging lines with automated labeling, weight verification, and tamper-evident sealing.",
    icon: PackageCheck,
    gradient: "from-secondary to-amber-400",
    actionHref: "/recipes",
  },
  {
    title: "Supply Chain Tracking",
    description:
      "End-to-end visibility from raw material sourcing to final delivery with blockchain-verified traceability.",
    icon: Truck,
    gradient: "from-pink-500 to-rose-400",
    actionHref: "/dashboard",
  },
  {
    title: "Compliance & Safety",
    description:
      "Built-in HACCP, FDA, and ISO 22000 compliance checks with automatic documentation and audit trails.",
    icon: ShieldCheck,
    gradient: "from-teal-500 to-cyan-400",
    actionHref: "/about",
  },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <Hero />

      {/* Features Section */}
      <section className="py-20 bg-background" id="features-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14 animate-fade-in-up">
            <span className="text-sm font-semibold text-primary uppercase tracking-widest">
              Our Capabilities
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold mt-3 mb-4">
              Everything You Need to{" "}
              <span className="gradient-text">Process Smarter</span>
            </h2>
            <p className="text-muted max-w-2xl mx-auto text-lg">
              From raw ingredients to finished products, our platform covers
              every critical stage of modern food processing.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <Card
                  title={feature.title}
                  description={feature.description}
                  icon={feature.icon}
                  gradient={feature.gradient}
                  actionText="Explore"
                  actionHref={feature.actionHref}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden" id="cta-section">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5 -z-10" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center animate-fade-in-up">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-6">
            Ready to <span className="gradient-text">Transform</span> Your
            Production Line?
          </h2>
          <p className="text-muted text-lg mb-10 max-w-2xl mx-auto">
            Join over 150 food processing facilities that have already
            revolutionized their operations with FoodPro.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href="/dashboard"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-primary-dark text-white font-semibold rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:-translate-y-0.5"
            >
              Start Free Trial
            </a>
            <a
              href="/about"
              className="inline-flex items-center gap-2 px-8 py-4 bg-surface border border-border text-foreground font-semibold rounded-xl hover:bg-surface-hover hover:border-primary/30 transition-all duration-300 hover:-translate-y-0.5"
            >
              Schedule Demo
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
