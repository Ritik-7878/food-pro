"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import {
  Menu,
  X,
  ChefHat,
  User,
  Home,
  LayoutDashboard,
  BookOpen,
  Info,
  Cpu,
  Sun,
  Moon,
  Settings,
  LogOut,
} from "lucide-react";

const navLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/recipes", label: "Processes", icon: BookOpen },
  { href: "/ai-features", label: "AI Inspection", icon: Cpu },
  { href: "/about", label: "About", icon: Info },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-50 bg-surface/80 dark:bg-surface/75 backdrop-blur-xl border-b border-border transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group" id="nav-logo">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg group-hover:shadow-primary/30 transition-all duration-300 group-hover:scale-105">
                <ChefHat className="w-5 h-5 text-white" />
              </div>
            </div>
            <span className="text-xl font-bold tracking-tight">
              <span className="gradient-text">Food</span>
              <span className="text-foreground">Pro</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  id={`nav-${link.label.toLowerCase().replace(" ", "-")}`}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-primary/10 text-primary shadow-sm"
                      : "text-muted hover:text-foreground hover:bg-surface-hover"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right side: Profile + Settings + Theme + Mobile toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-lg bg-surface-hover border border-border flex items-center justify-center text-muted hover:text-foreground transition-all duration-200 hover:scale-105 cursor-pointer"
              id="nav-theme-toggle"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-secondary" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>

            {/* Settings Link */}
            <Link
              href="/settings"
              id="nav-settings"
              className={`w-9 h-9 rounded-lg bg-surface-hover border border-border flex items-center justify-center text-muted hover:text-foreground transition-all duration-200 hover:scale-105 ${
                pathname === "/settings" ? "text-primary border-primary/30 bg-primary/5" : ""
              }`}
              aria-label="Settings"
            >
              <Settings className="w-4 h-4" />
            </Link>

            {/* Profile / Logout Button */}
            {isAuthenticated ? (
              <button
                onClick={logout}
                id="nav-logout"
                className="w-9 h-9 rounded-full bg-danger/10 border border-danger/20 flex items-center justify-center text-danger hover:bg-danger hover:text-white transition-all duration-200 hover:scale-105 cursor-pointer"
                aria-label="Log Out"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            ) : (
              <Link
                href="/login"
                id="nav-profile"
                className={`w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border border-border flex items-center justify-center text-muted hover:text-primary hover:border-primary/40 transition-all duration-200 hover:scale-105 ${
                  pathname === "/login" ? "ring-2 ring-primary/40" : ""
                }`}
              >
                <User className="w-4 h-4" />
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden w-9 h-9 rounded-lg bg-surface-hover flex items-center justify-center text-muted hover:text-foreground transition-colors"
              id="nav-mobile-toggle"
              aria-label="Toggle mobile menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Panel */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          mobileOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 pb-4 space-y-1 border-t border-border bg-surface/90 dark:bg-surface/85 backdrop-blur-xl">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-primary/10 text-primary shadow-xs"
                    : "text-muted hover:text-foreground hover:bg-surface-hover"
                }`}
              >
                <Icon className="w-4 h-4" />
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
