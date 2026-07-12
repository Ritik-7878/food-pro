"use client";

import { useState, useEffect } from "react";
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
  Plus,
  Edit2,
  Trash2,
} from "lucide-react";
import { Button, Input, Modal, Loader, useToast, ProtectedRoute } from "@/components";
import { useAuth } from "@/context/AuthContext";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

export default function DashboardPage() {
  const { token, logout } = useAuth();
  const toast = useToast();
  
  // Data States
  const [productionLines, setProductionLines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentLine, setCurrentLine] = useState({ name: "", status: "Running", progress: 0, temp: "" });
  const [formErrors, setFormErrors] = useState({});

  // Delete States
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [lineToDelete, setLineToDelete] = useState(null);

  // Dynamic Recent Activity Log (Stateful)
  const [activities, setActivities] = useState([
    { time: "2 min ago", event: "Line 7 completed batch #4721", status: "success", icon: CheckCircle2 },
    { time: "15 min ago", event: "Temperature alert on Zone B3", status: "warning", icon: AlertTriangle },
    { time: "32 min ago", event: "Quality check passed — Batch #4720", status: "success", icon: CheckCircle2 },
    { time: "1 hr ago", event: "Line 3 paused for maintenance", status: "error", icon: XCircle },
    { time: "1.5 hrs ago", event: "New shipment received — 2,400 kg raw materials", status: "success", icon: PackageCheck },
    { time: "2 hrs ago", event: "Automated packaging started on Line 12", status: "success", icon: CheckCircle2 },
  ]);

  // Fetch Production Lines (Supports Search)
  const fetchLines = async (query = "") => {
    if (!token) return;
    setLoading(true);
    try {
      const url = query
        ? `${API_BASE}/api/production-lines/search?q=${encodeURIComponent(query)}`
        : `${API_BASE}/api/production-lines`;
      const res = await fetch(url, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.status === 401) {
        logout();
        return;
      }
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      setProductionLines(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load production lines from backend.");
    } finally {
      setLoading(false);
    }
  };

  // Trigger search on debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchLines(searchQuery);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Handle Form Submission (Add or Edit)
  const handleSubmit = async () => {
    const errors = {};
    if (!currentLine.name.trim()) errors.name = "Line name is required";
    const progressNum = Number(currentLine.progress);
    if (isNaN(progressNum) || progressNum < 0 || progressNum > 100) {
      errors.progress = "Progress must be between 0 and 100";
    }
    if (!currentLine.temp.trim()) errors.temp = "Temperature is required";

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast.error("Please fill in all fields correctly.");
      return;
    }

    setSaving(true);
    try {
      const url = isEditing
        ? `${API_BASE}/api/production-lines/${currentLine.id}`
        : `${API_BASE}/api/production-lines`;
      
      const method = isEditing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          name: currentLine.name,
          status: currentLine.status,
          progress: progressNum,
          temp: currentLine.temp,
        }),
      });

      if (res.status === 401) {
        logout();
        return;
      }

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const savedData = await res.json();

      // Log activity
      const actionTime = "Just now";
      const activityEvent = isEditing
        ? `Updated production line: ${savedData.name}`
        : `Added new production line: ${savedData.name}`;
      const activityStatus = savedData.status === "Running" ? "success" : "warning";
      const activityIcon = savedData.status === "Running" ? CheckCircle2 : AlertTriangle;

      setActivities(prev => [
        { time: actionTime, event: activityEvent, status: activityStatus, icon: activityIcon },
        ...prev
      ]);

      toast.success(isEditing ? "Production line updated successfully!" : "New production line created!");
      setModalOpen(false);
      fetchLines(searchQuery); // Refresh list
    } catch (err) {
      console.error(err);
      toast.error(isEditing ? "Failed to update production line." : "Failed to create production line.");
    } finally {
      setSaving(false);
    }
  };

  // Handle Delete operation
  const handleDelete = async () => {
    if (!lineToDelete) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/production-lines/${lineToDelete.id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (res.status === 401) {
        logout();
        return;
      }

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      // Log activity
      setActivities(prev => [
        { time: "Just now", event: `Deleted production line: ${lineToDelete.name}`, status: "error", icon: XCircle },
        ...prev
      ]);

      toast.success("Production line deleted successfully.");
      setDeleteConfirmOpen(false);
      fetchLines(searchQuery); // Refresh list
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete production line.");
    } finally {
      setSaving(false);
    }
  };

  // Open modals helper
  const openAddModal = () => {
    setCurrentLine({ name: "", status: "Running", progress: 0, temp: "" });
    setFormErrors({});
    setIsEditing(false);
    setModalOpen(true);
  };

  const openEditModal = (line) => {
    setCurrentLine(line);
    setFormErrors({});
    setIsEditing(true);
    setModalOpen(true);
  };

  const openDeleteConfirm = (line) => {
    setLineToDelete(line);
    setDeleteConfirmOpen(true);
  };

  // Compute dynamic stats
  const activeLinesCount = productionLines.filter(l => l.status === "Running").length;
  const tempAlertsCount = productionLines.filter(l => {
    const numericTemp = parseFloat(l.temp);
    // Alert if temperature is above 30C or below 0C (just a simple mock threshold rule)
    return isNaN(numericTemp) ? false : (numericTemp > 30 || numericTemp < 0);
  }).length;

  const stats = [
    { label: "Active Lines", value: String(activeLinesCount), change: "+2", icon: Activity, color: "text-primary", bg: "bg-primary/10" },
    { label: "Temperature Alerts", value: String(tempAlertsCount), change: "-1", icon: Thermometer, color: "text-red-500", bg: "bg-red-500/10" },
    { label: "Batches Today", value: "47", change: "+12", icon: PackageCheck, color: "text-accent", bg: "bg-accent/10" },
    { label: "Compliance Score", value: "98%", change: "+1%", icon: CheckCircle2, color: "text-secondary", bg: "bg-secondary/10" },
  ];

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8 animate-fade-in-up flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold">
            <span className="gradient-text">Dashboard</span>
          </h1>
          <p className="text-muted mt-2 text-lg">
            Real-time overview of your food processing operations.
          </p>
        </div>
        <div>
          <Button
            variant="primary"
            onClick={openAddModal}
            className="inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Production Line
          </Button>
        </div>
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
        {/* Production Lines Panel */}
        <div className="lg:col-span-2 bg-surface border border-border rounded-2xl p-6 animate-fade-in-up animation-delay-200 flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Production Lines
            </h2>
            <div className="w-full sm:w-64">
              <Input
                placeholder="Search lines..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="py-1 text-xs"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 flex-1">
              <Loader size="lg" />
              <p className="text-sm text-muted mt-4">Connecting to live feed...</p>
            </div>
          ) : productionLines.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-border rounded-xl flex-1 flex flex-col items-center justify-center">
              <p className="text-muted text-lg mb-4">No production lines found.</p>
              <Button variant="outline" size="sm" onClick={openAddModal}>
                <Plus className="w-4 h-4 mr-2" />
                Add New Line
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {productionLines.map((line) => (
                <div
                  key={line.id || line.name}
                  className="flex items-center gap-4 p-4 rounded-xl bg-background border border-border hover:border-primary/30 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-foreground truncate">{line.name}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                          line.status === "Running"
                            ? "bg-primary/10 text-primary"
                            : line.status === "Paused"
                            ? "bg-secondary/10 text-secondary-dark"
                            : "bg-red-500/10 text-red-500"
                        }`}>
                          {line.status}
                        </span>
                        
                        {/* Action Buttons */}
                        <div className="flex items-center gap-1 border-l border-border pl-2 ml-1">
                          <button
                            onClick={() => openEditModal(line)}
                            className="p-1.5 text-muted hover:text-primary rounded-lg hover:bg-surface transition-colors"
                            title="Edit production line"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => openDeleteConfirm(line)}
                            className="p-1.5 text-muted hover:text-red-500 rounded-lg hover:bg-surface transition-colors"
                            title="Delete production line"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
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
          )}
        </div>

        {/* Recent Activity Panel */}
        <div className="bg-surface border border-border rounded-2xl p-6 animate-fade-in-up animation-delay-300">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Recent Activity
            </h2>
          </div>
          <div className="space-y-4 max-h-[480px] overflow-y-auto pr-1">
            {activities.map((item, index) => {
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

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={isEditing ? "Edit Production Line" : "Add Production Line"}
      >
        <div className="space-y-4">
          <Input
            label="Line Name"
            placeholder="e.g. Line 14 — Ice Cream Extrusion"
            value={currentLine.name}
            onChange={e => {
              setCurrentLine({ ...currentLine, name: e.target.value });
              if (formErrors.name) setFormErrors({ ...formErrors, name: null });
            }}
            error={formErrors.name}
          />
          
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-xs font-semibold text-muted dark:text-muted/80 tracking-wide uppercase">
              Operational Status
            </label>
            <select
              value={currentLine.status}
              onChange={e => setCurrentLine({ ...currentLine, status: e.target.value })}
              className="w-full px-4 py-3 text-sm bg-surface/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
            >
              <option value="Running">Running</option>
              <option value="Paused">Paused</option>
              <option value="Stopped">Stopped</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Progress (%)"
              type="number"
              min="0"
              max="100"
              value={currentLine.progress}
              onChange={e => {
                setCurrentLine({ ...currentLine, progress: e.target.value });
                if (formErrors.progress) setFormErrors({ ...formErrors, progress: null });
              }}
              error={formErrors.progress}
            />
            <Input
              label="Temperature (C)"
              placeholder="e.g. 4.2°C"
              value={currentLine.temp}
              onChange={e => {
                setCurrentLine({ ...currentLine, temp: e.target.value });
                if (formErrors.temp) setFormErrors({ ...formErrors, temp: null });
              }}
              error={formErrors.temp}
            />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmit} disabled={saving}>
              {saving ? <Loader size="sm" className="mr-2" /> : null}
              {isEditing ? "Save Changes" : "Add Line"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Delete Production Line"
      >
        <p className="mb-6">
          Are you sure you want to delete <strong>{lineToDelete?.name}</strong>? This action will permanently remove it from the monitoring console.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleDelete}
            className="bg-danger hover:bg-danger/90"
            disabled={saving}
          >
            {saving ? <Loader size="sm" className="mr-2" /> : null}
            Delete Line
          </Button>
        </div>
      </Modal>
    </div>
    </ProtectedRoute>
  );
}
