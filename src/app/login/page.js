"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

function LoginContent() {
  const { login, logout } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const redirectPath = searchParams.get("redirect") || "/dashboard";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      if (result.user.role === "admin") {
        toast.success("Welcome back, Admin. Redirecting to Admin Console...");
        router.push("/admin");
        return;
      }
      toast.success("Welcome back to Bhatkar & Co. Perfumes.");
      if (!result.user.is_verified) {
        toast.info("Please verify your email to complete registration.");
        router.push("/verify-email");
      } else { typeof window === "undefined"
        router.push(redirectPath);
      }
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 bg-luxury-deep">
      <div className="w-full max-w-md p-8 bg-white rounded-sm border border-luxury-lightgrey shadow-md flex flex-col gap-6">
        {/* Header */}
        <div className="text-center flex flex-col items-center gap-1">
          <span className="font-playfair text-xl font-bold tracking-widest text-luxury-black">
            BHATKAR & CO. PERFUMES
          </span>
          <h2 className="text-[10px] font-bold tracking-wider text-gray-400 uppercase mt-2">
            Sign In to Your Account
          </h2>
          <p className="text-xs text-gray-500 font-light">
            Access your premium dashboard, orders and wishlist.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1 relative">
            <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-luxury-deep border border-luxury-lightgrey text-luxury-black placeholder-gray-400 text-xs pl-11 pr-4 py-3.5 rounded-sm focus:outline-none focus:border-gold"
            />
          </div>

          <div className="flex flex-col gap-1 relative">
            <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />

            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-luxury-deep border border-luxury-lightgrey text-luxury-black placeholder-gray-400 text-xs pl-11 pr-11 py-3.5 rounded-sm focus:outline-none focus:border-gold"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gold transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>

          <div className="flex justify-between items-center text-xs text-gray-500 mt-1">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" className="accent-gold rounded" />
              <span>Remember Me</span>
            </label>
            <Link
              href="/forgot-password"
              className="text-gold hover:text-gold-dark font-bold"
            >
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-gold w-full py-3.5 rounded-sm flex items-center justify-center gap-2 uppercase tracking-widest font-bold text-xs mt-2"
          >
            {loading ? "Signing In..." : "Sign In"}{" "}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <hr className="border-luxury-lightgrey" />

        {/* Footer Link */}
        <p className="text-center text-xs text-gray-500 font-light">
          Don't have an account?{" "}
          <Link
            href="/register"
            className="text-gold hover:text-gold-dark font-bold uppercase tracking-wider text-[10px]"
          >
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center py-32 text-gold text-xs uppercase tracking-widest font-semibold bg-luxury-deep">
          Loading Sign In...
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
