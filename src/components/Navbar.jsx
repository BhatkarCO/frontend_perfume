"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  ShoppingBag,
  User,
  Heart,
  Search,
  Menu,
  X,
  LogOut,
  ChevronDown,
  Sun,
  Moon,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useTheme } from "@/context/ThemeContext";

export const Navbar = () => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const { cartItems, setCartOpen } = useCart();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  const [showAnnouncement, setShowAnnouncement] = useState(() => {
    if (typeof window === "undefined") return true;

    return sessionStorage.getItem("announcementClosed") !== "true";
  });

  const router = useRouter();
  const pathname = usePathname();

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/catalog?search=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  const handleLogoClick = (e) => {
    if (pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-luxury-lightgrey shadow-sm">
      {/* Top Announcement Bar - D2C Branding */}
      {showAnnouncement && (
        <div className="relative bg-luxury-black text-white text-[9px] sm:text-[10px] py-2 uppercase font-semibold tracking-[0.25em]">
          <p className="text-center">
            Free shipping on orders above ₹1500 • Handcrafted in India
          </p>

          <button
            onClick={() => {
              sessionStorage.setItem("announcementClosed", "true");
              setShowAnnouncement(false);
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 hover:text-gray-300 transition"
            aria-label="Close announcement"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex md:grid md:grid-cols-3 items-center justify-between">
        {/* Left Column */}
        <div className="flex-1 md:flex-none flex items-center justify-start">
          {/* Mobile Menu Toggle (only visible on mobile) */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden text-luxury-black hover:text-gold transition-colors focus:outline-none"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Desktop Left Nav Pills (only visible on desktop) */}
          <div className="hidden md:flex items-center space-x-3">
            {/* COLLECTIONS Dropdown */}
            {!isAdmin && (
              <div className="relative group">
                <button className="bg-white border border-gray-200 text-luxury-black text-[10px] tracking-widest font-semibold uppercase px-4 py-2.5 rounded-md flex items-center gap-1.5 hover:bg-gray-50 hover:border-gray-300 transition-colors focus:outline-none">
                  Collections{" "}
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400 group-hover:rotate-180 transition-transform duration-200" />
                </button>
                {/* Dropdown Menu Wrapper (Bridges the hover gap using padding-top) */}
                <div className="absolute left-0 top-full pt-1.5 w-52 hidden group-hover:block z-50">
                  {/* Actual Dropdown Card */}
                  <div className="dropdown-menu bg-white border border-gray-200 rounded-md shadow-xl py-2">
                    <Link
                      href="/catalog"
                      className="block px-4 py-2.5 text-[10px] uppercase tracking-wider text-gray-600 hover:text-luxury-black hover:bg-luxury-deep transition-colors"
                    >
                      All Perfumes
                    </Link>
                    <Link
                      href="/catalog?category=signature-collection"
                      className="block px-4 py-2.5 text-[10px] uppercase tracking-wider text-gray-600 hover:text-luxury-black hover:bg-luxury-deep transition-colors"
                    >
                      Signature Collection
                    </Link>
                    <Link
                      href="/catalog?category=fresh-collection"
                      className="block px-4 py-2.5 text-[10px] uppercase tracking-wider text-gray-600 hover:text-luxury-black hover:bg-luxury-deep transition-colors"
                    >
                      Fresh Collection
                    </Link>
                    <Link
                      href="/catalog?category=floral-collection"
                      className="block px-4 py-2.5 text-[10px] uppercase tracking-wider text-gray-600 hover:text-luxury-black hover:bg-luxury-deep transition-colors"
                    >
                      Floral Collection
                    </Link>
                    <Link
                      href="/catalog?category=woody-collection"
                      className="block px-4 py-2.5 text-[10px] uppercase tracking-wider text-gray-600 hover:text-luxury-black hover:bg-luxury-deep transition-colors"
                    >
                      Woody Collection
                    </Link>
                    <Link
                      href="/catalog?category=luxury-collection"
                      className="block px-4 py-2.5 text-[10px] uppercase tracking-wider text-gray-600 hover:text-luxury-black hover:bg-luxury-deep transition-colors"
                    >
                      Luxury Collection
                    </Link>
                    <Link
                      href="/catalog?category=gift-sets"
                      className="block px-4 py-2.5 text-[10px] uppercase tracking-wider text-gray-600 hover:text-luxury-black hover:bg-luxury-deep transition-colors"
                    >
                      Gift Sets
                    </Link>
                    <hr className="border-gray-100 my-1.5" />
                    <Link
                      href="/contact"
                      className="block px-4 py-2.5 text-[10px] uppercase tracking-wider text-gray-600 hover:text-luxury-black hover:bg-luxury-deep transition-colors"
                    >
                      Contact Us
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* PRIVATE BLENDS Button */}
            {!isAdmin && (
              <Link
                href="/catalog?category=signature-collection"
                className="bg-white border border-gray-200 text-luxury-black text-[10px] tracking-widest font-semibold uppercase px-4 py-2.5 rounded-md hover:bg-gray-50 hover:border-gray-300 transition-colors"
              >
                Private Blends
              </Link>
            )}

            {/* INVENTORY & CHANGE PASSWORD Buttons (only visible to admin) */}
            {isAdmin && (
              <div className="flex gap-2">
                <Link
                  href="/admin"
                  className="bg-gold/10 border border-gold/30 text-gold-dark hover:bg-gold/20 hover:border-gold/45 text-[10px] tracking-widest font-semibold uppercase px-4 py-2.5 rounded-md transition-colors"
                >
                  Inventory
                </Link>
                <Link
                  href="/admin?tab=settings"
                  className="bg-white border border-gray-200 text-luxury-black hover:bg-gray-50 hover:border-gray-300 text-[10px] tracking-widest font-semibold uppercase px-4 py-2.5 rounded-md transition-colors"
                >
                  Change Password
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Center Column: Logo */}
        <div className="flex-shrink-0 flex justify-center">
          <Link
            href="/"
            onClick={handleLogoClick}
            className="flex flex-col items-center"
          >
            <span className="font-playfair text-lg sm:text-2xl font-bold tracking-[0.15em] sm:tracking-[0.18em] text-luxury-black whitespace-nowrap">
              BHATKAR & CO.
            </span>
            <span className="text-[8px] tracking-[0.3em] text-gold font-semibold uppercase -mt-0.5">
              PERFUMES
            </span>
          </Link>
        </div>

        {/* Right Column */}
        <div className="flex-1 md:flex-none flex items-center justify-end space-x-3">
          {/* Desktop Search Bar (only visible on desktop) */}
          {!isAdmin && (
            <div className="hidden md:block">
              <form onSubmit={handleSearchSubmit} className="flex items-center">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-[36px] border border-gray-200 focus:border-gray-300 bg-white text-luxury-black placeholder-gray-400 text-[10px] tracking-wider px-3.5 rounded-l-md focus:outline-none w-28 lg:w-36 transition-all"
                />
                <button
                  type="submit"
                  className={`h-[36px] px-3.5 rounded-r-md border border-l-0 flex items-center justify-center transition-colors ${
                    theme === "dark"
                      ? "bg-luxury-black hover:bg-luxury-black/90 text-white border-luxury-black"
                      : "bg-white hover:bg-gray-50 text-luxury-black border-gray-200"
                  }`}
                >
                  <Search className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          )}

          {/* User Profile / Account Icon Button (only visible on desktop) */}
          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className="hidden md:flex border border-gray-200 rounded-md p-1 items-center justify-center hover:bg-gray-50 hover:border-gray-300 transition-all focus:outline-none text-luxury-black"
              title="My Account"
            >
              <div className="w-7 h-7 rounded-full bg-luxury-black dark:bg-gold text-white dark:text-black text-xs font-bold flex items-center justify-center">
                {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
            </Link>
          ) : (
            <Link
              href="/login"
              className="hidden md:flex border border-gray-200 rounded-md p-2.5 items-center justify-center hover:bg-gray-50 hover:border-gray-300 transition-all focus:outline-none text-luxury-black"
              title="Login / Register"
            >
              <User className="w-4 h-4 text-luxury-black" />
            </Link>
          )}

          {/* Dark Mode Toggle Switch */}
          <button
            onClick={toggleTheme}
            className="border border-gray-200 rounded-md p-2.5 flex items-center justify-center hover:bg-gray-50 hover:border-gray-300 transition-all relative focus:outline-none"
            aria-label="Toggle Dark Mode"
            type="button"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-luxury-black transition-transform duration-300 rotate-0 hover:rotate-12" />
            ) : (
              <Moon className="w-4 h-4 text-luxury-black transition-transform duration-300 rotate-0 hover:-rotate-12" />
            )}
          </button>

          {/* Cart Icon / Custom Shopping Bag */}
          {!isAdmin && (
            <button
              onClick={() => setCartOpen(true)}
              className="border border-gray-200 rounded-md p-2.5 flex items-center justify-center hover:bg-gray-50 hover:border-gray-300 transition-all relative focus:outline-none"
              aria-label="Shopping Cart"
              type="button"
            >
              <svg
                className="w-4 h-4 text-luxury-black"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M6 22H18C19.1 22 20 21.1 20 20V8H4V20C4 21.1 4.9 22 6 22Z" />
                <path d="M16 8V6C16 3.8 14.2 2 12 2C9.8 2 8 3.8 8 6V8" />
              </svg>
              <span className="absolute top-[52%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[9px] font-bold text-luxury-black">
                {cartCount}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Sidebar Navigation Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Menu Panel */}
          <div className="relative flex flex-col w-full max-w-xs h-full bg-white border-r border-luxury-lightgrey p-6 shadow-xl z-50">
            <div className="flex items-center justify-between pb-6 border-b border-luxury-lightgrey">
              <span className="font-playfair text-lg font-bold tracking-widest text-luxury-black">
                BHATKAR & CO.
              </span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-400 hover:text-gold focus:outline-none"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Mobile Search Bar inside Sidebar */}
            {!isAdmin && (
              <form onSubmit={handleSearchSubmit} className="mt-4 flex gap-1">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 border border-gray-200 bg-white text-luxury-black placeholder-gray-400 text-xs px-3 py-2 rounded focus:outline-none"
                />
                <button
                  type="submit"
                  className="bg-luxury-black text-white px-3 py-2 rounded flex items-center justify-center"
                >
                  <Search className="w-3.5 h-3.5" />
                </button>
              </form>
            )}

            <nav className="flex-1 flex flex-col gap-6 text-xs uppercase tracking-widest font-bold py-6 overflow-y-auto">
              {!isAdmin && (
                <>
                  <Link
                    href="/catalog"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-gray-700 hover:text-gold"
                  >
                    All Perfumes
                  </Link>
                  <Link
                    href="/catalog?category=signature-collection"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-gray-700 hover:text-gold"
                  >
                    Signature Collection
                  </Link>
                  <Link
                    href="/catalog?category=fresh-collection"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-gray-700 hover:text-gold"
                  >
                    Fresh Collection
                  </Link>
                  <Link
                    href="/catalog?category=floral-collection"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-gray-700 hover:text-gold"
                  >
                    Floral Collection
                  </Link>
                  <Link
                    href="/catalog?category=woody-collection"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-gray-700 hover:text-gold"
                  >
                    Woody Collection
                  </Link>
                  <Link
                    href="/catalog?category=luxury-collection"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-gray-700 hover:text-gold"
                  >
                    Luxury Collection
                  </Link>
                  <Link
                    href="/catalog?category=gift-sets"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-gray-700 hover:text-gold"
                  >
                    Gift Sets
                  </Link>
                </>
              )}
              <Link
                href="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-700 hover:text-gold"
              >
                Contact Us
              </Link>
              <hr className="border-luxury-lightgrey my-2" />
              {isAuthenticated ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-gold"
                  >
                    My Dashboard
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-gold"
                    >
                      Inventory
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="text-left text-red-500 font-bold"
                  >
                    Log Out
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-gold"
                >
                  Sign In / Register
                </Link>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};
