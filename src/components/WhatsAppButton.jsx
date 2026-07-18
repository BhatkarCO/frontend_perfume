"use client";

import React from 'react';
import { MessageCircle } from 'lucide-react';

export const WhatsAppButton = () => {
  const phoneNumber = '+917758088155'; // Support number
  const message = 'Hello Bhatkar & Co. Perfumes, I am interested in your luxury perfume collection and need help selecting a fragrance.';

  const handleWhatsAppRedirect = () => {
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber.replace(/[^0-9]/g, '')}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <button
      onClick={handleWhatsAppRedirect}
      className="fixed bottom-36 md:bottom-22 right-6 z-40 bg-luxury-black border border-gold/40 text-gold hover:bg-[#25D366] hover:text-white hover:border-[#25D366] p-3.5 rounded-full shadow-[0_4px_15px_rgba(0,0,0,0.2)] hover:shadow-[0_4px_15px_rgba(37,211,102,0.4)] transition-all duration-300 hover:scale-110 active:scale-95 group focus:outline-none"
      title="Chat with Bhatkar & Co. Perfumes Support"
      aria-label="WhatsApp Support Chat"
    >
      <MessageCircle className="w-6 h-6 fill-current" />
      <span className="absolute right-full mr-3 bg-luxury-charcoal border border-gold/20 text-gold text-xs px-3 py-1.5 rounded shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none hidden md:inline-block">
        Chat with Us
      </span>
    </button>
  );
};
