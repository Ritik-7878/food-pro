import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  Shield,
  Zap,
} from "lucide-react";

export default function Hero({
  headline = "Smart Food Processing, Reimagined",
  subheadline = "Automate, monitor, and optimize every stage of your food production pipeline with cutting-edge technology and real-time intelligence.",
  ctaText = "Get Started",
  ctaHref = "/dashboard",
}) {
  return (
    <section className="relative overflow-hidden" id="hero-section">
      {/* Background decorations */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-float animation-delay-300" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left - Text Content */}
          <div className="space-y-8 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              Next-Gen Food Processing Platform
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight">
              {headline.split(",").map((part, i) =>
                i === 0 ? (
                  <span key={i} className="gradient-text">{part}</span>
                ) : (
                  <span key={i} className="text-foreground">,{part}</span>
                )
              )}
            </h1>

            <p className="text-lg sm:text-xl text-muted max-w-xl leading-relaxed">
              {subheadline}
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href={ctaHref}
                id="hero-cta-primary"
                className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-primary-dark text-white font-semibold rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:-translate-y-0.5"
              >
                {ctaText}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/about"
                id="hero-cta-secondary"
                className="inline-flex items-center gap-2 px-8 py-4 bg-surface border border-border text-foreground font-semibold rounded-xl hover:bg-surface-hover hover:border-primary/30 transition-all duration-300 hover:-translate-y-0.5"
              >
                Learn More
              </Link>
            </div>

            {/* Quick stats */}
            <div className="flex gap-8 pt-4">
              {[
                { value: "99.5%", label: "Uptime" },
                { value: "150+", label: "Facilities" },
                { value: "24/7", label: "Monitoring" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl font-bold gradient-text">{stat.value}</div>
                  <div className="text-sm text-muted">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right - Visual Card Grid */}
          <div className="relative hidden lg:block animate-fade-in animation-delay-300">
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Zap, title: "Real-Time Tracking", desc: "Monitor every stage of production", color: "from-primary to-emerald-400" },
                { icon: Shield, title: "Safety Compliance", desc: "Automated HACCP & FDA checks", color: "from-accent to-blue-400" },
                { icon: Sparkles, title: "Quality Control", desc: "AI-powered defect detection", color: "from-secondary to-orange-400" },
                { icon: ArrowRight, title: "Smart Logistics", desc: "Optimized supply chain flow", color: "from-pink-500 to-rose-400" },
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className={`p-6 rounded-2xl bg-surface border border-border shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-fade-in-up ${
                      index === 1 ? "mt-8" : index === 3 ? "mt-8" : ""
                    }`}
                    style={{ animationDelay: `${(index + 2) * 100}ms` }}
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4 shadow-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                    <p className="text-sm text-muted">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
