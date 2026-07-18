"use client";

import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw, ArrowRight, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export default function OTPInput({ email, purpose, onVerifySuccess, onBack }) {
  const { verifyEmailOTP, verifyForgotPasswordOTP, resendOTP } = useAuth();
  const toast = useToast();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(60);
  const inputRefs = useRef([]);

  // Auto focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  // Countdown timer
  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];
    // Keep only the last character if typed
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // On backspace, clear current and move focus to previous input
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
        inputRefs.current[index - 1].focus();
      } else {
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (!/^\d{6}$/.test(pastedData)) {
      toast.error("Please paste a 6-digit numeric OTP code.");
      return;
    }

    const digits = pastedData.split("");
    setOtp(digits);
    // Focus the last input box after paste
    inputRefs.current[5].focus();
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const otpStr = otp.join("");
    if (otpStr.length < 6) {
      toast.error("Please enter the complete 6-digit OTP code.");
      return;
    }

    setLoading(true);
    let result;
    if (purpose === "register") {
      result = await verifyEmailOTP(email, otpStr);
    } else {
      result = await verifyForgotPasswordOTP(email, otpStr);
    }
    setLoading(false);

    if (result.success) {
      onVerifySuccess();
    } else {
      toast.error(result.message);
    }
  };

  const handleResend = async () => {
    setResending(true);
    const result = await resendOTP(email, purpose);
    setResending(false);

    if (result.success) {
      toast.success("A new verification code has been sent to your email.");
      setTimer(60);
      setOtp(["", "", "", "", "", ""]);
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Back button */}
      {onBack && (
        <button
          onClick={onBack}
          className="self-start text-[10px] text-gray-400 hover:text-gold uppercase tracking-wider font-bold flex items-center gap-1.5 focus:outline-none"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </button>
      )}

      {/* Header */}
      <div className="text-center flex flex-col items-center gap-1">
        <span className="font-playfair text-xl font-bold tracking-widest text-luxury-black">
          ENTER VERIFICATION CODE
        </span>
        <p className="text-xs text-gray-500 mt-2 max-w-xs leading-relaxed font-light">
          We sent a secure 6-digit OTP to <span className="text-gold font-bold">{email}</span>.
        </p>
      </div>

      {/* Verification Form */}
      <form onSubmit={handleVerify} className="flex flex-col gap-6">
        <div className="flex justify-between items-center gap-2" onPaste={handlePaste}>
          {otp.map((digit, index) => (
            <input
              key={index}
              type="text"
              inputMode="numeric"
              maxLength={1}
              ref={(el) => (inputRefs.current[index] = el)}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-12 h-14 bg-luxury-deep border border-luxury-lightgrey text-gold font-bold text-center text-xl rounded-sm focus:outline-none focus:border-gold transition-all duration-200"
              required
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={loading || otp.join("").length < 6}
          className="btn-gold w-full py-3.5 rounded-sm flex items-center justify-center gap-2 uppercase tracking-widest font-bold text-xs disabled:opacity-40"
        >
          {loading ? 'Verifying OTP...' : 'Verify OTP'} <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      {/* Resend Actions */}
      <div className="flex flex-col gap-4 items-center">
        <div className="flex items-center text-xs text-gray-500">
          <span>Didn't receive code?</span>
          {timer > 0 ? (
            <span className="text-gray-400 ml-1.5 font-medium">
              Resend in {timer}s
            </span>
          ) : (
            <button
              onClick={handleResend}
              disabled={resending}
              className="text-gold hover:text-gold-dark ml-1.5 font-bold flex items-center gap-1 focus:outline-none"
              type="button"
            >
              <RefreshCw className={`w-3 h-3 ${resending ? 'animate-spin' : ''}`} /> Resend OTP
            </button>
          )}
        </div>

        {/* Local sandbox log warning */}
        <div className="text-[10px] bg-luxury-deep border border-luxury-lightgrey p-3 rounded-sm text-gray-500 leading-relaxed font-light w-full">
          <p className="font-bold uppercase tracking-wider mb-1 text-luxury-black font-playfair">Testing Notice:</p>
          <p>Since the email service is running locally, standard emails are printed to the **Server Terminal Console** logs. Open your backend console and check the log to copy the 6-digit OTP code.</p>
        </div>
      </div>
    </div>
  );
}
