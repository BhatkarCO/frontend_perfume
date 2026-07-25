"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, User, Phone, ArrowRight, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

export default function Register() {
  const { register } = useAuth();
  const toast = useToast();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) return;

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);
    const result = await register(name, email, password, phone);
    setLoading(false);

    if (result.success) {
      localStorage.setItem("registering_email", email);
      toast.success(
        result.message || "Registration successful. Verify email to complete.",
      );
      router.push("/verify-email");
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-16 bg-luxury-deep">
      <div className="w-full max-w-md p-8 bg-white rounded-sm border border-luxury-lightgrey shadow-md flex flex-col gap-6">
        {/* Header */}
        <div className="text-center flex flex-col items-center gap-1">
          <span className="font-playfair text-xl font-bold tracking-widest text-luxury-black">
            BHATKAR & CO. PERFUMES
          </span>
          <h2 className="text-[10px] font-bold tracking-wider text-gray-400 uppercase mt-2">
            Create An Account
          </h2>
          <p className="text-xs text-gray-500 font-light">
            Join the Bhatkar & Co. inner circle for exclusive updates.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1 relative">
            <User className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="bg-luxury-deep border border-luxury-lightgrey text-luxury-black placeholder-gray-400 text-xs pl-11 pr-4 py-3.5 rounded-sm focus:outline-none focus:border-gold"
            />
          </div>

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
            <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
            <input
              type="tel"
              placeholder="Phone Number (e.g. +919876543210)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
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

          <div className="flex flex-col gap-1 relative">
            <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />

            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="bg-luxury-deep border border-luxury-lightgrey text-luxury-black placeholder-gray-400 text-xs pl-11 pr-11 py-3.5 rounded-sm focus:outline-none focus:border-gold"
            />

            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gold transition-colors"
              aria-label={
                showConfirmPassword ? "Hide password" : "Show password"
              }
            >
              {showConfirmPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>

          <p className="text-[10px] text-gray-500 leading-relaxed font-light">
            By signing up, you agree to Bhatkar & Co.'s{" "}
            <Link href="/policy/terms" className="text-gold underline">
              Terms & Conditions
            </Link>{" "}
            and{" "}
            <Link href="/policy/privacy" className="text-gold underline">
              Privacy Policy
            </Link>
            .
          </p>

          <button
            type="submit"
            disabled={loading}
            className="btn-gold w-full py-3.5 rounded-sm flex items-center justify-center gap-2 uppercase tracking-widest font-bold text-xs mt-2"
          >
            {loading ? "Registering..." : "Register"}{" "}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <hr className="border-luxury-lightgrey" />

        {/* Footer Link */}
        <p className="text-center text-xs text-gray-500 font-light">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-gold hover:text-gold-dark font-bold uppercase tracking-wider text-[10px]"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
