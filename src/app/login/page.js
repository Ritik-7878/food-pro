"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, Input, Loader } from "@/components/ui";
import { useToast } from "@/components/ui/Toast";
import {
  ChefHat,
  Eye,
  EyeOff,
  ArrowRight,
  Share2,
} from "lucide-react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Invalid email address";
    if (!password) newErrors.password = "Password is required";
    else if (password.length < 6) newErrors.password = "Must be at least 6 characters";

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        setLoading(false);
        if (email === "admin@foodpro.com" && password === "password") {
          toast.success("Signed in successfully! Welcome back.");
        } else {
          toast.error("Invalid credentials. Try admin@foodpro.com / password");
        }
      }, 1500);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/6 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/6 w-64 h-64 bg-accent/10 rounded-full blur-3xl animate-float animation-delay-300" />
      </div>

      <div className="w-full max-w-md animate-fade-in-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto shadow-xl shadow-primary/20 mb-4">
            <ChefHat className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-foreground">
            Welcome Back
          </h1>
          <p className="text-muted mt-2">
            Sign in to your FoodPro account
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-surface border border-border rounded-2xl p-8 shadow-xl">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Email Field */}
            <Input
              label="Email Address"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
            />

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-muted dark:text-muted/80 tracking-wide uppercase">
                  Password
                </label>
                <a href="#" className="text-xs text-primary hover:text-primary-dark transition-colors">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-4 pr-12 py-3 text-sm bg-surface/50 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                    errors.password
                      ? "border-danger focus:ring-danger/20 focus:border-danger text-danger"
                      : "border-border focus:ring-primary/20 focus:border-primary text-foreground"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
              {errors.password && <span className="text-xs text-danger font-medium mt-1.5 block animate-fade-in">{errors.password}</span>}
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2">
              <input
                id="login-remember"
                type="checkbox"
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary/30 bg-background"
              />
              <label htmlFor="login-remember" className="text-sm text-muted">
                Remember me for 30 days
              </label>
            </div>

            {/* Sign In Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={loading}
              className="w-full"
              id="login-submit"
            >
              {loading ? (
                <Loader size="sm" className="mr-2" />
              ) : null}
              {loading ? "Signing In..." : "Sign In"}
              {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted uppercase tracking-wider">or continue with</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Social Logins */}
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="gap-2">
              <svg className="w-4.5 h-4.5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </Button>
            <Button variant="outline" className="gap-2">
              <Share2 className="w-4.5 h-4.5" />
              GitHub
            </Button>
          </div>
        </div>

        {/* Sign Up Link */}
        <p className="text-center text-sm text-muted mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/login" className="text-primary font-semibold hover:text-primary-dark transition-colors">
            Sign up for free
          </Link>
        </p>
      </div>
    </div>
  );
}
