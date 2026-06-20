import {
  Activity,
  Thermometer,
  PackageCheck,
  AlertTriangle,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  BarChart3,
} from "lucide-react";

export const metadata = {
  title: "Dashboard | FoodPro",
  description: "Monitor your food processing operations in real-time with FoodPro's intelligent dashboard.",
};

const stats = [
  { label: "Active Lines", value: "12", change: "+2", icon: Activity, color: "text-primary", bg: "bg-primary/10" },
  { label: "Temperature Alerts", value: "3", change: "-5", icon: Thermometer, color: "text-red-500", bg: "bg-red-500/10" },
  { label: "Batches Today", value: "47", change: "+12", icon: PackageCheck, color: "text-accent", bg: "bg-accent/10" },
  { label: "Compliance Score", value: "98%", change: "+1%", icon: CheckCircle2, color: "text-secondary", bg: "bg-secondary/10" },
];

const recentActivity = [
  { time: "2 min ago", event: "Line 7 completed batch #4721", status: "success", icon: CheckCircle2 },
  { time: "15 min ago", event: "Temperature alert on Zone B3", status: "warning", icon: AlertTriangle },
  { time: "32 min ago", event: "Quality check passed — Batch #4720", status: "success", icon: CheckCircle2 },
  { time: "1 hr ago", event: "Line 3 paused for maintenance", status: "error", icon: XCircle },
  { time: "1.5 hrs ago", event: "New shipment received — 2,400 kg raw materials", status: "success", icon: PackageCheck },
  { time: "2 hrs ago", event: "Automated packaging started on Line 12", status: "success", icon: CheckCircle2 },
];

const productionLines = [
  { name: "Line 1 — Dairy Processing", status: "Running", progress: 78, temp: "4.2°C" },
  { name: "Line 3 — Beverage Mixing", status: "Paused", progress: 45, temp: "22.1°C" },
  { name: "Line 7 — Grain Milling", status: "Running", progress: 92, temp: "28.5°C" },
  { name: "Line 9 — Meat Packaging", status: "Running", progress: 61, temp: "-2.1°C" },
  { name: "Line 12 — Snack Production", status: "Running", progress: 34, temp: "35.0°C" },
];

export default function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8 animate-fade-in-up">
        <h1 className="text-3xl font-extrabold">
          <span className="gradient-text">Dashboard</span>
        </h1>
        <p className="text-muted mt-2 text-lg">
          Real-time overview of your food processing operations.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-surface border border-border rounded-2xl p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <span className={`text-sm font-medium flex items-center gap-1 ${
                  stat.change.startsWith("+") ? "text-primary" : "text-red-500"
                }`}>
                  <TrendingUp className="w-3.5 h-3.5" />
                  {stat.change}
                </span>
              </div>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <div className="text-sm text-muted">{stat.label}</div>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Production Lines */}
        <div className="lg:col-span-2 bg-surface border border-border rounded-2xl p-6 animate-fade-in-up animation-delay-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Production Lines
            </h2>
            <span className="text-sm text-muted">Live Status</span>
          </div>
          <div className="space-y-4">
            {productionLines.map((line) => (
              <div
                key={line.name}
                className="flex items-center gap-4 p-4 rounded-xl bg-background border border-border hover:border-primary/30 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-foreground truncate">{line.name}</span>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      line.status === "Running"
                        ? "bg-primary/10 text-primary"
                        : line.status === "Paused"
                        ? "bg-secondary/10 text-secondary-dark"
                        : "bg-red-500/10 text-red-500"
                    }`}>
                      {line.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="w-full h-2 bg-border rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500"
                          style={{ width: `${line.progress}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-xs text-muted font-medium w-10 text-right">{line.progress}%</span>
                    <span className="text-xs text-muted flex items-center gap-1">
                      <Thermometer className="w-3 h-3" />
                      {line.temp}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-surface border border-border rounded-2xl p-6 animate-fade-in-up animation-delay-300">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Recent Activity
            </h2>
          </div>
          <div className="space-y-4">
            {recentActivity.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="flex gap-3">
                  <div className={`mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    item.status === "success"
                      ? "bg-primary/10 text-primary"
                      : item.status === "warning"
                      ? "bg-secondary/10 text-secondary-dark"
                      : "bg-red-500/10 text-red-500"
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm text-foreground">{item.event}</p>
                    <p className="text-xs text-muted mt-0.5">{item.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
