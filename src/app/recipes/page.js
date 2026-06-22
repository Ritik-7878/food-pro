import { Card } from "@/components";
import {
  Milk,
  Wheat,
  Beef,
  Apple,
  Cookie,
  Wine,
  FlaskConical,
  Timer,
  ShieldCheck,
} from "lucide-react";

export const metadata = {
  title: "Processing Methods | FoodPro",
  description: "Explore FoodPro's comprehensive library of food processing methods, procedures, and quality protocols.",
};

const processes = [
  {
    title: "Dairy Pasteurization",
    description: "High-temperature short-time (HTST) pasteurization protocol for milk and dairy products. Ensures pathogen elimination while preserving nutritional value.",
    icon: Milk,
    gradient: "from-blue-500 to-cyan-400",
    category: "Thermal Processing",
  },
  {
    title: "Grain Milling & Refining",
    description: "Multi-stage grain processing including cleaning, tempering, milling, and sifting. Produces consistent flour grades for bakery applications.",
    icon: Wheat,
    gradient: "from-amber-500 to-yellow-400",
    category: "Mechanical Processing",
  },
  {
    title: "Meat Curing & Packaging",
    description: "Controlled curing process with nitrate management, vacuum packaging, and modified atmosphere storage for extended shelf life.",
    icon: Beef,
    gradient: "from-red-500 to-rose-400",
    category: "Preservation",
  },
  {
    title: "Fruit Juice Extraction",
    description: "Cold-press extraction and flash pasteurization for premium fruit juices. Retains maximum vitamins and natural flavor profiles.",
    icon: Apple,
    gradient: "from-green-500 to-lime-400",
    category: "Extraction",
  },
  {
    title: "Snack Extrusion",
    description: "Twin-screw extrusion technology for creating puffed snacks, cereal shapes, and textured protein products at high throughput.",
    icon: Cookie,
    gradient: "from-orange-500 to-amber-400",
    category: "Mechanical Processing",
  },
  {
    title: "Beverage Fermentation",
    description: "Controlled fermentation monitoring with automated pH, temperature, and sugar level tracking for consistent batch quality.",
    icon: Wine,
    gradient: "from-purple-500 to-violet-400",
    category: "Biological Processing",
  },
];

const categories = ["All", "Thermal Processing", "Mechanical Processing", "Preservation", "Extraction", "Biological Processing"];

export default function RecipesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-10 animate-fade-in-up">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-medium mb-4">
          <FlaskConical className="w-3.5 h-3.5" />
          Process Library
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold">
          <span className="gradient-text">Processing Methods</span> & Protocols
        </h1>
        <p className="text-muted mt-3 text-lg max-w-2xl">
          Browse our comprehensive library of food processing procedures, quality control protocols, and safety standards.
        </p>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap gap-2 mb-10 animate-fade-in-up animation-delay-100">
        {categories.map((cat, index) => (
          <button
            key={cat}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 ${
              index === 0
                ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                : "bg-surface text-muted border-border hover:border-primary/40 hover:text-foreground"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Process Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {processes.map((process, index) => (
          <div
            key={process.title}
            className="animate-fade-in-up"
            style={{ animationDelay: `${(index + 1) * 100}ms` }}
          >
            <Card
              title={process.title}
              description={process.description}
              icon={process.icon}
              gradient={process.gradient}
              actionText="View Protocol"
              actionHref="/recipes"
            />
          </div>
        ))}
      </div>

      {/* Info Banner */}
      <div className="bg-gradient-to-r from-primary/5 via-accent/5 to-secondary/5 border border-border rounded-2xl p-8 animate-fade-in-up">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Timer className="w-6 h-6 text-primary" />
            </div>
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 text-accent" />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground mb-1">
              All processes are HACCP & ISO 22000 compliant
            </h3>
            <p className="text-sm text-muted">
              Every procedure in our library has been validated by certified food safety auditors and includes complete documentation for regulatory compliance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
