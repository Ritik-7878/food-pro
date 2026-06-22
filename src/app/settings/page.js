"use client";

import { useState } from "react";
import { Button, Input, Modal, Loader, useToast } from "@/components";
import { useTheme } from "@/context/ThemeContext";
import {
  User,
  Bell,
  Shield,
  Palette,
  Trash2,
  Save,
  Sun,
  Moon,
  Monitor,
} from "lucide-react";

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const toast = useToast();
  const [confirmModal, setConfirmModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [errors, setErrors] = useState({});

  const [profile, setProfile] = useState({
    name: "Ritik Choudhary",
    email: "ritik@foodpro.com",
    company: "FoodPro Industries",
    role: "Plant Manager",
  });

  const handleSave = () => {
    const newErrors = {};
    if (!profile.name) newErrors.name = "Full name is required";
    if (!profile.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(profile.email)) newErrors.email = "Invalid email address";

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast.error("Please correct the errors in the form.");
      return;
    }

    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success("Profile settings saved successfully!");
    }, 1200);
  };

  const handleClearCache = () => {
    setConfirmModal(false);
    toast.info("Cache cleared and settings reset.");
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-10 animate-fade-in-up">
          <h1 className="text-3xl font-extrabold gradient-text mb-2">Settings</h1>
          <p className="text-muted">Manage your account, preferences, and application settings.</p>
        </div>

        {/* Profile Section */}
        <section className="bg-surface border border-border rounded-2xl p-6 sm:p-8 shadow-sm mb-6 animate-fade-in-up" id="settings-profile">
          <div className="flex items-center gap-3 mb-6 border-b border-border/40 pb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Profile</h2>
              <p className="text-xs text-muted">Your personal information</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              placeholder="Your name"
              value={profile.name}
              onChange={(e) => {
                setProfile({ ...profile, name: e.target.value });
                if (errors.name) setErrors({ ...errors, name: "" });
              }}
              error={errors.name}
            />
            <Input
              label="Email"
              type="email"
              placeholder="you@company.com"
              value={profile.email}
              onChange={(e) => {
                setProfile({ ...profile, email: e.target.value });
                if (errors.email) setErrors({ ...errors, email: "" });
              }}
              error={errors.email}
            />
            <Input
              label="Company"
              placeholder="Company name"
              value={profile.company}
              onChange={(e) => setProfile({ ...profile, company: e.target.value })}
            />
            <Input
              label="Role"
              placeholder="Your role"
              value={profile.role}
              onChange={(e) => setProfile({ ...profile, role: e.target.value })}
            />
          </div>
          <div className="mt-6 flex gap-3">
            <Button variant="primary" onClick={handleSave} disabled={saving} id="settings-save">
              {saving ? <Loader size="sm" className="mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              {saving ? "Saving..." : "Save Changes"}
            </Button>
            <Button variant="outline" onClick={() => toast.info("Profile changes discarded.")}>
              Cancel
            </Button>
          </div>
        </section>

        {/* Appearance Section */}
        <section className="bg-surface border border-border rounded-2xl p-6 sm:p-8 shadow-sm mb-6 animate-fade-in-up animation-delay-100" id="settings-appearance">
          <div className="flex items-center gap-3 mb-6 border-b border-border/40 pb-4">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <Palette className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Appearance</h2>
              <p className="text-xs text-muted">Toggle dark and light mode</p>
            </div>
          </div>
          <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-background/50">
            <div className="flex items-center gap-3">
              <Monitor className="w-5 h-5 text-muted" />
              <div>
                <p className="text-sm font-semibold text-foreground">Theme</p>
                <p className="text-xs text-muted">Currently using <span className="font-semibold text-primary">{theme === "dark" ? "Dark" : "Light"}</span> mode</p>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className="relative w-14 h-7 rounded-full bg-border transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
              id="settings-theme-toggle"
              aria-label="Toggle dark mode"
            >
              <div
                className={`absolute top-0.5 w-6 h-6 rounded-full shadow-md flex items-center justify-center transition-all duration-300 ${
                  theme === "dark"
                    ? "translate-x-7.5 bg-accent"
                    : "translate-x-0.5 bg-white"
                }`}
              >
                {theme === "dark" ? (
                  <Moon className="w-3.5 h-3.5 text-white" />
                ) : (
                  <Sun className="w-3.5 h-3.5 text-secondary" />
                )}
              </div>
            </button>
          </div>
        </section>

        {/* Notifications Section */}
        <section className="bg-surface border border-border rounded-2xl p-6 sm:p-8 shadow-sm mb-6 animate-fade-in-up animation-delay-200" id="settings-notifications">
          <div className="flex items-center gap-3 mb-6 border-b border-border/40 pb-4">
            <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
              <Bell className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Notifications</h2>
              <p className="text-xs text-muted">Configure alert preferences</p>
            </div>
          </div>
          <div className="space-y-3">
            {["Temperature Alerts", "Batch Completion", "Quality Warnings", "System Updates"].map((item) => (
              <div key={item} className="flex items-center justify-between p-3 rounded-xl border border-border/50 bg-background/30 hover:bg-surface-hover transition-colors">
                <span className="text-sm font-medium text-foreground">{item}</span>
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-primary border-border focus:ring-primary/30" />
              </div>
            ))}
          </div>
        </section>

        {/* Danger Zone */}
        <section className="bg-surface border border-danger/30 rounded-2xl p-6 sm:p-8 shadow-sm animate-fade-in-up animation-delay-300" id="settings-danger">
          <div className="flex items-center gap-3 mb-6 border-b border-danger/20 pb-4">
            <div className="w-10 h-10 rounded-xl bg-danger/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-danger" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-danger">Danger Zone</h2>
              <p className="text-xs text-muted">Irreversible actions</p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => setConfirmModal(true)}
            className="border-danger/40 text-danger hover:bg-danger/5"
            id="settings-clear-cache"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear Cache &amp; Reset
          </Button>
        </section>

        {/* Confirm Modal */}
        <Modal
          isOpen={confirmModal}
          onClose={() => setConfirmModal(false)}
          title="Confirm Reset"
        >
          <p className="mb-6">Are you sure you want to clear cache and reset all settings? This action cannot be undone.</p>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setConfirmModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleClearCache}
              className="bg-danger hover:bg-danger/90"
            >
              Yes, Reset
            </Button>
          </div>
        </Modal>
      </div>
    </div>
  );
}
