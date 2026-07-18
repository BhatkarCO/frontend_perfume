"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Star, ShieldCheck, Heart, AlertCircle } from 'lucide-react';
import api from '@/utils/api';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export default function ProductContent() {
  const params = useParams();
  const slug = params.slug;
  const router = useRouter();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const toast = useToast();

  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [activeImage, setActiveImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);

  // Review Form state
  const [rating, setRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Image zoom state
  const [zoomStyle, setZoomStyle] = useState({ display: 'none' });
  const zoomContainerRef = useRef(null);

  // Fetch product, reviews, similar items
  useEffect(() => {
    if (!slug) return;
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const prodRes = await api.get(`/products/${slug}`);
        const data = prodRes.data;
        setProduct(data);
        
        if (data.images && data.images.length > 0) {
          const primary = data.images.find(img => img.is_primary) || data.images[0];
          setActiveImage(primary.image_url);
        } else {
          setActiveImage(data.primary_image || data.image_url || '');
        }

        // Fetch reviews, similar products, and wishlist status concurrently
        const [revRes, simRes, wishRes] = await Promise.all([
          api.get(`/products/${data.id}/reviews`),
          api.get(`/products?category=${data.category_slug}&limit=4`),
          isAuthenticated ? api.get('/wishlist') : Promise.resolve({ data: [] })
        ]);

        setReviews(revRes.data);
        setSimilarProducts(simRes.data.products.filter(p => p.id !== data.id));

        if (isAuthenticated) {
          const isWish = wishRes.data.some(w => w.id === data.id);
          setWishlisted(isWish);
        }
      } catch (err) {
        console.error('Error fetching product details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [slug, isAuthenticated]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, qty);
    toast.success(`${qty}x ${product.name} added to bag.`);
  };

  const handleBuyNow = () => {
    if (!product) return;
    addToCart(product, qty);
    router.push('/checkout');
  };

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      toast.info('Please log in to save items in wishlist.');
      router.push('/login');
      return;
    }

    try {
      if (wishlisted) {
        await api.delete(`/wishlist/${product.id}`);
        setWishlisted(false);
        toast.success('Removed from wishlist.');
      } else {
        await api.post('/wishlist', { productId: product.id });
        setWishlisted(true);
        toast.success('Added to wishlist.');
      }
    } catch (err) {
      toast.error('Failed to update wishlist.');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.info('Please login to review.');
      return;
    }

    setSubmittingReview(true);
    try {
      const response = await api.post(`/products/${product.id}/reviews`, {
        rating,
        title: reviewTitle,
        comment: reviewComment,
      });

      toast.success(response.data.message);
      
      const revRes = await api.get(`/products/${product.id}/reviews`);
      setReviews(revRes.data);
      setProduct(prev => ({ ...prev, rating: response.data.rating }));

      setReviewTitle('');
      setReviewComment('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error submitting review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Magnifying Image Zoom Logic
  const handleMouseMove = (e) => {
    if (!zoomContainerRef.current) return;
    const { left, top, width, height } = zoomContainerRef.current.getBoundingClientRect();
    const x = ((e.pageX - left - window.scrollX) / width) * 100;
    const y = ((e.pageY - top - window.scrollY) / height) * 100;
    
    setZoomStyle({
      display: 'block',
      backgroundImage: `url(${activeImage})`,
      backgroundPosition: `${x}% ${y}%`,
      backgroundSize: '200%'
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ display: 'none' });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-40 text-gold text-xs uppercase tracking-widest font-semibold bg-luxury-deep">
        Loading product details...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center flex flex-col items-center gap-4 bg-luxury-deep">
        <AlertCircle className="w-12 h-12 text-red-500 stroke-1" />
        <h2 className="font-playfair text-xl text-luxury-black font-bold uppercase tracking-wider">Product Not Found</h2>
        <p className="text-gray-500 text-xs">The product you are looking for does not exist or has been removed.</p>
        <Link href="/catalog" className="btn-gold px-8 py-3 rounded text-xs uppercase tracking-widest font-bold">
          Back to Shop
        </Link>
      </div>
    );
  }

  const price = parseFloat(product.price);
  const salePrice = product.sale_price ? parseFloat(product.sale_price) : null;
  const isOutOfStock = product.stock_quantity === 0;

  // Fragrance Notes Parser
  const notes = product.fragrance_notes || { top: [], heart: [], base: [] };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen bg-luxury-deep">
      
      {/* Product Details Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        
        {/* Left: Images Layout */}
        <div className="flex flex-col gap-4">
          
          {/* Main Display Image */}
          <div
            ref={zoomContainerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="relative rounded-sm overflow-hidden img-zoom-container select-none bg-transparent"
          >
            <img
              src={activeImage || 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=600'}
              alt={product.name}
              className="w-full h-auto max-h-[75vh] object-contain rounded-sm"
            />

            {/* Magnifying Overlay */}
            <div
              style={zoomStyle}
              className="absolute inset-0 pointer-events-none border border-gold/45 rounded-sm hidden md:block"
            />
          </div>

          {/* Multiple Thumbnail Images */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto no-scrollbar">
              {product.images.map((img) => (
                <button
                  key={img.id || img._id}
                  onClick={() => setActiveImage(img.image_url)}
                  className={`relative w-20 h-24 shrink-0 rounded-sm overflow-hidden border transition-all ${
                    activeImage === img.image_url ? 'border-gold scale-95 shadow-sm' : 'border-luxury-lightgrey opacity-75 hover:opacity-100'
                  }`}
                  type="button"
                >
                  <Image
                    src={img.image_url}
                    alt={`${product.name} thumbnail view`}
                    fill
                    sizes="80px"
                    className="object-contain"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info Layout */}
        <div className="flex flex-col gap-6">
          <div>
            <div className="flex justify-between items-start gap-4">
              <span className="text-[10px] text-gold font-bold uppercase tracking-widest">{product.gender} • {product.category_name}</span>
              
              <button
                onClick={handleWishlistToggle}
                className={`focus:outline-none p-1.5 rounded-full border border-luxury-lightgrey hover:bg-gold/5 ${
                  wishlisted ? 'text-gold' : 'text-gray-400'
                }`}
                title={wishlisted ? 'Saved in Wishlist' : 'Add to Wishlist'}
                type="button"
              >
                <Heart className={`w-5 h-5 ${wishlisted ? 'fill-current' : ''}`} />
              </button>
            </div>
            
            <h1 className="font-playfair text-3xl font-bold tracking-wide text-luxury-black mt-2">
              {product.name}
            </h1>

            {/* Rating Stars Summary */}
            <div className="flex items-center gap-2 mt-3">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < Math.round(product.rating) ? 'text-gold fill-current' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-[10px] text-gray-400 font-bold uppercase mt-0.5 tracking-wider">({reviews.length} reviews)</span>
            </div>
          </div>

          {/* Price Tag */}
          <div className="flex items-baseline gap-3">
            {salePrice ? (
              <>
                <span className="text-xl font-bold text-luxury-black">₹{salePrice.toFixed(0)}</span>
                <span className="text-xs text-gray-400 line-through">MRP ₹{price.toFixed(0)}</span>
                <span className="text-[10px] text-green-600 font-bold bg-green-500/10 px-2 py-0.5 rounded">
                  SAVE ₹{(price - salePrice).toFixed(0)}
                </span>
              </>
            ) : (
              <span className="text-xl font-bold text-luxury-black">₹{price.toFixed(0)}</span>
            )}
          </div>

          <p className="text-xs text-gray-500 leading-relaxed font-light">
            {product.description}
          </p>

          {/* Stock Availability status bar */}
          <div>
            {isOutOfStock ? (
              <div className="flex items-center gap-2 text-red-500 font-bold text-[9px] uppercase tracking-widest">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> Out of stock
              </div>
            ) : product.stock_quantity < 10 ? (
              <div className="flex items-center gap-2 text-yellow-600 font-bold text-[9px] uppercase tracking-widest">
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 animate-pulse" /> Low Stock Alert! Only {product.stock_quantity} left
              </div>
            ) : (
              <div className="flex items-center gap-2 text-green-600 font-bold text-[9px] uppercase tracking-widest">
                <span className="w-2 h-2 rounded-full bg-green-500" /> In Stock &amp; Ready to Ship
              </div>
            )}
          </div>

          {/* Quantity Selector & CTAs */}
          {!isOutOfStock && (
            <div className="flex flex-col gap-4 border-y border-luxury-lightgrey py-6">
              <div className="flex items-center gap-4">
                <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Qty:</span>
                <div className="flex items-center border border-luxury-lightgrey rounded bg-white">
                  <button
                    onClick={() => setQty(prev => Math.max(1, prev - 1))}
                    className="px-3 py-1.5 text-gray-400 hover:text-gold font-bold text-sm"
                    type="button"
                  >
                    -
                  </button>
                  <span className="px-4 text-xs font-semibold text-luxury-black">{qty}</span>
                  <button
                    onClick={() => setQty(prev => Math.min(product.stock_quantity, prev + 1))}
                    className="px-3 py-1.5 text-gray-400 hover:text-gold font-bold text-sm"
                    type="button"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleAddToCart}
                  className="btn-gold flex-1 py-3.5 rounded-sm uppercase tracking-widest font-bold text-xs flex items-center justify-center gap-2"
                  type="button"
                >
                  <ShoppingBag className="w-4 h-4" /> Add to Bag
                </button>
                <button
                  onClick={handleBuyNow}
                  className="bg-transparent border border-luxury-black hover:bg-luxury-black hover:text-white text-luxury-black flex-1 py-3.5 rounded-sm uppercase tracking-widest font-bold text-xs transition-all duration-300"
                  type="button"
                >
                  Buy Now
                </button>
              </div>
            </div>
          )}

          {/* Fragrance Pyramid Map */}
          <div className="flex flex-col gap-4">
            <h3 className="font-playfair text-sm uppercase tracking-widest font-bold text-luxury-black">Fragrance Notes</h3>
            
            {/* Pyramid visual */}
            <div className="flex flex-col gap-3 max-w-sm">
              
              {/* TOP NOTES */}
              <div className="border border-luxury-lightgrey hover:border-gold/30 bg-white rounded-sm p-3 flex gap-3 items-center transition-all shadow-sm">
                <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center text-xs font-bold text-gold font-playfair shrink-0 border border-gold/25">T</div>
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-gold-dark">Top Notes</h4>
                  <p className="text-xs text-gray-500 capitalize">{notes.top ? notes.top.join(', ') : 'Bergamot, Grapefruit'}</p>
                </div>
              </div>

              {/* HEART NOTES */}
              <div className="border border-luxury-lightgrey hover:border-gold/30 bg-white rounded-sm p-3 flex gap-3 items-center transition-all shadow-sm">
                <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center text-xs font-bold text-gold font-playfair shrink-0 border border-gold/25">H</div>
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-gold-dark">Heart Notes</h4>
                  <p className="text-xs text-gray-500 capitalize">{notes.heart ? notes.heart.join(', ') : 'Rose, Jasmin, Pepper'}</p>
                </div>
              </div>

              {/* BASE NOTES */}
              <div className="border border-luxury-lightgrey hover:border-gold/30 bg-white rounded-sm p-3 flex gap-3 items-center transition-all shadow-sm">
                <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center text-xs font-bold text-gold font-playfair shrink-0 border border-gold/25">B</div>
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-gold-dark">Base Notes</h4>
                  <p className="text-xs text-gray-500 capitalize">{notes.base ? notes.base.join(', ') : 'Oud, Amber, Sandalwood'}</p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Reviews Section */}
      <section className="mt-20 border-t border-luxury-lightgrey pt-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Reviews Summary */}
          <div className="flex flex-col gap-6">
            <h2 className="text-xl font-playfair font-bold uppercase tracking-wider text-luxury-black">Customer Reviews</h2>
            <div className="flex items-center gap-4 bg-white border border-luxury-lightgrey p-6 rounded-sm shadow-sm">
              <span className="text-4xl font-playfair font-bold text-luxury-black">{parseFloat(product.rating).toFixed(1)}</span>
              <div>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.round(product.rating) ? 'text-gold fill-current' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-[10px] text-gray-400 mt-1 block uppercase tracking-wider">Based on {reviews.length} reviews</span>
              </div>
            </div>
          </div>

          {/* Reviews List & Submission */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            
            {/* Review Input Form */}
            {isAuthenticated ? (
              <form onSubmit={handleReviewSubmit} className="bg-white p-6 rounded-sm flex flex-col gap-4 border border-luxury-lightgrey shadow-sm">
                <h3 className="font-playfair text-[10px] uppercase tracking-widest text-luxury-black font-bold">Write A Review</h3>
                
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Your Rating:</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`w-4.5 h-4.5 ${
                            star <= rating ? 'text-gold fill-current' : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <input
                    type="text"
                    placeholder="Review Title (e.g. Excellent scent profile)"
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    required
                    className="bg-luxury-deep border border-luxury-lightgrey text-luxury-black placeholder-gray-400 text-xs px-4 py-2.5 rounded focus:outline-none focus:border-gold"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <textarea
                    placeholder="Share your fragrance experience..."
                    rows={4}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    required
                    className="bg-luxury-deep border border-luxury-lightgrey text-luxury-black placeholder-gray-400 text-xs px-4 py-2.5 rounded focus:outline-none focus:border-gold"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="btn-gold self-start px-8 py-2.5 text-xs rounded-sm uppercase font-bold tracking-widest"
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            ) : (
              <div className="p-6 bg-white border border-luxury-lightgrey rounded-sm text-center">
                <p className="text-xs text-gray-500 font-semibold">Please <Link href="/login" className="underline text-gold">login</Link> to review this product.</p>
              </div>
            )}

            {/* List Reviews */}
            <div className="flex flex-col gap-6">
              {reviews.length === 0 ? (
                <p className="text-xs text-gray-400 italic">No reviews written for this perfume yet. Be the first to share your experience!</p>
              ) : (
                reviews.map((rev) => (
                  <div key={rev.id} className="border-b border-luxury-lightgrey pb-6">
                    <div className="flex justify-between items-start gap-4 mb-2">
                      <div>
                        <h4 className="text-xs font-semibold text-luxury-black font-playfair">{rev.title}</h4>
                        <div className="flex gap-0.5 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < rev.rating ? 'text-gold fill-current' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-[9px] text-gray-400">{new Date(rev.created_at).toLocaleDateString('en-IN')}</span>
                    </div>
                    
                    <p className="text-xs text-gray-500 leading-relaxed font-light">{rev.comment}</p>
                    
                    <div className="flex items-center gap-1.5 mt-3 text-[9px] text-gold-dark font-bold uppercase tracking-wider">
                      <ShieldCheck className="w-3.5 h-3.5" /> Verified Purchase • By {rev.user_name}
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>
        </div>
      </section>

      {/* Similar Products Recommendation */}
      {similarProducts.length > 0 && (
        <section className="mt-24 border-t border-luxury-lightgrey pt-16">
          <h2 className="text-xl font-playfair font-bold uppercase tracking-wider text-luxury-black mb-8 text-center">
            You May Also Experience
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {similarProducts.map((prod) => {
              const price = parseFloat(prod.price);
              const salePrice = prod.sale_price ? parseFloat(prod.sale_price) : null;
              return (
                <Link
                  key={prod.id}
                  href={`/product/${prod.slug}`}
                  className="luxury-card flex flex-col h-full group"
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-luxury-darkgrey">
                    <Image
                      src={prod.primary_image || 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=400'}
                      alt={prod.name}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4 flex flex-col gap-2 flex-1 justify-between bg-white border-t border-luxury-deep">
                    <h4 className="text-xs font-bold text-luxury-black line-clamp-1 font-playfair">{prod.name}</h4>
                    <div className="flex justify-between items-center mt-1">
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-gold fill-current" />
                        <span className="text-[9px] text-gray-500 font-bold">{parseFloat(prod.rating).toFixed(1)}</span>
                      </div>
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
        </section>
      )}

    </div>
  );
}
