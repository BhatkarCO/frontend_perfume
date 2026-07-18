"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, KeyRound, ArrowRight, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import OTPInput from '@/components/OTPInput';

export default function ForgotPassword() {
  const { forgotPassword, resetPassword } = useAuth();
  const toast = useToast();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequestCode = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    const result = await forgotPassword(email);
    setLoading(false);

    if (result.success) {
      toast.success(result.message || 'If registered, a reset code was sent.');
      setStep(2);
    } else {
      toast.error(result.message);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword) return;

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setLoading(true);
    const result = await resetPassword(email, newPassword);
    setLoading(false);

    if (result.success) {
      toast.success('Password updated successfully. You can now login.');
      router.push('/login');
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 bg-luxury-deep">
      <div className="w-full max-w-md p-8 bg-white rounded-sm border border-luxury-lightgrey shadow-md flex flex-col gap-6">
        
        {step === 1 && (
          <>
            {/* Step 1: Request Code Header */}
            <div className="text-center flex flex-col items-center gap-1">
              <span className="font-playfair text-xl font-bold tracking-widest text-luxury-black uppercase">FORGOT PASSWORD</span>
              <p className="text-xs text-gray-500 mt-2 max-w-xs leading-relaxed font-light">
                Enter your registered email address below. We will send you a reset code.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleRequestCode} className="flex flex-col gap-4">
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

              <button
                type="submit"
                disabled={loading}
                className="btn-gold w-full py-3.5 rounded-sm flex items-center justify-center gap-2 uppercase tracking-widest font-bold text-xs mt-2"
              >
                {loading ? 'Sending Code...' : 'Get Reset Code'} <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </>
        )}

        {step === 2 && (
          <OTPInput 
            email={email} 
            purpose="forgot-password" 
            onVerifySuccess={() => {
              toast.success("OTP verified successfully. You can now reset your password.");
              setStep(3);
            }} 
            onBack={() => setStep(1)} 
          />
        )}

        {step === 3 && (
          <>
            {/* Step 3: Reset Password Header */}
            <div className="text-center flex flex-col items-center gap-1">
              <div className="p-3.5 bg-luxury-deep rounded-full border border-luxury-lightgrey mb-3">
                <KeyRound className="w-6 h-6 text-gold" />
              </div>
              <span className="font-playfair text-xl font-bold tracking-widest text-luxury-black">RESET PASSWORD</span>
              <p className="text-xs text-gray-500 mt-2 max-w-xs font-light">
                Choose a strong new password for your account.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1 relative">
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="bg-luxury-deep border border-luxury-lightgrey text-luxury-black placeholder-gray-400 text-xs pl-11 pr-4 py-3.5 rounded-sm focus:outline-none focus:border-gold"
                />
              </div>

              <div className="flex flex-col gap-1 relative">
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="bg-luxury-deep border border-luxury-lightgrey text-luxury-black placeholder-gray-400 text-xs pl-11 pr-4 py-3.5 rounded-sm focus:outline-none focus:border-gold"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-gold w-full py-3.5 rounded-sm flex items-center justify-center gap-2 uppercase tracking-widest font-bold text-xs mt-2 disabled:opacity-40"
              >
                {loading ? 'Resetting Password...' : 'Reset Password'} <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </>
        )}

        <div className="flex justify-between items-center text-xs border-t border-luxury-lightgrey pt-4 text-gray-400">
          <Link href="/login" className="hover:text-gold flex items-center gap-1 font-bold">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
          </Link>
          
          {step === 3 && (
            <button
              onClick={() => setStep(1)}
              className="text-gold font-bold focus:outline-none"
              type="button"
            >
              Change Email
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
