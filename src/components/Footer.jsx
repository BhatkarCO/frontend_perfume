"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Facebook, Instagram, Youtube } from 'lucide-react';
import api from '@/utils/api';
import { useToast } from '@/context/ToastContext';

export const Footer = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const pathname = usePathname();

  const handleLogoClick = (e) => {
    if (pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      await api.post('/general/newsletter', { email });
      toast.success('Subscribed successfully! Welcome to the Bhatkar & Co. inner circle.');
      setEmail('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Subscription failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-luxury-darkgrey border-t border-luxury-lightgrey pt-16 pb-8 text-gray-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-10">
        
        {/* About & Branding Column */}
        <div className="col-span-2 md:col-span-1 flex flex-col gap-4">
          <Link href="/" onClick={handleLogoClick} className="flex flex-col">
            <span className="font-playfair text-xl font-bold tracking-widest text-luxury-black">
              BHATKAR & CO.
            </span>
            <span className="text-[8px] tracking-[0.25em] text-gold font-semibold uppercase -mt-0.5">
              PERFUMES
            </span>
          </Link>
          
          <p className="text-xs leading-relaxed text-gray-500 font-light">
            Inspired by the timeless artistry of fragrance crafting, Bhatkar & Co. Perfumes creates premium, luxury perfumes, solid concentrates, and traditional oils that speak of elegance and royalty.
          </p>
          <div className="flex gap-4 mt-2">
            <a href="https://www.instagram.com/bhatkarco.official?igsh=MTBlbTh4cnhvZXlqdw%3D%3D" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-gold transition-colors">
              <Instagram className="w-4 h-4" />
            </a>
            <a href="https://www.facebook.com/Bhatkarcoperfumes" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-gold transition-colors">
              <Facebook className="w-4 h-4" />
            </a>
            <a href="https://www.youtube.com/@bhatkarcoperfumes" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-gold transition-colors">
              <Youtube className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Collections Column */}
        <div className="col-span-1">
          <h4 className="text-xs font-bold tracking-wider text-luxury-black uppercase mb-6">Collections</h4>
          <ul className="flex flex-col gap-3 text-xs">
            <li><Link href="/catalog?category=signature-collection" className="hover:text-gold transition-colors">Signature Collection</Link></li>
            <li><Link href="/catalog?category=fresh-collection" className="hover:text-gold transition-colors">Fresh Collection</Link></li>
            <li><Link href="/catalog?category=floral-collection" className="hover:text-gold transition-colors">Floral Collection</Link></li>
            <li><Link href="/catalog?category=woody-collection" className="hover:text-gold transition-colors">Woody Collection</Link></li>
            <li><Link href="/catalog?category=luxury-collection" className="hover:text-gold transition-colors">Luxury Collection</Link></li>
            <li><Link href="/catalog?category=gift-sets" className="hover:text-gold transition-colors">Gift Sets</Link></li>
          </ul>
        </div>

        {/* Information Column */}
        <div className="col-span-1">
          <h4 className="text-xs font-bold tracking-wider text-luxury-black uppercase mb-6">Information</h4>
          <ul className="flex flex-col gap-3 text-xs">
            <li><Link href="/contact" className="hover:text-gold transition-colors">Contact Support</Link></li>
            <li><Link href="/faqs" className="hover:text-gold transition-colors">Frequently Asked Questions</Link></li>
            <li><Link href="/policy/returns" className="hover:text-gold transition-colors">Return Policy</Link></li>
            <li><Link href="/policy/privacy" className="hover:text-gold transition-colors">Privacy Policy</Link></li>
            <li><Link href="/policy/terms" className="hover:text-gold transition-colors">Terms & Conditions</Link></li>
          </ul>
        </div>

        {/* Newsletter Subscription Column */}
        <div className="col-span-2 md:col-span-1 flex flex-col gap-4">
          <h4 className="text-xs font-bold tracking-wider text-luxury-black uppercase mb-2">Subscribe</h4>
          <p className="text-xs text-gray-500 leading-relaxed font-light">
            Join the Bhatkar & Co. inner circle for exclusive perfume releases, private sales, and 10% off your first purchase.
          </p>
          <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
            <input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-white border border-luxury-lightgrey text-luxury-black placeholder-gray-400 text-xs px-4 py-2.5 rounded focus:outline-none focus:border-gold"
            />
            <button
              type="submit"
              disabled={loading}
              className="btn-gold w-full py-2.5 text-xs rounded uppercase font-bold tracking-wider"
            >
              {loading ? 'Subscribing...' : 'Subscribe'}
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-luxury-lightgrey mt-12 pt-8 text-center text-[10px] text-gray-400 flex flex-col sm:flex-row justify-between items-center gap-4">
        <p>&copy; {new Date().getFullYear()} Bhatkar & Co. Perfumes. All rights reserved.</p>
        <p className="flex items-center gap-2">
          Designed with ❤️ for luxury fragrance connoisseurs.
        </p>
      </div>
    </footer>
  );
};
