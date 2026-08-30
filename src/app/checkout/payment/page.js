"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, CreditCard, Truck, CheckCircle } from "lucide-react";

import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import api from "@/utils/api";
import Script from "next/script";

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const addressId = searchParams.get("addressId");

  const toast = useToast();

  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const {
    cartItems,
    coupon,
    subtotal,
    discountAmount,
    shippingFee,
    grandTotal,
    clearCart,
  } = useCart();

  const [shippingCharge, setShippingCharge] = useState(shippingFee);
  const [loadingShipping, setLoadingShipping] = useState(true);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [pricingSummary, setPricingSummary] = useState({
    deliveryCharges: 0,
    payable: 0,
  });
  const [pricingDetails, setPricingDetails] = useState({});
  const [orderPreview, setOrderPreview] = useState(null);
  const [previewMethod, setPreviewMethod] = useState("RAZORPAY");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState(null);

  const [paymentMethod, setPaymentMethod] = useState("RAZORPAY");

  const COD_CHARGE = 65;

  const [processing, setProcessing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const finalTotal = subtotal - discountAmount + shippingCharge;

  const displayShipping = Number(
    pricingDetails?.delivery_charges ??
      pricingDetails?.shipping_charge ??
      shippingCharge,
  );

  const taxAmount = Number(
    pricingDetails?.gst ?? pricingDetails?.tax ?? pricingDetails?.taxes ?? 0,
  );
  const codCharge = paymentMethod === "COD" ? COD_CHARGE : 0;

  const displaySubtotal = subtotal - discountAmount + taxAmount;

  const displayTotal = displaySubtotal + displayShipping + codCharge;

  const summaryShipping = loadingShipping
    ? "Calculating..."
    : displayShipping > 0
      ? `₹${displayShipping.toFixed(2)}`
      : "FREE";

  const summaryTotal =
    loadingShipping || previewLoading
      ? "Calculating..."
      : `₹${displayTotal.toFixed(2)}`;

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!isAuthenticated) {
      router.push("/login?redirect=/checkout/payment");
      return;
    }

    if (cartItems.length === 0 && !orderPlaced) {
      toast.info("Your bag is empty.");
      router.push("/catalog");
      return;
    }

    if (!addressId) {
      toast.error("Shipping address not found.");
      router.push("/checkout");
      return;
    }
  }, [
    authLoading,
    isAuthenticated,
    cartItems,
    addressId,
    router,
    toast,
    orderPlaced,
  ]);

  useEffect(() => {
    if (!isAuthenticated || !addressId) return;

    const fetchAddressDetails = async () => {
      try {
        const res = await api.get("/addresses");
        const matchedAddress = res.data.find((item) => item.id === addressId);
        setSelectedAddress(matchedAddress || null);
      } catch (err) {
        console.error("Unable to load address details.", err);
      }
    };

    fetchAddressDetails();
  }, [addressId, isAuthenticated]);

  useEffect(() => {
    if (!addressId || !selectedAddress?.postal_code) return;

    const fetchShipping = async () => {
      try {
        setLoadingShipping(true);

        const res = await api.post("/shiprocket/serviceability", {
          deliveryPostcode: selectedAddress.postal_code,
          cod: paymentMethod === "COD" ? 1 : 0,
        });

        const serviceabilityCharge =
          res.data?.shippingCharge ??
          res.data?.shipping_charge ??
          res.data?.delivery_charges ??
          res.data?.pricing?.delivery_charges ??
          0;

        setShippingCharge(Number(serviceabilityCharge));
      } catch (err) {
        toast.error(
          err.response?.data?.message || "Unable to calculate shipping.",
        );
      } finally {
        setLoadingShipping(false);
      }
    };

    fetchShipping();
  }, [addressId, paymentMethod, selectedAddress?.postal_code, toast]);

  useEffect(() => {
    if (
      !isAuthenticated ||
      !addressId ||
      !selectedAddress?.postal_code ||
      cartItems.length === 0 ||
      orderPlaced
    ) {
      return;
    }

    if (previewMethod === paymentMethod && orderPreview) {
      return;
    }

    const fetchOrderPreview = async () => {
      try {
        setPreviewLoading(true);
        setPreviewError(null);

        // Validate before making request
        if (!addressId) {
          console.error("addressId is missing:", addressId);
          setPreviewError("Shipping address ID is missing.");
          setPreviewLoading(false);
          return;
        }

        if (!cartItems || cartItems.length === 0) {
          console.error("cartItems is empty:", cartItems);
          setPreviewError("Cart is empty. Please add items.");
          setPreviewLoading(false);
          return;
        }

        const payload = {
          items: cartItems.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
          })),
          shippingAddressId: addressId,
          paymentMethod,
          couponCode: coupon?.code || null,
        };

        const orderRes = await api.post("/orders/preview", payload);

        console.log("✅ Order preview response:", orderRes.data);

        const { pricing, shippingCharge: backendShippingCharge } =
          orderRes.data;

        const deliveryCharges = Number(
          pricing?.delivery_charges ??
            backendShippingCharge ??
            shippingCharge ??
            0,
        );

        const payableAmount = Number(
          (
            pricing?.payable ?? subtotal - discountAmount + deliveryCharges
          ).toFixed(2),
        );

        setShippingCharge(deliveryCharges);
        setPricingSummary({ deliveryCharges, payable: payableAmount });
        setPricingDetails(pricing || {});
        setPreviewMethod(paymentMethod);
        setOrderPreview(orderRes.data);
      } catch (err) {
        console.error(
          "❌ Order preview failed:",
          err.response?.data || err.message,
        );
        setPreviewError(
          err.response?.data?.message ||
            "Unable to preview order pricing at this time.",
        );
      } finally {
        setPreviewLoading(false);
      }
    };

    fetchOrderPreview();
  }, [
    addressId,
    cartItems,
    coupon?.code,
    discountAmount,
    isAuthenticated,
    orderPlaced,
    paymentMethod,
    previewMethod,
    selectedAddress?.postal_code,
    shippingCharge,
    subtotal,
  ]);

  const handlePaymentSuccess = (orderId) => {
    setOrderPlaced(true);

    toast.success("Order placed successfully.");

    router.replace(`/dashboard?tab=orders&order=${orderId}`);

    setTimeout(() => {
      clearCart();
    }, 100);
  };
  // ============================
  // CASH ON DELIVERY
  // ============================
  const handleCOD = async () => {
    try {
      setProcessing(true);

      // Validate before making request
      if (!addressId) {
        toast.error("Shipping address is missing.");
        setProcessing(false);
        return;
      }

      if (!cartItems || cartItems.length === 0) {
        toast.error("Cart is empty. Please add items.");
        setProcessing(false);
        return;
      }

      const payload = {
        items: cartItems.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
        shippingAddressId: addressId,
        paymentMethod: "COD",
        couponCode: coupon?.code || null,
      };

      const orderRes = await api.post("/orders/create", payload);
      const orderData = orderRes.data;

      const {
        orderId,
        pricing,
        shippingCharge: backendShippingCharge,
      } = orderData.data ? orderData.data : orderData;
      const deliveryCharges = Number(
        pricing?.delivery_charges ??
          backendShippingCharge ??
          shippingCharge ??
          0,
      );
      const payableAmount = Number(
        (
          pricing?.payable ?? subtotal - discountAmount + deliveryCharges
        ).toFixed(2),
      );

      setShippingCharge(deliveryCharges);
      setPricingSummary({ deliveryCharges, payable: payableAmount });
      setPricingDetails(pricing || {});
      setProcessing(false);
      handlePaymentSuccess(orderId);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to place COD order.");
    } finally {
      setProcessing(false);
    }
  };

  // ============================
  // RAZORPAY
  // ============================
  const handleRazorpay = async () => {
    try {
      setProcessing(true);

      // Validate before making request
      if (!addressId) {
        toast.error("Shipping address is missing.");
        setProcessing(false);
        return;
      }

      if (!cartItems || cartItems.length === 0) {
        toast.error("Cart is empty. Please add items.");
        setProcessing(false);
        return;
      }

      const payload = {
        items: cartItems.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
        shippingAddressId: addressId,
        paymentMethod: "RAZORPAY",
        couponCode: coupon?.code || null,
      };

      const orderRes = await api.post("/orders/create", payload);
      const orderData = orderRes.data;

      const {
        orderId,
        razorpayOrderId,
        amount,
        currency,
        isMock,
        pricing,
        shippingCharge: backendShippingCharge,
      } = orderData;
      const deliveryCharges = Number(
        pricing?.delivery_charges ??
          backendShippingCharge ??
          shippingCharge ??
          0,
      );
      const payableAmount = Number(
        (
          pricing?.payable ??
          amount ??
          subtotal - discountAmount + deliveryCharges
        ).toFixed(2),
      );

      setShippingCharge(deliveryCharges);
      setPricingSummary({ deliveryCharges, payable: payableAmount });
      setPricingDetails(pricing || {});

      if (isMock) {
        await api.post("/orders/verify", {
          orderId,
          razorpayOrderId,
          razorpayPaymentId: `pay_mock_${Date.now()}`,
          razorpaySignature: "mock_signature",
        });

        setProcessing(false);
        handlePaymentSuccess(orderId);
        return;
      }

      const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,

        amount: Math.round(Number(amount) * 100),

        currency,

        name: "BHATKAR & CO. PERFUMES",

        description: "Luxury Fragrance Checkout",

        order_id: razorpayOrderId,

        prefill: {
          name: user?.name,
          email: user?.email,
        },

        theme: {
          color: "#B89765",
        },

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
            toast.error(
              err.response?.data?.message || "Payment verification failed.",
            );
          } finally {
            setProcessing(false);
          }
        },

        modal: {
          ondismiss: function () {
            toast.warning("Payment cancelled.");
            setProcessing(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.open();
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Unable to initialize payment.",
      );

      setProcessing(false);
    }
  };

  // ============================
  // CONTINUE BUTTON
  // ============================
  const handleContinue = () => {
    if (paymentMethod === "COD") {
      handleCOD();
    } else {
      handleRazorpay();
    }
  };
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-[75vh] bg-luxury-deep">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gold text-sm font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <h2 className="text-2xl font-playfair font-bold uppercase tracking-wider">
            Payment Method
          </h2>

          {/* COD */}
          <label
            className={`border rounded-sm p-5 cursor-pointer transition-all ${
              paymentMethod === "COD"
                ? "border-gold bg-gold/5"
                : "border-luxury-lightgrey bg-white"
            }`}
          >
            <div className="flex items-center gap-4">
              <input
                type="radio"
                checked={paymentMethod === "COD"}
                onChange={() => setPaymentMethod("COD")}
              />

              <Truck className="w-6 h-6 text-gold" />

              <div>
                <h3 className="font-bold text-sm">Cash on Delivery</h3>

                <p className="text-xs text-gray-500">
                  Pay when your order arrives.
                </p>
              </div>
            </div>
          </label>

          {/* Razorpay */}
          <label
            className={`border rounded-sm p-5 cursor-pointer transition-all ${
              paymentMethod === "RAZORPAY"
                ? "border-gold bg-gold/5"
                : "border-luxury-lightgrey bg-white"
            }`}
          >
            <div className="flex items-center gap-4">
              <input
                type="radio"
                checked={paymentMethod === "RAZORPAY"}
                onChange={() => setPaymentMethod("RAZORPAY")}
              />

              <CreditCard className="w-6 h-6 text-gold" />

              <div>
                <h3 className="font-bold text-sm">Pay with Razorpay</h3>

                <p className="text-xs text-gray-500">
                  Secure UPI, Cards, Net Banking & Wallets.
                </p>
              </div>
            </div>
          </label>
        </div>

        {/* Right */}
        <div className="bg-white border border-luxury-lightgrey rounded-sm p-6 h-fit">
          <h3 className="font-playfair text-lg font-bold uppercase tracking-wider mb-5">
            Order Summary
          </h3>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-start">
              <span>Subtotal</span>

              <div className="text-right">
                <span>₹{displaySubtotal.toFixed(2)}</span>
                <p className="text-xs text-gray-500 mt-1">GST included</p>
              </div>
            </div>

            {discountAmount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Promo discount</span>
                <span>- ₹{discountAmount.toFixed(0)}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span>Shipping charge</span>
              <span>{summaryShipping}</span>
            </div>

            {paymentMethod === "COD" && (
              <div className="flex justify-between">
                <span>COD Charges</span>
                <span>₹65.00</span>
              </div>
            )}

            <hr />

            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>{summaryTotal}</span>
            </div>
          </div>

          <button
            onClick={handleContinue}
            disabled={processing}
            className="btn-gold w-full mt-8 py-4 rounded-sm uppercase tracking-widest font-bold text-xs flex justify-center items-center gap-2"
          >
            {processing ? (
              "Processing..."
            ) : paymentMethod === "COD" ? (
              <>
                <CheckCircle className="w-4 h-4" />
                Place Order
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4" />
                Pay with Razorpay
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
export default function PaymentPage() {
  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
      />

      <Suspense
        fallback={
          <div className="flex justify-center items-center min-h-[70vh]">
            Loading payment...
          </div>
        }
      >
        <PaymentContent />
      </Suspense>
    </>
  );
}
