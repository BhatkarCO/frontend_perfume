"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, Suspense } from "react";
import dynamic from "next/dynamic";
import { Navbar } from "@/components/Navbar";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { MobileBottomBar } from "@/components/MobileBottomBar";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";

// Dynamically import client-only, non-immediate widgets to optimize initial page bundle size
const CartDrawer = dynamic(() => import("@/components/CartDrawer").then((mod) => mod.CartDrawer), {
  ssr: false,
});

const AIBot = dynamic(() => import("@/components/AIBot").then((mod) => mod.AIBot), {
  ssr: false,
});

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAdmin, isAuthenticated } = useAuth();

  const isAdminPath = pathname && pathname.startsWith("/admin");

  // Redirect admin users to the admin panel if they land on any retail store page
  useEffect(() => {
    if (isAuthenticated && isAdmin && !isAdminPath) {
      router.push("/admin");
    }
  }, [isAuthenticated, isAdmin, isAdminPath, router]);

  // If the route is an admin page or the logged-in user is an admin, hide the retail storefront layout
  if (isAdminPath || (isAuthenticated && isAdmin)) {
    return (
      <div className="flex flex-col min-h-screen bg-luxury-deep text-luxury-black">
        <main className="flex-1">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-luxury-deep text-luxury-black">
      {/* Top Navbar */}
      <AnnouncementBar />
      <Navbar />

      {/* Shopping Bag Drawer */}
      <CartDrawer />

      {/* Main Content Area */}
      <main className="flex-1 pb-20 md:pb-0">
        {children}
      </main>

      {/* Floating Widgets */}
      <WhatsAppButton />
      <AIBot />

      {/* Mobile Bottom Navigation Bar */}
      <Suspense fallback={null}>
        <MobileBottomBar />
      </Suspense>

      {/* Luxury Footer */}
      <Footer />
    </div>
  );
}
