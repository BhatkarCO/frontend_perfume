"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Compass, Heart, ShoppingBag, User } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export const MobileBottomBar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { cartItems, setCartOpen } = useCart();
  
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const isActive = (path) => {
    return pathname === path;
  };

  const isWishlistActive = pathname === '/dashboard' && searchParams.get('tab') === 'wishlist';

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-luxury-charcoal/95 backdrop-blur-md border-t border-gold/15 h-16 flex items-center justify-around px-4 shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
      
      {/* Shop Link */}
      <button
        onClick={() => router.push('/catalog')}
        className={`flex flex-col items-center justify-center gap-1 focus:outline-none ${
          isActive('/catalog') ? 'text-gold' : 'text-gray-400'
        }`}
      >
        <Compass className="w-5.5 h-5.5" />
        <span className="text-[10px] tracking-wider uppercase font-semibold">Shop</span>
      </button>

      {/* Wishlist Link */}
      <button
        onClick={() => router.push('/dashboard?tab=wishlist')}
        className={`flex flex-col items-center justify-center gap-1 focus:outline-none ${
          isWishlistActive ? 'text-gold' : 'text-gray-400'
        }`}
      >
        <Heart className="w-5.5 h-5.5" />
        <span className="text-[10px] tracking-wider uppercase font-semibold">Wishlist</span>
      </button>

      {/* Shopping Bag Trigger */}
      <button
        onClick={() => setCartOpen(true)}
        className="flex flex-col items-center justify-center gap-1 relative focus:outline-none text-gray-400"
      >
        <div className="relative">
          <ShoppingBag className="w-5.5 h-5.5 text-gold-gradient" />
          {cartCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-4 h-4 px-1 text-[8px] font-bold text-luxury-deep bg-gold rounded-full">
              {cartCount}
            </span>
          )}
        </div>
        <span className="text-[10px] tracking-wider uppercase font-semibold">Bag</span>
      </button>

      {/* Account Profile Link */}
      <button
        onClick={() => router.push('/dashboard')}
        className={`flex flex-col items-center justify-center gap-1 focus:outline-none ${
          isActive('/dashboard') && !isWishlistActive ? 'text-gold' : 'text-gray-400'
        }`}
      >
        <User className="w-5.5 h-5.5" />
        <span className="text-[10px] tracking-wider uppercase font-semibold">Account</span>
      </button>

    </div>
  );
};
