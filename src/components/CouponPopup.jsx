"use client";

import { useEffect, useState } from "react";
import { Copy, X, Check } from "lucide-react";
import api from "@/utils/api";

export default function CouponPopup() {
  const [coupons, setCoupons] = useState([]);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState("");

  useEffect(() => {
    let timer;

    const showPopup = async () => {
      try {
        setLoading(true);

        const res = await api.get("/coupons/active");

        const activeCoupons = Array.isArray(res.data)
          ? res.data
          : [];

        if (activeCoupons.length > 0) {
          setCoupons(activeCoupons);
          setVisible(true);
        }
      } catch (error) {
        console.error("Failed to load active coupons:", error);
      } finally {
        setLoading(false);
      }
    };

    timer = setTimeout(showPopup, 60 * 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleCopy = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);

      setTimeout(() => {
        setCopiedCode("");
      }, 2000);
    } catch (error) {
      console.error("Copy coupon failed:", error);
    }
  };

  if (!visible || coupons.length === 0) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="relative w-full max-w-md bg-white rounded-sm shadow-2xl overflow-hidden">

        {/* Close */}
        <button
          type="button"
          onClick={() => setVisible(false)}
          className="absolute top-4 right-4 z-10 text-gray-400 hover:text-black transition-colors"
          aria-label="Close coupon popup"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="bg-luxury-deep px-6 py-8 text-center border-b border-luxury-lightgrey">
          <p className="text-[10px] uppercase tracking-[0.3em] text-gold font-bold">
            Exclusive Offer
          </p>

          <h2 className="font-playfair text-2xl font-bold uppercase tracking-wider text-luxury-black mt-2">
            Special Coupons
          </h2>

          <p className="text-xs text-gray-500 mt-2">
            Enjoy exclusive savings on your next fragrance order.
          </p>
        </div>

        {/* Coupons */}
        <div className="p-5 space-y-3 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="text-center py-8 text-xs text-gray-400">
              Loading offers...
            </div>
          ) : (
            coupons.map((coupon) => (
              <div
                key={coupon.code}
                className="border border-luxury-lightgrey rounded-sm p-4"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-[9px] uppercase tracking-widest text-gray-400">
                      Coupon Code
                    </p>

                    <p className="text-lg font-bold tracking-wider text-luxury-black mt-1">
                      {coupon.code}
                    </p>

                    <p className="text-sm text-gold font-bold mt-1">
                      {coupon.discount_percentage}% OFF
                    </p>

                    {Number(coupon.min_purchase || 0) > 0 && (
                      <p className="text-[10px] text-gray-400 mt-1">
                        On orders above ₹
                        {Number(coupon.min_purchase).toFixed(0)}
                      </p>
                    )}

                    {coupon.max_discount && (
                      <p className="text-[10px] text-gray-400">
                        Max discount ₹
                        {Number(coupon.max_discount).toFixed(0)}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopy(coupon.code)}
                    className="shrink-0 border border-gold/40 text-gold hover:bg-gold hover:text-white px-3 py-2 rounded-sm text-[9px] uppercase tracking-widest font-bold transition-all flex items-center gap-1.5"
                  >
                    {copiedCode === coupon.code ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copy
                      </>
                    )}
                  </button>
                </div>

                {coupon.expires_at && (
                  <p className="text-[9px] text-gray-400 mt-3 pt-3 border-t border-luxury-lightgrey">
                    Valid until{" "}
                    {new Date(coupon.expires_at).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-5 pb-5">
          <button
            type="button"
            onClick={() => setVisible(false)}
            className="w-full bg-gold hover:bg-gold-dark text-white py-3 rounded-sm text-[10px] uppercase tracking-widest font-bold transition-all"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}