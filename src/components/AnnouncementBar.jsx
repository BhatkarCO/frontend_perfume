"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

export default function AnnouncementBar() {
  const [showBar, setShowBar] = useState(false);

  useEffect(() => {
    const isClosed = sessionStorage.getItem("announcementClosed");

    if (!isClosed) {
      setShowBar(true);
    }
  }, []);

  const handleClose = () => {
    sessionStorage.setItem("announcementClosed", "true");
    setShowBar(false);
  };

  if (!showBar) return null;

  return (
    <div className="bg-black text-white text-sm py-2 relative flex items-center justify-center">
      <p className="tracking-wider uppercase">
        Free Shipping on Orders Above ₹1500 • Handcrafted in India
      </p>

      <button
        onClick={handleClose}
        className="absolute right-5 hover:text-gray-300 transition"
        aria-label="Close announcement"
      >
        <X size={18} />
      </button>
    </div>
  );
}