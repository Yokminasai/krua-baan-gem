"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/home/Hero";
import Philosophy from "@/components/home/Philosophy";
import MenuGrid from "@/components/home/MenuGrid";
import ContactSection from "@/components/home/ContactSection";
import CheckoutModal from "@/components/checkout/CheckoutModal";
import OrderTracker from "@/components/tracking/OrderTracker";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";

export default function Home() {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const { getTotalItems } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check for existing active order on mount
    const savedOrderId = localStorage.getItem("KruaBaanGem_OrderID");
    if (savedOrderId) {
      setActiveOrderId(savedOrderId);
    }
  }, []);

  const handleConfirmOrder = (orderId: string) => {
    setActiveOrderId(orderId);
    setIsCheckoutOpen(false);
  };

  const totalItems = mounted ? getTotalItems() : 0;

  return (
    <main className="min-h-screen bg-[#fcf9f5] relative pb-24 overflow-x-hidden">
      <Navbar />
      <div className="relative z-0">
        <Hero />
        <Philosophy />
        <MenuGrid />
        <ContactSection />
      </div>

      {/* Floating Checkout/Tracker Button */}
      <div className="fixed bottom-8 right-8 z-40">
        {!activeOrderId ? (
          <button
            onClick={() => setIsCheckoutOpen(true)}
            className="group relative flex items-center justify-center w-16 h-16 bg-mala-600 text-white rounded-full shadow-2xl hover:shadow-mala-600/50 hover:bg-mala-700 transition-all active:scale-95"
          >
            <ShoppingCart className="w-6 h-6" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-white text-mala-600 text-[10px] font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-lg border border-mala-100">
                {totalItems}
              </span>
            )}
          </button>
        ) : (
          <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-mala-100 max-w-sm">
            <h3 className="text-sm font-semibold text-deep-charcoal mb-3">Current Order Tracking</h3>
            <OrderTracker orderId={activeOrderId} />
            <button 
              onClick={() => {
                localStorage.removeItem("KruaBaanGem_OrderID");
                setActiveOrderId(null);
              }}
              className="mt-4 text-xs text-red-500 hover:underline w-full text-center"
            >
              Clear Order Demo
            </button>
          </div>
        )}
      </div>

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onConfirm={handleConfirmOrder}
      />
    </main>
  );
}
