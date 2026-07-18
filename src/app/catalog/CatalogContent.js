"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Star, ShoppingBag, X, SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '@/utils/api';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';

export default function CatalogContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { addToCart } = useCart();
  const toast = useToast();

  // Filters State
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Read query params initially
  const categoryParam = searchParams.get('category') || '';
  const searchParam = searchParams.get('search') || '';
  const sortByParam = searchParams.get('sortBy') || 'latest';
  const pageParam = parseInt(searchParams.get('page') || '1');

  // Local filter states
  const [gender, setGender] = useState('');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 5000 });
  const [selectedRating, setSelectedRating] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, page: 1 });

  // Fetch categories
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await api.get('/categories');
        setCategories(res.data);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCats();
  }, []);

  // Fetch products when filters or url parameters change
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (searchParam) queryParams.append('search', searchParam);
        if (categoryParam) queryParams.append('category', categoryParam);
        if (gender) queryParams.append('gender', gender);
        if (priceRange.min > 0) queryParams.append('priceMin', priceRange.min);
        if (priceRange.max < 5000) queryParams.append('priceMax', priceRange.max);
        if (selectedRating) queryParams.append('rating', selectedRating);
        if (inStockOnly) queryParams.append('availability', 'in-stock');
        queryParams.append('sortBy', sortByParam);
        queryParams.append('page', pageParam);
        queryParams.append('limit', 8); // 8 items per page

        const res = await api.get(`/products?${queryParams.toString()}`);
        setProducts(res.data.products);
        setPagination(res.data.pagination);
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryParam, searchParam, gender, priceRange, selectedRating, inStockOnly, sortByParam, pageParam]);

  const updateSearchParams = (key, value) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', '1');
    if (value === '') {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(pathname + '?' + params.toString(), { scroll: false });
  };

  const handleFilterChange = (key, value) => {
    if (key === 'category') {
      updateSearchParams('category', value);
    } else if (key === 'gender') {
      setGender(value);
    } else if (key === 'sortBy') {
      updateSearchParams('sortBy', value);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(pathname + '?' + params.toString());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFastAdd = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    toast.success(`${product.name} added to bag.`);
  };

  const clearFilters = () => {
    setGender('');
    setPriceRange({ min: 0, max: 5000 });
    setSelectedRating('');
    setInStockOnly(false);
    router.push(pathname); // Reset all parameters
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen bg-luxury-deep">
      
      {/* Search Header Banner */}
      {searchParam && (
        <div className="mb-8 p-6 bg-white border border-luxury-lightgrey rounded-sm text-center">
          <h2 className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1">Search Results For</h2>
          <p className="font-playfair text-xl font-bold text-luxury-black">&ldquo;{searchParam}&rdquo;</p>
        </div>
      )}

      {/* Grid Layout & Filters Control Bar */}
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* DESKTOP FILTER SIDEBAR */}
        <aside className="hidden md:block w-64 shrink-0 flex flex-col gap-6 bg-white p-5 border border-luxury-lightgrey rounded-sm">
          <div className="flex items-center justify-between border-b border-luxury-lightgrey pb-4">
            <h3 className="font-playfair text-sm uppercase tracking-widest font-bold text-luxury-black">Filters</h3>
            <button onClick={clearFilters} className="text-[9px] text-gray-400 hover:text-gold uppercase tracking-wider font-bold">
              Clear All
            </button>
          </div>

          {/* Category Filter */}
          <div className="border-b border-luxury-lightgrey pb-5 flex flex-col gap-3">
            <h4 className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Category</h4>
            <div className="flex flex-col gap-2 text-xs">
              <button
                onClick={() => handleFilterChange('category', '')}
                className={`text-left hover:text-gold uppercase tracking-wider ${!categoryParam ? 'text-gold font-bold' : 'text-gray-500'}`}
              >
                All Perfumes
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleFilterChange('category', cat.slug)}
                  className={`text-left hover:text-gold capitalize ${categoryParam === cat.slug ? 'text-gold font-bold' : 'text-gray-500'}`}
                >
                  {cat.name} ({cat.product_count})
                </button>
              ))}
            </div>
          </div>

          {/* Gender Filter */}
          <div className="border-b border-luxury-lightgrey pb-5 flex flex-col gap-3">
            <h4 className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Gender</h4>
            <div className="flex flex-col gap-2 text-xs">
              {['', 'Men', 'Women', 'Unisex'].map((g) => (
                <button
                  key={g}
                  onClick={() => handleFilterChange('gender', g)}
                  className={`text-left hover:text-gold uppercase tracking-wider ${gender === g ? 'text-gold font-bold' : 'text-gray-500'}`}
                >
                  {g === '' ? 'All Genders' : g}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="border-b border-luxury-lightgrey pb-5 flex flex-col gap-3">
            <h4 className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Price</h4>
            <div className="flex flex-col gap-2 text-xs">
              <button
                onClick={() => setPriceRange({ min: 0, max: 5000 })}
                className={`text-left hover:text-gold uppercase tracking-wider ${priceRange.min === 0 && priceRange.max === 5000 ? 'text-gold font-bold' : 'text-gray-500'}`}
              >
                Any Price
              </button>
              <button
                onClick={() => setPriceRange({ min: 0, max: 1000 })}
                className={`text-left hover:text-gold uppercase tracking-wider ${priceRange.max === 1000 ? 'text-gold font-bold' : 'text-gray-500'}`}
              >
                Under ₹1,000
              </button>
              <button
                onClick={() => setPriceRange({ min: 1000, max: 2500 })}
                className={`text-left hover:text-gold uppercase tracking-wider ${priceRange.min === 1000 && priceRange.max === 2500 ? 'text-gold font-bold' : 'text-gray-500'}`}
              >
                ₹1,000 - ₹2,500
              </button>
              <button
                onClick={() => setPriceRange({ min: 2500, max: 5000 })}
                className={`text-left hover:text-gold uppercase tracking-wider ${priceRange.min === 2500 ? 'text-gold font-bold' : 'text-gray-500'}`}
              >
                ₹2,500 &amp; Above
              </button>
            </div>
          </div>

          {/* Rating Filter */}
          <div className="border-b border-luxury-lightgrey pb-5 flex flex-col gap-3">
            <h4 className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Rating</h4>
            <div className="flex flex-col gap-2 text-xs">
              {['', '4.5', '4.0', '3.0'].map((r) => (
                <button
                  key={r}
                  onClick={() => setSelectedRating(r)}
                  className={`text-left flex items-center gap-1.5 hover:text-gold ${selectedRating === r ? 'text-gold font-bold' : 'text-gray-500'}`}
                >
                  {r === '' ? 'All Ratings' : (
                    <>
                      <Star className="w-3.5 h-3.5 fill-current text-gold" />
                      <span>{r} &amp; Above</span>
                    </>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Availability Toggle */}
          <div className="flex items-center justify-between pt-1">
            <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 cursor-pointer" htmlFor="stockToggle">
              In Stock Only
            </label>
            <input
              type="checkbox"
              id="stockToggle"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="accent-gold cursor-pointer"
            />
          </div>
        </aside>

        {/* MAIN PRODUCT CATALOG CONTAINER */}
        <div className="flex-1 flex flex-col gap-6">
          
          {/* SORTING & MOBILE FILTERS BAR */}
          <div className="flex items-center justify-between bg-white p-4 border border-luxury-lightgrey rounded-sm">
            {/* Mobile Filter Button */}
            <button
              onClick={() => setShowMobileFilters(true)}
              className="md:hidden flex items-center gap-2 text-xs uppercase tracking-wider text-luxury-black font-bold focus:outline-none"
            >
              <SlidersHorizontal className="w-4 h-4 text-gold" /> Filters
            </button>

            <span className="hidden sm:inline text-xs text-gray-400 uppercase tracking-widest font-semibold">
              Showing {products.length} perfumes of {pagination.total}
            </span>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 hidden sm:inline">Sort By:</span>
              <select
                value={sortByParam}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="bg-luxury-deep border border-luxury-lightgrey text-luxury-black text-xs px-3 py-1.5 rounded focus:outline-none focus:border-gold/60"
              >
                <option value="latest">Latest Arrivals</option>
                <option value="best-selling">Best Sellers</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="popular">Popularity</option>
              </select>
            </div>
          </div>

          {/* PRODUCTS GRID */}
          {loading ? (
            <div className="flex-1 flex justify-center items-center py-32 text-gold text-xs uppercase tracking-widest font-semibold">
              Loading perfumes...
            </div>
          ) : products.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 py-24 text-gray-400 bg-white border border-luxury-lightgrey rounded-sm">
              <Star className="w-12 h-12 stroke-1 text-gold/40" />
              <h3 className="font-playfair text-lg text-luxury-black font-bold uppercase tracking-wider">No perfumes found</h3>
              <p className="text-xs max-w-sm font-light">Try modifying your filter settings or clear all filters to start search again.</p>
              <button onClick={clearFilters} className="btn-gold px-6 py-2.5 text-xs rounded mt-2">Clear Filters</button>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((prod) => {
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
                      {prod.stock_quantity === 0 && (
                        <span className="absolute inset-0 bg-white/70 flex items-center justify-center text-[10px] text-red-500 font-bold uppercase tracking-widest">
                          Out Of Stock
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
                        <h4 className="text-xs font-bold text-luxury-black line-clamp-1 font-playfair tracking-wide group-hover:text-gold transition-colors">
                          {prod.name}
                        </h4>
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

          {/* PAGINATION CONTROLS */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-8 border-t border-luxury-lightgrey pt-6">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="p-2 border border-luxury-lightgrey rounded hover:bg-gold/10 hover:text-gold disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-current focus:outline-none"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
                Page {pagination.page} of {pagination.totalPages}
              </span>

              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="p-2 border border-luxury-lightgrey rounded hover:bg-gold/10 hover:text-gold disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-current focus:outline-none"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </div>

      {/* MOBILE FILTERS SIDE DRAWER */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 flex justify-start md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40"
            onClick={() => setShowMobileFilters(false)}
          />
          
          {/* Drawer Panel */}
          <div className="relative flex flex-col w-full max-w-xs h-full bg-white border-r border-luxury-lightgrey p-6 shadow-xl z-50 overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-luxury-lightgrey mb-6">
              <h3 className="font-playfair text-sm uppercase tracking-widest font-bold text-luxury-black">Filters</h3>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="text-gray-400 hover:text-luxury-black focus:outline-none"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex flex-col gap-6">
              {/* Category Filter */}
              <div className="border-b border-luxury-lightgrey pb-5 flex flex-col gap-3">
                <h4 className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Category</h4>
                <div className="flex flex-col gap-2 text-xs">
                  <button
                    onClick={() => { handleFilterChange('category', ''); setShowMobileFilters(false); }}
                    className={`text-left uppercase tracking-wider ${!categoryParam ? 'text-gold font-bold' : 'text-gray-500'}`}
                  >
                    All Perfumes
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => { handleFilterChange('category', cat.slug); setShowMobileFilters(false); }}
                      className={`text-left capitalize ${categoryParam === cat.slug ? 'text-gold font-bold' : 'text-gray-500'}`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Gender Filter */}
              <div className="border-b border-luxury-lightgrey pb-5 flex flex-col gap-3">
                <h4 className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Gender</h4>
                <div className="flex flex-col gap-2 text-xs">
                  {['', 'Men', 'Women', 'Unisex'].map((g) => (
                    <button
                      key={g}
                      onClick={() => { handleFilterChange('gender', g); setShowMobileFilters(false); }}
                      className={`text-left uppercase tracking-wider ${gender === g ? 'text-gold font-bold' : 'text-gray-500'}`}
                    >
                      {g === '' ? 'All Genders' : g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div className="border-b border-luxury-lightgrey pb-5 flex flex-col gap-3">
                <h4 className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Price</h4>
                <div className="flex flex-col gap-2 text-xs">
                  <button
                    onClick={() => { setPriceRange({ min: 0, max: 5000 }); setShowMobileFilters(false); }}
                    className={`text-left uppercase tracking-wider ${priceRange.min === 0 && priceRange.max === 5000 ? 'text-gold font-bold' : 'text-gray-500'}`}
                  >
                    Any Price
                  </button>
                  <button
                    onClick={() => { setPriceRange({ min: 0, max: 1000 }); setShowMobileFilters(false); }}
                    className={`text-left uppercase tracking-wider ${priceRange.max === 1000 ? 'text-gold font-bold' : 'text-gray-500'}`}
                  >
                    Under ₹1,000
                  </button>
                  <button
                    onClick={() => { setPriceRange({ min: 1000, max: 2500 }); setShowMobileFilters(false); }}
                    className={`text-left uppercase tracking-wider ${priceRange.min === 1000 && priceRange.max === 2500 ? 'text-gold font-bold' : 'text-gray-500'}`}
                  >
                    ₹1,000 - ₹2,500
                  </button>
                  <button
                    onClick={() => { setPriceRange({ min: 2500, max: 5000 }); setShowMobileFilters(false); }}
                    className={`text-left uppercase tracking-wider ${priceRange.min === 2500 ? 'text-gold font-bold' : 'text-gray-500'}`}
                  >
                    ₹2,500 &amp; Above
                  </button>
                </div>
              </div>

              {/* Rating Filter */}
              <div className="border-b border-luxury-lightgrey pb-5 flex flex-col gap-3">
                <h4 className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Rating</h4>
                <div className="flex flex-col gap-2 text-xs">
                  {['', '4.5', '4.0', '3.0'].map((r) => (
                    <button
                      key={r}
                      onClick={() => { setSelectedRating(r); setShowMobileFilters(false); }}
                      className={`text-left ${selectedRating === r ? 'text-gold font-bold' : 'text-gray-500'}`}
                    >
                      {r === '' ? 'All Ratings' : `${r} & Above`}
                    </button>
                  ))}
                </div>
              </div>

              {/* In Stock Toggle */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400">In Stock Only</span>
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => { setInStockOnly(e.target.checked); setShowMobileFilters(false); }}
                  className="accent-gold"
                />
              </div>

              <button
                onClick={() => { clearFilters(); setShowMobileFilters(false); }}
                className="btn-gold w-full py-2.5 text-xs rounded uppercase font-bold tracking-widest mt-4"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
