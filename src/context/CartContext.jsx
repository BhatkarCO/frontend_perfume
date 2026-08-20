"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import api from "@/utils/api";

const CartContext = createContext(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [savedItems, setSavedItems] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [coupon, setCoupon] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [shippingFee, setShippingFee] = useState(0);

  // Load cart from local storage
  useEffect(() => {
    const storedCart = localStorage.getItem("bhatkar_cart");
    const storedSaved = localStorage.getItem("bhatkar_saved");
    if (storedCart) {
      try {
        setCartItems(JSON.parse(storedCart));
      } catch (e) {
        console.error("Error parsing cart items:", e);
      }
    }
    if (storedSaved) {
      try {
        setSavedItems(JSON.parse(storedSaved));
      } catch (e) {
        console.error("Error parsing saved items:", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save cart to local storage when it updates
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("bhatkar_cart", JSON.stringify(cartItems));
    }
  }, [cartItems, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("bhatkar_saved", JSON.stringify(savedItems));
    }
  }, [savedItems, isLoaded]);

  // Recalculate Totals & Shipping
  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.sale_price
      ? parseFloat(item.sale_price)
      : parseFloat(item.price);
    return sum + price * item.quantity;
  }, 0);

  // Automatically recalculate coupon discount if cart totals update
  useEffect(() => {
    const calculateDiscount = async () => {
      if (coupon && subtotal > 0) {
        try {
          const response = await api.post("/orders/apply-coupon", {
            code: coupon.code,
            subtotal,
          });
          setDiscountAmount(parseFloat(response.data.discount));
        } catch (error) {
          // If subtotal drops below coupon threshold, invalidate coupon
          setCoupon(null);
          setDiscountAmount(0);
        }
      } else {
        setDiscountAmount(0);
      }
    };

    calculateDiscount();
  }, [coupon, subtotal]);

  const grandTotal = Math.max(0, subtotal - discountAmount);

  /**
   * Add Item to Cart
   */
  const addToCart = (product, quantity = 1) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id);
      if (existingItem) {
        const newQty = Math.min(
          product.stock_quantity,
          existingItem.quantity + quantity,
        );
        return prevItems.map((item) =>
          item.id === product.id ? { ...item, quantity: newQty } : item,
        );
      }
      return [
        ...prevItems,
        { ...product, quantity: Math.min(product.stock_quantity, quantity) },
      ];
    });
  };

  /**
   * Update Quantity
   */
  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === productId ? { ...item, quantity } : item,
      ),
    );
  };

  /**
   * Remove Item
   */
  const removeFromCart = (productId) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item.id !== productId),
    );
  };

  /**
   * Save Item for Later
   */
  const saveForLater = (product) => {
    // Remove from cart
    removeFromCart(product.id);
    // Add to saved items if not already there
    setSavedItems((prev) => {
      if (prev.some((item) => item.id === product.id)) return prev;
      return [...prev, product];
    });
  };

  /**
   * Move Item back to Cart
   */
  const moveToCart = (product) => {
    // Remove from saved
    setSavedItems((prev) => prev.filter((item) => item.id !== product.id));
    // Add to cart
    addToCart(product, 1);
  };

  /**
   * Apply Coupon Code
   */
  const applyCouponCode = async (code) => {
    try {
      const response = await api.post("/orders/apply-coupon", {
        code,
        subtotal,
      });
      const { discount, code: appliedCode } = response.data;
      setCoupon({ code: appliedCode });
      setDiscountAmount(parseFloat(discount));
      return { success: true, discount };
    } catch (error) {
      const message = error.response?.data?.message || "Invalid coupon code.";
      return { success: false, message };
    }
  };

  /**
   * Remove Coupon Code
   */
  const removeCouponCode = () => {
    setCoupon(null);
    setDiscountAmount(0);
  };

  /**
   * Clear Cart
   */
  const clearCart = () => {
    setCartItems([]);
    setCoupon(null);
    setDiscountAmount(0);
  };

  return (
    <CartContext.Provider
      value={{
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
        addToCart,
        updateQuantity,
        removeFromCart,
        saveForLater,
        moveToCart,
        applyCouponCode,
        removeCouponCode,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
