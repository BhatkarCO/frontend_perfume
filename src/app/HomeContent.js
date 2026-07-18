"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowRight, ShoppingBag, ShieldCheck, Heart, Sparkles, Star } from 'lucide-react';
import api from '@/utils/api';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { motion } from 'framer-motion';


export default function HomeContent() {
  const router = useRouter();
  const { addToCart } = useCart();
  const toast = useToast();
  const [bestSellers, setBestSellers] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeProducts = async () => {
      try {
        // Fetch Best Sellers and New Arrivals concurrently
        const [bsRes, naRes] = await Promise.all([
          api.get('/products?sortBy=best-selling&limit=4'),
          api.get('/products?sortBy=latest&limit=4')
        ]);
        
        setBestSellers(bsRes.data.products);
        setNewArrivals(naRes.data.products);
      } catch (err) {
        console.error('Error fetching home page products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeProducts();
  }, []);

  const handleFastAdd = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    toast.success(`${product.name} added to bag.`);
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-100px' },
    transition: { duration: 0.6 }
  };

  return (
    <div className="flex flex-col min-h-screen bg-luxury-deep">
      
      {/* 1. HERO BANNER */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
        {/* Background Image Overlay */}
        <Image
          src="/hero-bg.jpg"
          alt="Bhatkar & Co. Luxury Perfumes Background"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        {/* Dark elegant overlay with backdrop blur covering the entire background */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2.5px]" /> 

        {/* Hero Content */}
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center gap-6 z-10">
          <motion.span
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-xs uppercase tracking-[0.45em] text-gold font-bold"
          >
            Bhatkar &amp; Co.
          </motion.span>
          
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="font-playfair text-4xl sm:text-6xl lg:text-7xl font-bold tracking-wide text-white leading-tight"
          >
            The Artistry of Scents
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-xs sm:text-sm text-gray-200 max-w-2xl leading-relaxed font-light uppercase tracking-wider"
          >
            Indulge in our exquisite range of luxury Eau de Parfums, solid wax concentrates, and traditional pure attars. Long-lasting, cruelty-free, and handcrafted for distinction.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 mt-2"
          >
            <button
              onClick={() => router.push('/catalog')}
              className="btn-gold px-8 py-3.5 text-xs font-bold uppercase tracking-widest rounded-sm flex items-center gap-2"
            >
              Explore Collections <ArrowRight className="w-4 h-4" />
            </button>
            <Link
              href="/catalog?sortBy=best-selling"
              className="border border-white text-white hover:bg-white hover:text-luxury-black px-8 py-3.5 text-xs font-bold uppercase tracking-widest rounded-sm transition-all"
            >
              Shop Best Sellers
            </Link>
          </motion.div>
        </div>
      </section>

      {/* 2. FEATURED COLLECTIONS GRID */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center mb-12 flex flex-col items-center">
            <h2 className="text-2xl sm:text-3xl font-bold font-playfair tracking-wider mb-3 uppercase">Featured Collections</h2>
            <div className="w-16 h-0.5 bg-gold" />
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'Signature Collection', slug: 'signature-collection', image: 'Signature_Bottle.png', tagline: 'Exclusive & Majestic' },
              { name: 'Fresh Collection', slug: 'fresh-collection', image: 'Vibe2.png', tagline: 'Light & Refreshing' },
              { name: 'Floral Collection', slug: 'floral-collection', image: 'Bold2.png', tagline: 'Delicate & Sweet' },
              { name: 'Woody Collection', slug: 'woody-collection', image: 'Deep2.png', tagline: 'Warm & Earthy' }
            ].map((col, idx) => (
              <motion.div
                key={col.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                onClick={() => router.push(`/catalog?category=${col.slug}`)}
                className="group relative h-80 rounded-sm overflow-hidden cursor-pointer shadow-sm border border-luxury-lightgrey hover:border-gold transition-all"
              >
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                  style={{ backgroundImage: `url('${col.image}')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                
                <div className="absolute bottom-6 left-6 right-6 flex flex-col gap-1">
                  <span className="text-[9px] tracking-widest text-gold font-bold uppercase">{col.tagline}</span>
                  <h3 className="font-playfair text-lg text-white font-bold tracking-wide group-hover:text-gold transition-colors">{col.name}</h3>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. BEST SELLERS */}
      <section className="py-20 bg-luxury-deep border-y border-luxury-lightgrey">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center mb-12 flex flex-col items-center">
            <h2 className="text-2xl sm:text-3xl font-bold font-playfair tracking-wider mb-3 uppercase">Our Best Sellers</h2>
            <div className="w-16 h-0.5 bg-gold" />
          </motion.div>

          {loading ? (
            <div className="flex justify-center items-center py-20 text-gold text-xs uppercase tracking-widest font-semibold">Loading perfumes...</div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {bestSellers.map((prod) => {
                const price = parseFloat(prod.price);
                const salePrice = prod.sale_price ? parseFloat(prod.sale_price) : null;
                return (
                  <Link
                    key={prod.id}
                    href={`/product/${prod.slug}`}
                    className="luxury-card flex flex-col h-full group"
                  >
                    {/* Image */}
                    <div className="relative aspect-[3/4] overflow-hidden bg-luxury-darkgrey">
                      <Image
                        src={prod.primary_image || 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=400'}
                        alt={prod.name}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {prod.sale_price && (
                        <span className="absolute top-3 left-3 bg-red-500 text-white text-[8px] font-bold px-2 py-1 uppercase tracking-wider">
                          Sale
                        </span>
                      )}
                      
                      {/* Fast Add CTA Overlay */}
                      {prod.stock_quantity > 0 && (
                        <button
                          onClick={(e) => handleFastAdd(e, prod)}
                          className="absolute bottom-3 left-3 right-3 bg-luxury-black text-white hover:bg-gold hover:text-luxury-black text-[9px] font-bold py-2.5 rounded-sm uppercase tracking-widest transition-all duration-300 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1.5"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" /> Add to Bag
                        </button>
                      )}
                    </div>

                    {/* Meta */}
                    <div className="p-4 flex flex-col gap-2 flex-1 justify-between bg-white border-t border-luxury-deep">
                      <div>
                        <span className="text-[8px] text-gray-400 uppercase tracking-widest font-bold block mb-1">
                          {prod.gender} • {prod.category_name}
                        </span>
                        <h3 className="text-xs font-bold text-luxury-black line-clamp-1 font-playfair tracking-wide group-hover:text-gold transition-colors">
                          {prod.name}
                        </h3>
                      </div>
                      
                      <div className="flex items-center justify-between mt-1">
                        {/* Rating */}
                        <div className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 text-gold fill-current" />
                          <span className="text-[9px] text-gray-500 font-bold">{parseFloat(prod.rating).toFixed(1)}</span>
                        </div>

                        {/* Price */}
                        <div className="flex items-center gap-2">
                          {salePrice ? (
                            <>
                              <span className="text-xs text-gray-400 line-through">₹{price.toFixed(0)}</span>
                              <span className="text-xs font-bold text-gold-dark">₹{salePrice.toFixed(0)}</span>
                            </>
                          ) : (
                            <span className="text-xs font-bold text-luxury-black">₹{price.toFixed(0)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* 4. BRAND STORY */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative aspect-square max-w-sm mx-auto w-full rounded-sm overflow-hidden border border-luxury-lightgrey shadow-md"
          >
            <Image
              src="/philosophy-plan.png"
              alt="Bhatkar &amp; Co. Aura Perfume - Natural Freshness"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover object-center"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="flex flex-col gap-6"
          >
            <span className="text-xs uppercase tracking-[0.35em] text-gold font-bold">Our Philosophy</span>
            <h2 className="text-2xl sm:text-3xl font-playfair font-bold uppercase tracking-wider">The Bhatkar &amp; Co. Legacy</h2>
            <p className="text-gray-500 leading-relaxed text-xs font-light">
              Fragrance is not just a cosmetic; it is an invisible armor, a silent language, and a sensory memory that lasts forever. At Bhatkar &amp; Co. Perfumes, we set out to demystify luxury perfumery.
            </p>
            <p className="text-gray-500 leading-relaxed text-xs font-light">
              We believe every fragrance should capture the beauty and freshness of nature. Inspired by blooming flowers, lush greenery, and the gentle warmth of sunlight, our perfumes are thoughtfully crafted to provide a refreshing, long-lasting scent that feels natural and elegant.
            </p>
            <div className="flex gap-8 mt-2">
              <div>
                <span className="block text-xl font-bold font-playfair text-luxury-black">24h+</span>
                <span className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">Longevity</span>
              </div>
              <div>
                <span className="block text-xl font-bold font-playfair text-luxury-black">100%</span>
                <span className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">Cruelty-Free</span>
              </div>
              <div>
                <span className="block text-xl font-bold font-playfair text-luxury-black">Handmade</span>
                <span className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">In India</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 5. WHY CHOOSE US BENEFITS */}
      <section className="py-16 bg-luxury-darkgrey border-t border-luxury-lightgrey">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { title: 'Premium Oils', desc: 'Sourced from the finest global distilleries for ultimate purity.', icon: Sparkles },
            { title: 'Long-Lasting Aura', desc: 'High oil concentration ensures deep sillage and longevity.', icon: Heart },
            { title: 'Cruelty-Free & Safe', desc: 'Crafted without animal testing or harsh skin-irritants.', icon: ShieldCheck },
            { title: 'Free Shipping', desc: 'Complimentary shipping across India on orders above ₹1500.', icon: ShoppingBag }
          ].map((benefit, idx) => {
            const Icon = benefit.icon;
            return (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="flex flex-col items-center text-center p-6 bg-white border border-luxury-lightgrey rounded-sm"
              >
                <div className="p-3 bg-luxury-deep rounded-full mb-4 border border-luxury-lightgrey">
                  <Icon className="w-5 h-5 text-gold" />
                </div>
                <h3 className="font-playfair text-xs uppercase tracking-wider font-bold text-luxury-black mb-2">{benefit.title}</h3>
                <p className="text-[11px] text-gray-400 leading-relaxed max-w-xs font-light">{benefit.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* 6. CUSTOMER TESTIMONIALS */}
      <section className="py-20 bg-white border-t border-luxury-lightgrey">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center gap-6">
          <motion.div {...fadeInUp} className="flex flex-col items-center">
            <h2 className="text-2xl sm:text-3xl font-bold font-playfair tracking-wider mb-3 uppercase">Connoisseur Feedback</h2>
            <div className="w-16 h-0.5 bg-gold mb-8" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 text-gold fill-current" />)}
            </div>
            <blockquote className="font-playfair text-xl sm:text-2xl text-gray-700 italic leading-relaxed max-w-2xl font-light">
              &ldquo;Oud Royale is an absolute masterpiece. I wore it to a wedding and received no less than ten compliments. It lasts all day and leaves a lingering warmth.&rdquo;
            </blockquote>
            <div>
              <cite className="not-italic font-bold text-luxury-black uppercase tracking-wider text-[10px] block">Vikramaditya S.</cite>
              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Verified Bhatkar &amp; Co. Customer</span>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
