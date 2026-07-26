"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, CreditCard, Truck, CheckCircle } from "lucide-react";

import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import api from "@/utils/api";

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const addressId = searchParams.get("addressId");

  const toast = useToast();

  const { user, isAuthenticated } = useAuth();

  const {
    cartItems,
    coupon,
    subtotal,
    discountAmount,
    shippingFee,
    grandTotal,
    clearCart,
  } = useCart();

  const [paymentMethod, setPaymentMethod] = useState("RAZORPAY");

  const [processing, setProcessing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  useEffect(() => {
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
  }, [isAuthenticated, cartItems, addressId, router, toast]);

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

      const orderRes = await api.post("/orders/create", {
        items: cartItems.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
        shippingAddressId: addressId,
        couponCode: coupon?.code || null,
        paymentMethod: "COD",
      });

      setProcessing(false);
      handlePaymentSuccess(orderRes.data.orderId);
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

      const orderRes = await api.post("/orders/create", {
        items: cartItems.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
        shippingAddressId: addressId,
        couponCode: coupon?.code || null,
        paymentMethod: "RAZORPAY",
      });

      const { orderId, razorpayOrderId, amount, currency, isMock } =
        orderRes.data;

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

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_change_key",

        amount: amount * 100,

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
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(0)}</span>
            </div>

            {discountAmount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>- ₹{discountAmount.toFixed(0)}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span>Shipping</span>
              <span>
                {shippingFee > 0 ? `₹${shippingFee.toFixed(0)}` : "FREE"}
              </span>
            </div>

            <hr />

            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>₹{grandTotal.toFixed(0)}</span>
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
