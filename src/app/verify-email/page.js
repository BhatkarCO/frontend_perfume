"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { KeyRound } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import OTPInput from '@/components/OTPInput';

export default function OTPVerify() {
  const toast = useToast();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedEmail = localStorage.getItem('registering_email');
    if (!storedEmail) {
      toast.info('Please register first.');
      router.push('/register');
    } else {
      setEmail(storedEmail);
      setLoading(false);
    }
  }, [router, toast]);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-luxury-deep">
        <div className="text-gold tracking-widest font-bold uppercase text-xs">Loading...</div>
      </div>
    );
  }

  const handleVerifySuccess = () => {
    toast.success('Email verified successfully! Welcome to Bhatkar & Co. Perfumes.');
    localStorage.removeItem('registering_email'); // Clear registering email
    router.push('/dashboard');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 bg-luxury-deep">
      <div className="w-full max-w-md p-8 bg-white rounded-sm border border-luxury-lightgrey shadow-md flex flex-col gap-6">
        
        {/* Header Icon */}
        <div className="flex justify-center mb-2">
          <div className="p-3.5 bg-luxury-deep rounded-full border border-luxury-lightgrey">
            <KeyRound className="w-6 h-6 text-gold" />
          </div>
        </div>

        <OTPInput 
          email={email} 
          purpose="register" 
          onVerifySuccess={handleVerifySuccess} 
          onBack={() => router.push('/register')} 
        />

      </div>
    </div>
  );
}
