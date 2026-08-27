"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  MapPin,
  ShoppingBag,
  CreditCard,
  ArrowRight,
  ArrowLeft,
  Plus,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import api from "@/utils/api";
import confetti from "canvas-confetti";

export default function Checkout() {
  const router = useRouter();
  const {
    cartItems,
    coupon,
    subtotal,
    discountAmount,
    shippingFee,
    grandTotal,
    clearCart,
  } = useCart();
  const { user, isAuthenticated, loading } = useAuth();
  const toast = useToast();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [showAddAddressForm, setShowAddAddressForm] = useState(false);
  const [step, setStep] = useState(1); // 1 = Address, 2 = Review, 3 = Confirmation

  // New Address Form State
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [phone, setPhone] = useState("");
  const [savingAddress, setSavingAddress] = useState(false);

  // Checkout process state
  const [processingOrder, setProcessingOrder] = useState(false);
  const [confirmedOrderId, setConfirmedOrderId] = useState("");
  const [pricing, setPricing] = useState(null);
  const [orderPreview, setOrderPreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState(null);
  const [orderCompleted, setOrderCompleted] = useState(false);

  const displayShipping = Number(
    pricing?.delivery_charge ??
      pricing?.delivery_charges ??
      pricing?.shipping_charge ??
      shippingFee ??
      0,
  );

  const displayTax = Number(
    pricing?.gst_amount ?? pricing?.gst ?? pricing?.tax ?? pricing?.taxes ?? 0,
  );

  const displaySubtotal = Number(subtotal - discountAmount + displayTax);

  const displayTotal = Number(
    pricing?.payable ?? displaySubtotal + displayShipping,
  );

  const summaryShipping = previewLoading
    ? "Calculating..."
    : displayShipping > 0
      ? `₹${displayShipping.toFixed(2)}`
      : "FREE";

  const summaryTotal = previewLoading
    ? "Calculating..."
    : `₹${displayTotal.toFixed(2)}`;

  // Enforce auth
  useEffect(() => {
    // Wait for auth to finish loading before checking authentication
    if (loading) {
      return;
    }

    if (!isAuthenticated) {
      toast.info("Please sign in to proceed with checkout.");
      router.push("/login?redirect=/checkout");
      return;
    }

    if (cartItems.length === 0 && step !== 3 && !orderCompleted) {
      toast.info("Your bag is empty.");
      router.push("/catalog");
      return;
    }

    fetchAddresses();
  }, [
    loading,
    isAuthenticated,
    cartItems,
    step,
    router,
    orderCompleted,
    toast,
  ]);

  const fetchAddresses = async () => {
    try {
      const response = await api.get("/addresses");
      setAddresses(response.data);
      if (response.data.length > 0) {
        const def = response.data.find((a) => a.is_default) || response.data[0];
        setSelectedAddressId(def.id);
      }
    } catch (err) {
      console.error("Error fetching addresses:", err);
    }
  };

  useEffect(() => {
    if (!selectedAddressId || cartItems.length === 0) return;

    const fetchPricingPreview = async () => {
      try {
        setPreviewLoading(true);
        setPreviewError(null);

        const payload = {
          items: cartItems.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
          })),
          shippingAddressId: selectedAddressId,
          paymentMethod: "RAZORPAY",
        };

        // Only add coupon code if it exists
        if (coupon?.code) {
          payload.couponCode = coupon.code;
        }

        console.log("Sending order preview payload:", payload);

        const response = await api.post("/orders/preview", payload);

        console.log("Order preview response:", response.data);
        setPricing(response.data.pricing || null);
        setOrderPreview(response.data);
      } catch (err) {
        console.error("Order preview pricing failed:", err);
        console.error("Error response:", err.response?.data);
        setPreviewError(
          err.response?.data?.message ||
            "Unable to calculate shipping and tax preview.",
        );
      } finally {
        setPreviewLoading(false);
      }
    };

    fetchPricingPreview();
  }, [selectedAddressId, cartItems.length, subtotal, coupon?.code]);

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!addressLine1 || !city || !state || !postalCode || !phone) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setSavingAddress(true);
    try {
      const response = await api.post("/addresses", {
        address_line1: addressLine1,
        address_line2: addressLine2,
        city,
        state,
        postal_code: postalCode,
        phone,
        is_default: true,
      });

      toast.success("Address saved successfully.");
      setAddresses((prev) => [
        response.data,
        ...prev.map((a) => ({ ...a, is_default: false })),
      ]);
      setSelectedAddressId(response.data.id);
      setShowAddAddressForm(false);

      setAddressLine1("");
      setAddressLine2("");
      setCity("");
      setState("");
      setPostalCode("");
      setPhone("");
    } catch (err) {
      toast.error("Failed to save address.");
    } finally {
      setSavingAddress(false);
    }
  };

  const initPayment = async () => {
    if (!selectedAddressId) {
      toast.error("Please select a shipping address.");
      return;
    }

    setProcessingOrder(true);
    try {
      const payload = {
        items: cartItems.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
        shippingAddressId: selectedAddressId,
        paymentMethod: "RAZORPAY",
      };

      // Only add coupon code if it exists
      if (coupon?.code) {
        payload.couponCode = coupon.code;
      }

      const orderRes = await api.post("/orders/create", payload);

      const { orderId, razorpayOrderId, amount, currency, isMock, pricing } =
        orderRes.data;

      setPricing(pricing);

      if (isMock) {
        setTimeout(async () => {
          try {
            await api.post("/orders/verify", {
              orderId,
              razorpayOrderId,
              razorpayPaymentId: `pay_mock_${Date.now()}`,
              razorpaySignature: "mock_sig",
            });

            handlePaymentSuccess(orderId);
          } catch (verifyErr) {
            toast.error("Order validation failed.");
            setProcessingOrder(false);
          }
        }, 1500);
      } else {
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: amount * 100,
          currency,
          name: "BHATKAR & CO. PERFUMES",
          description: "Luxury Fragrance Order Checkout",
          order_id: razorpayOrderId,
          handler: async function (response) {
            try {
              await api.post("/orders/verify", {
                orderId,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              });

              handlePaymentSuccess(orderId);
            } catch (err) {
              toast.error("Payment signature validation failed.");
              setProcessingOrder(false);
            }
          },
          prefill: {
            name: user.name,
            email: user.email,
          },
          theme: {
            color: "#B89765",
          },
          modal: {
            ondismiss: function () {
              toast.warning("Payment process cancelled by user.");
              setProcessingOrder(false);
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Error processing payment order.",
      );
      setProcessingOrder(false);
    }
  };

  const handlePaymentSuccess = (orderId) => {
    setOrderCompleted(true);

    setConfirmedOrderId(orderId);

    clearCart();

    setStep(3);

    setProcessingOrder(false);

    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-[75vh] bg-luxury-deep">
      {/* Steps Indicator */}
      {step !== 3 && (
        <div className="flex justify-center items-center gap-6 mb-10 text-[10px] tracking-widest uppercase font-bold text-gray-400">
          <span className={step === 1 ? "text-gold" : "text-gray-500"}>
            1. Shipping
          </span>
          <span className="w-8 h-px bg-luxury-lightgrey" />
          <span className={step === 2 ? "text-gold" : "text-gray-400"}>
            2. Review & Pay
          </span>
        </div>
      )}

      {step === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Address select column */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <h2 className="text-lg font-playfair font-bold text-luxury-black uppercase tracking-wider">
              Select Shipping Address
            </h2>

            {/* List addresses */}
            {addresses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    onClick={() => setSelectedAddressId(addr.id)}
                    className={`p-4 rounded-sm border cursor-pointer flex flex-col gap-2 transition-all ${
                      selectedAddressId === addr.id
                        ? "border-gold bg-gold/5 shadow-sm"
                        : "border-luxury-lightgrey bg-white hover:border-gold/30"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">
                        {addr.is_default ? "Default Address" : "Saved Address"}
                      </span>
                      {selectedAddressId === addr.id && (
                        <span className="w-4 h-4 bg-gold rounded-full flex items-center justify-center text-white text-[9px]">
                          ✓
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-bold text-luxury-black">
                      {user?.name}
                    </p>
                    <p className="text-[11px] text-gray-500 leading-relaxed font-light">
                      {addr.address_line1},{" "}
                      {addr.address_line2 && `${addr.address_line2}, `}
                      {addr.city}, {addr.state} - {addr.postal_code}
                    </p>
                    <p className="text-[10px] text-gray-400 font-semibold mt-1">
                      Phone: {addr.phone}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500 italic">
                No saved addresses found. Please add a shipping address below.
              </p>
            )}

            {/* Toggle Add Address Form */}
            {!showAddAddressForm ? (
              <button
                onClick={() => setShowAddAddressForm(true)}
                className="border border-dashed border-gold/40 hover:border-gold text-gold text-xs font-semibold py-4 rounded-sm flex items-center justify-center gap-1.5 focus:outline-none transition-all bg-white w-full"
                type="button"
              >
                <Plus className="w-4 h-4" /> Add New Shipping Address
              </button>
            ) : (
              <form
                onSubmit={handleAddAddress}
                className="bg-white p-6 rounded-sm border border-luxury-lightgrey flex flex-col gap-4 shadow-sm"
              >
                <div className="flex justify-between items-center pb-2 border-b border-luxury-lightgrey">
                  <h3 className="font-playfair text-xs uppercase tracking-widest text-luxury-black font-bold">
                    New Shipping Address
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowAddAddressForm(false)}
                    className="text-xs text-red-500 font-bold hover:underline uppercase tracking-wider text-[10px]"
                  >
                    Cancel
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Address Line 1"
                    value={addressLine1}
                    onChange={(e) => setAddressLine1(e.target.value)}
                    required
                    className="bg-luxury-deep border border-luxury-lightgrey text-luxury-black placeholder-gray-400 text-xs px-4 py-3 rounded-sm focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Address Line 2"
                    value={addressLine2}
                    onChange={(e) => setAddressLine2(e.target.value)}
                    className="bg-luxury-deep border border-luxury-lightgrey text-luxury-black placeholder-gray-400 text-xs px-4 py-3 rounded-sm focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="City"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                    className="bg-luxury-deep border border-luxury-lightgrey text-luxury-black placeholder-gray-400 text-xs px-4 py-3 rounded-sm focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    required
                    className="bg-luxury-deep border border-luxury-lightgrey text-luxury-black placeholder-gray-400 text-xs px-4 py-3 rounded-sm focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Pincode"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    required
                    className="bg-luxury-deep border border-luxury-lightgrey text-luxury-black placeholder-gray-400 text-xs px-4 py-3 rounded-sm focus:outline-none"
                  />
                  <input
                    type="tel"
                    placeholder="Mobile Phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="bg-luxury-deep border border-luxury-lightgrey text-luxury-black placeholder-gray-400 text-xs px-4 py-3 rounded-sm focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={savingAddress}
                  className="btn-gold self-start px-8 py-2.5 text-xs rounded-sm uppercase font-bold tracking-widest"
                >
                  {savingAddress ? "Saving..." : "Save & Select Address"}
                </button>
              </form>
            )}

            {/* Navigation Button */}
            {selectedAddressId && (
              <button
                onClick={() => setStep(2)}
                className="btn-gold py-3.5 rounded-sm flex items-center justify-center gap-2 uppercase tracking-widest font-bold text-xs self-end px-8 mt-4"
                type="button"
              >
                Review Items <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Pricing column */}
          <div className="bg-white border border-luxury-lightgrey p-6 rounded-sm h-fit flex flex-col gap-4 shadow-sm">
            <h3 className="font-playfair text-sm uppercase tracking-widest font-bold text-luxury-black">
              Bag Summary
            </h3>
            <div className="flex flex-col gap-3 text-xs text-gray-500">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center"
                >
                  <span className="line-clamp-1 font-playfair">
                    {item.name} (x{item.quantity})
                  </span>
                  <span className="text-luxury-black font-semibold">
                    ₹
                    {((item.sale_price || item.price) * item.quantity).toFixed(
                      0,
                    )}
                  </span>
                </div>
              ))}
              <hr className="border-luxury-lightgrey my-1" />
              <div className="flex justify-between items-start">
                <span>Subtotal</span>

                <div className="text-right">
                  <span className="text-luxury-black font-semibold">
                    ₹{displaySubtotal.toFixed(2)}
                  </span>
                  <p className="text-[10px] text-gray-500 mt-1">GST included</p>
                </div>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>- ₹{discountAmount.toFixed(0)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping charge</span>
                <span className="text-luxury-black font-semibold">
                  {previewLoading
                    ? "Calculating..."
                    : displayShipping > 0
                      ? `₹${displayShipping.toFixed(2)}`
                      : "FREE"}
                </span>
              </div>
              <hr className="border-luxury-lightgrey my-1" />
              <div className="flex justify-between font-bold text-xs uppercase tracking-wider text-luxury-black">
                <span>Grand Total</span>
                <span>
                  {previewLoading
                    ? "Calculating..."
                    : `₹${displayTotal.toFixed(2)}`}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order items review column */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setStep(1)}
                className="text-gray-400 hover:text-luxury-black mr-2"
                type="button"
              >
                <ArrowLeft className="w-5 h-5 text-gold" />
              </button>
              <h2 className="text-lg font-playfair font-bold text-luxury-black uppercase tracking-wider">
                Review Your Order
              </h2>
            </div>

            {/* Shipping Address confirmation */}
            {(() => {
              const selectedAddr = addresses.find(
                (a) => a.id === selectedAddressId,
              );
              return selectedAddr ? (
                <div className="bg-white border border-luxury-lightgrey p-5 rounded-sm flex flex-col gap-2 shadow-sm">
                  <h3 className="text-[10px] uppercase tracking-widest text-gold font-bold">
                    Shipping Destination
                  </h3>
                  <p className="text-xs font-bold text-luxury-black">
                    {user?.name}
                  </p>
                  <p className="text-xs text-gray-500 leading-relaxed font-light">
                    {selectedAddr.address_line1},{" "}
                    {selectedAddr.address_line2 &&
                      `${selectedAddr.address_line2}, `}
                    {selectedAddr.city}, {selectedAddr.state} -{" "}
                    {selectedAddr.postal_code}
                  </p>
                  <p className="text-[10px] text-gray-400">
                    Phone: {selectedAddr.phone}
                  </p>
                </div>
              ) : null;
            })()}

            {/* List items with image */}
            <div className="flex flex-col gap-4">
              <h3 className="text-[10px] uppercase tracking-widest text-gold font-bold">
                Fragrances in Bag
              </h3>
              {cartItems.map((item) => {
                const activePrice = item.sale_price
                  ? parseFloat(item.sale_price)
                  : parseFloat(item.price);
                return (
                  <div
                    key={item.id}
                    className="flex gap-4 bg-white border border-luxury-lightgrey p-4 rounded-sm items-center shadow-sm"
                  >
                    <div className="relative w-12 h-16 shrink-0 bg-luxury-deep border border-luxury-lightgrey rounded overflow-hidden">
                      <Image
                        src={
                          item.primary_image ||
                          item.image_url ||
                          "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=100"
                        }
                        alt={item.name}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xs font-bold text-luxury-black font-playfair">
                        {item.name}
                      </h4>
                      <p className="text-[10px] text-gray-400 capitalize">
                        Gender: {item.gender} • Qty: {item.quantity}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-luxury-black">
                      ₹{(activePrice * item.quantity).toFixed(0)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Payment panel column */}
          <div className="bg-white border border-luxury-lightgrey p-6 rounded-sm h-fit flex flex-col gap-6 shadow-sm">
            <h3 className="font-playfair text-sm uppercase tracking-widest font-bold text-luxury-black">
              Order Payment
            </h3>

            <div className="flex flex-col gap-3 text-xs text-gray-500">
              {/* Subtotal + GST included */}
              <div className="flex justify-between items-start">
                <span>Subtotal</span>

                <div className="text-right">
                  <span className="text-luxury-black font-semibold">
                    ₹{displaySubtotal.toFixed(2)}
                  </span>

                  <p className="text-[10px] text-gray-400 mt-0.5">
                    GST included
                  </p>
                </div>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>- ₹{discountAmount.toFixed(2)}</span>
                </div>
              )}

              {/* Shipping */}
              <div className="flex justify-between">
                <span>Shipping charge</span>
                <span className="text-luxury-black font-semibold">
                  {summaryShipping}
                </span>
              </div>

              <hr className="border-luxury-lightgrey my-1" />

              {/* Total */}
              <div className="flex justify-between font-bold text-xs uppercase tracking-wider text-luxury-black">
                <span>Total Amount</span>
                <span>{summaryTotal}</span>
              </div>
            </div>

            <div className="border border-luxury-lightgrey p-4 rounded-sm bg-luxury-deep flex gap-3 items-center">
              <CreditCard className="w-5 h-5 text-gold shrink-0" />
              <div>
                <h4 className="text-[9px] font-bold text-luxury-black uppercase tracking-wider">
                  FROM OUR HOUSE TO YOURS
                </h4>
                <p className="text-[9px] text-gray-400 mt-0.5">
                  Every order is prepared with care and attention to detail.
                </p>
              </div>
            </div>

            <button
              onClick={() =>
                router.push(`/checkout/payment?addressId=${selectedAddressId}`)
              }
              className="btn-gold w-full py-4 rounded-sm flex items-center justify-center gap-2 uppercase tracking-widest font-bold text-xs"
              type="button"
            >
              Continue to Payment
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="max-w-xl mx-auto text-center flex flex-col items-center gap-6 py-10 bg-white border border-luxury-lightgrey p-8 rounded-sm shadow-sm">
          <div className="p-4 bg-gold/10 rounded-full border border-gold/30 mb-2">
            <span className="w-12 h-12 bg-gold rounded-full flex items-center justify-center text-white text-xl">
              ✓
            </span>
          </div>
          <span className="font-playfair text-2xl font-bold text-luxury-black uppercase tracking-wider">
            ORDER CONFIRMED
          </span>

          <div className="flex flex-col gap-2">
            <p className="text-xs text-gray-600 font-light">
              Hello <span className="text-gold font-bold">{user?.name}</span>,
              thank you for shopping with Bhatkar & Co. Perfumes.
            </p>
            <p className="text-xs text-gray-500 leading-relaxed max-w-sm mx-auto font-light">
              Your payment was validated successfully. Bhatkar & Co. Order{" "}
              <span className="text-gold font-bold">#{confirmedOrderId}</span>{" "}
              has been confirmed. A receipt and confirmation alert have been
              dispatched to your email address.
            </p>
          </div>

          <div className="flex gap-4 mt-4">
            <button
              onClick={() => router.push("/dashboard?tab=orders")}
              className="btn-gold px-8 py-3 text-xs font-bold uppercase tracking-widest rounded-sm"
              type="button"
            >
              Track Orders
            </button>
            <button
              onClick={() => router.push("/catalog")}
              className="border border-luxury-black text-luxury-black hover:bg-luxury-black hover:text-white px-8 py-3 text-xs font-bold uppercase tracking-widest rounded-sm transition-all"
              type="button"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
