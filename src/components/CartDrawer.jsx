"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { X, Trash2, ArrowRight, Bookmark, ShoppingCart, Tag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';

export const CartDrawer = () => {
  const router = useRouter();
  const {
    cartItems,
    savedItems,
    setSavedItems,
    cartOpen,
    setCartOpen,
    coupon,
    subtotal,
    discountAmount,
    shippingFee,
    grandTotal,
    updateQuantity,
    removeFromCart,
    saveForLater,
    moveToCart,
    applyCouponCode,
    removeCouponCode,
  } = useCart();

  const isOpen = cartOpen;
  const onClose = () => setCartOpen(false);

  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('cart'); // 'cart' or 'saved'

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess('');
    
    if (!couponCode.trim()) return;

    const result = await applyCouponCode(couponCode);
    if (result.success) {
      setCouponSuccess(`Coupon applied! Saved ₹${result.discount}`);
      setCouponCode('');
    } else {
      setCouponError(result.message);
    }
  };

  const handleCheckout = () => {
    onClose();
    router.push('/checkout');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40"
            onClick={onClose}
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="relative flex flex-col w-full max-w-md h-full bg-white shadow-xl z-50 border-l border-luxury-lightgrey"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-luxury-lightgrey">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-gold" />
                <h3 className="text-sm font-bold font-playfair tracking-widest text-luxury-black uppercase">Shopping Bag</h3>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-luxury-black focus:outline-none"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-luxury-lightgrey text-[10px] tracking-widest uppercase font-bold bg-luxury-deep">
              <button
                onClick={() => setActiveTab('cart')}
                className={`flex-1 py-3 text-center border-b-2 transition-all ${
                  activeTab === 'cart' ? 'border-gold text-gold bg-white' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Bag ({cartItems.reduce((sum, item) => sum + item.quantity, 0)})
              </button>
              <button
                onClick={() => setActiveTab('saved')}
                className={`flex-1 py-3 text-center border-b-2 transition-all ${
                  activeTab === 'saved' ? 'border-gold text-gold bg-white' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Saved ({savedItems.length})
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 bg-luxury-deep/40">
              {activeTab === 'cart' ? (
                cartItems.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 text-gray-400 py-12">
                    <ShoppingCart className="w-12 h-12 stroke-1 text-gold/40" />
                    <p className="font-playfair text-base text-luxury-black font-bold uppercase tracking-wider">Your bag is empty</p>
                    <p className="text-xs max-w-xs font-light leading-relaxed">Fill it with Bhatkar & Co.'s luxurious scents to experience true craftsmanship.</p>
                    <button onClick={() => { onClose(); router.push('/catalog'); }} className="btn-gold px-6 py-2.5 text-xs rounded mt-2">Shop Now</button>
                  </div>
                ) : (
                  cartItems.map((item) => {
                    const price = item.sale_price ? parseFloat(item.sale_price) : parseFloat(item.price);
                    return (
                      <div key={item.id} className="flex gap-4 border-b border-luxury-lightgrey pb-4">
                        <div className="relative w-16 h-20 shrink-0 bg-white border border-luxury-lightgrey rounded overflow-hidden">
                          <Image
                            src={item.primary_image || item.image_url || 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=100'}
                            alt={item.name}
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start">
                              <h4 className="text-xs font-bold text-luxury-black line-clamp-1 font-playfair tracking-wide">{item.name}</h4>
                              <span className="text-xs font-bold text-luxury-black">₹{(price * item.quantity).toFixed(0)}</span>
                            </div>
                            <p className="text-[10px] text-gray-400 capitalize">{item.gender} • {item.category_name}</p>
                          </div>
                          
                          <div className="flex justify-between items-center mt-2">
                            {/* Quantity Selector */}
                            <div className="flex items-center border border-luxury-lightgrey rounded bg-white">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="px-2 py-0.5 text-gray-400 hover:text-gold text-sm"
                              >
                                -
                              </button>
                              <span className="px-2 text-xs font-semibold text-luxury-black">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="px-2 py-0.5 text-gray-400 hover:text-gold text-sm"
                              >
                                +
                              </button>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => saveForLater(item)}
                                className="text-gray-400 hover:text-gold focus:outline-none"
                                title="Save for Later"
                              >
                                <Bookmark className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => removeFromCart(item.id)}
                                className="text-gray-400 hover:text-red-500 focus:outline-none"
                                title="Remove"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )
              ) : (
                savedItems.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 text-gray-400 py-12">
                    <Bookmark className="w-12 h-12 stroke-1 text-gold/40" />
                    <p className="font-playfair text-base text-luxury-black font-bold uppercase tracking-wider">No saved items</p>
                    <p className="text-xs font-light">Save items here to buy them later.</p>
                  </div>
                ) : (
                  savedItems.map((item) => {
                    const price = item.sale_price ? parseFloat(item.sale_price) : parseFloat(item.price);
                    return (
                      <div key={item.id} className="flex gap-4 border-b border-luxury-lightgrey pb-4">
                        <div className="relative w-16 h-20 shrink-0 bg-white border border-luxury-lightgrey rounded overflow-hidden">
                          <Image
                            src={item.primary_image || item.image_url || 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=100'}
                            alt={item.name}
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <h4 className="text-xs font-bold text-luxury-black font-playfair">{item.name}</h4>
                            <p className="text-[10px] text-gray-400 capitalize">{item.gender} • ₹{price.toFixed(0)}</p>
                          </div>
                          
                          <div className="flex justify-between items-center mt-2">
                            <button
                              onClick={() => moveToCart(item)}
                              className="btn-gold px-3 py-1.5 text-[9px] rounded uppercase font-bold tracking-wider"
                            >
                              Move to Bag
                            </button>
                            <button
                              onClick={() => setSavedItems((prev) => prev.filter((i) => i.id !== item.id))}
                              className="text-gray-400 hover:text-red-500"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )
              )}
            </div>

            {/* Footer Summary */}
            {activeTab === 'cart' && cartItems.length > 0 && (
              <div className="p-6 border-t border-luxury-lightgrey bg-white flex flex-col gap-4">
                
                {/* Coupon Code Section */}
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="COUPON CODE"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="bg-luxury-deep border border-luxury-lightgrey text-luxury-black placeholder-gray-400 text-xs pl-9 pr-4 py-2.5 rounded w-full focus:outline-none focus:border-gold uppercase tracking-widest"
                    />
                  </div>
                  <button type="submit" className="btn-gold px-4 py-2.5 text-xs rounded">
                    Apply
                  </button>
                </form>

                {couponError && <p className="text-[10px] text-red-500 font-semibold">{couponError}</p>}
                {couponSuccess && <p className="text-[10px] text-green-500 font-semibold">{couponSuccess}</p>}

                {coupon && (
                  <div className="flex items-center justify-between text-xs bg-gold/5 border border-gold/30 px-3 py-1.5 rounded">
                    <span className="text-gold font-bold uppercase tracking-wider">Applied: {coupon.code}</span>
                    <button onClick={removeCouponCode} className="text-red-500 hover:text-red-400 font-bold uppercase text-[10px]">
                      Remove
                    </button>
                  </div>
                )}

                {/* Pricing Summary */}
                <div className="flex flex-col gap-2 text-xs text-gray-500">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="text-luxury-black font-semibold">₹{subtotal.toFixed(0)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>- ₹{discountAmount.toFixed(0)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="text-luxury-black font-semibold">
                      {shippingFee > 0 ? `₹${shippingFee.toFixed(0)}` : <span className="text-green-600 font-bold uppercase text-[10px]">Free</span>}
                    </span>
                  </div>
                  
                  {shippingFee > 0 && (
                    <p className="text-[9px] text-gold-dark -mt-1 italic">Add ₹{(1500 - (subtotal - discountAmount)).toFixed(0)} more for Free Shipping</p>
                  )}

                  <hr className="border-luxury-lightgrey my-1" />
                  <div className="flex justify-between font-bold text-luxury-black text-sm">
                    <span className="font-playfair tracking-wide uppercase">Total</span>
                    <span className="font-sans">₹{grandTotal.toFixed(0)}</span>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={handleCheckout}
                  className="btn-gold w-full py-3 rounded flex items-center justify-center gap-2 uppercase tracking-widest font-bold text-[10px]"
                >
                  Proceed to Checkout <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
