import {
  Users,
  Target,
  Award,
  Globe,
  Lightbulb,
  Heart,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "About Us | FoodPro",
  description: "Learn about FoodPro's mission to revolutionize the food processing industry with intelligent automation and safety.",
};

const values = [
  {
    icon: Target,
    title: "Precision",
    description: "Every measurement, every temperature reading, every quality check — precision is non-negotiable in food safety.",
    gradient: "from-primary to-emerald-400",
  },
  {
    icon: Lightbulb,
    title: "Innovation",
    description: "We continuously push the boundaries of what's possible in food processing technology and automation.",
    gradient: "from-accent to-blue-400",
  },
  {
    icon: Heart,
    title: "Sustainability",
    description: "Reducing waste, optimizing energy usage, and promoting eco-friendly practices across the food supply chain.",
    gradient: "from-pink-500 to-rose-400",
  },
];

const team = [
  { name: "Dr. Sarah Chen", role: "Chief Executive Officer", initials: "SC", color: "from-primary to-emerald-400" },
  { name: "James Rodriguez", role: "VP of Engineering", initials: "JR", color: "from-accent to-blue-400" },
  { name: "Aisha Patel", role: "Head of Food Science", initials: "AP", color: "from-secondary to-amber-400" },
  { name: "Marcus Liu", role: "Director of Operations", initials: "ML", color: "from-pink-500 to-rose-400" },
];

const milestones = [
  { year: "2018", event: "FoodPro founded with a mission to digitize food processing" },
  { year: "2020", event: "Launched AI-powered quality inspection module" },
  { year: "2022", event: "Reached 100+ processing facility deployments" },
  { year: "2024", event: "Expanded to 15 countries across 4 continents" },
  { year: "2025", event: "Introduced real-time blockchain traceability" },
];

export default function AboutPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-transparent -z-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in-up">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary uppercase tracking-widest mb-4">
              <Globe className="w-4 h-4" />
              About FoodPro
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-6">
              Building the Future of{" "}
              <span className="gradient-text">Food Processing</span>
            </h1>
            <p className="text-lg text-muted leading-relaxed">
              FoodPro was founded with a simple belief: every food product deserves to be processed with the highest standards of safety, efficiency, and sustainability. We combine cutting-edge technology with deep food science expertise to make that vision a reality.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-border bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { value: "150+", label: "Facilities Worldwide" },
              { value: "15", label: "Countries" },
              { value: "2M+", label: "Batches Processed" },
              { value: "99.5%", label: "Safety Score" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-extrabold gradient-text">{stat.value}</div>
                <div className="text-sm text-muted mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14 animate-fade-in-up">
            <h2 className="text-3xl font-extrabold mb-4">Our Core Values</h2>
            <p className="text-muted text-lg max-w-xl mx-auto">
              The principles that guide every decision we make and every feature we build.
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div
                  key={value.title}
                  className="bg-surface border border-border rounded-2xl p-8 text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300 animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${value.gradient} flex items-center justify-center mx-auto mb-5 shadow-lg`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">{value.title}</h3>
                  <p className="text-sm text-muted leading-relaxed">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-surface border-y border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-center mb-14 animate-fade-in-up">Our Journey</h2>
          <div className="space-y-0">
            {milestones.map((item, index) => (
              <div key={item.year} className="flex gap-6 animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xs font-bold shadow-lg">
                    {item.year.slice(2)}
                  </div>
                  {index < milestones.length - 1 && (
                    <div className="w-0.5 h-16 bg-gradient-to-b from-primary/40 to-border" />
                  )}
                </div>
                <div className="pb-10">
                  <div className="text-sm font-bold text-primary">{item.year}</div>
                  <p className="text-foreground mt-1">{item.event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14 animate-fade-in-up">
            <h2 className="text-3xl font-extrabold mb-4">
              Meet the <span className="gradient-text">Team</span>
            </h2>
            <p className="text-muted text-lg max-w-xl mx-auto">
              A passionate team of engineers, food scientists, and industry experts.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, index) => (
              <div
                key={member.name}
                className="bg-surface border border-border rounded-2xl p-6 text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${member.color} flex items-center justify-center mx-auto mb-4 text-white text-xl font-bold shadow-lg`}>
                  {member.initials}
                </div>
                <h3 className="font-bold text-foreground">{member.name}</h3>
                <p className="text-sm text-muted mt-1">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-primary/5 via-accent/5 to-secondary/5 border-t border-border">
        <div className="max-w-3xl mx-auto px-4 text-center animate-fade-in-up">
          <h2 className="text-2xl font-extrabold mb-4">Interested in working with us?</h2>
          <p className="text-muted mb-8">
            Whether you&apos;re a food processing facility looking to modernize or a talented individual looking to join our team, we&apos;d love to hear from you.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-primary-dark text-white font-semibold rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
          >
            Get in Touch
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
