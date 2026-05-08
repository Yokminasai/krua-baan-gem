"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  ShoppingBag, 
  Menu as MenuIcon, 
  X, 
  Home, 
  UtensilsCrossed, 
  BookOpen, 
  User,
  ChefHat
} from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { name: "หน้าแรก", href: "/", icon: Home },
  { name: "เมนู", href: "/menu", icon: UtensilsCrossed },
  { name: "เรื่องราว", href: "/story", icon: BookOpen },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const totalItems = useCartStore((state) => state.getTotalItems());

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Top Header - Desktop & Mobile */}
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled 
            ? "bg-white/80 backdrop-blur-xl shadow-sm py-3" 
            : "bg-transparent py-6"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-mala-600 rounded-xl flex items-center justify-center shadow-lg shadow-mala-600/20 group-hover:rotate-6 transition-transform">
              <ChefHat className="w-6 h-6 text-white" />
            </div>
            <span className={`text-xl font-serif font-bold tracking-tight ${
              scrolled || pathname !== "/" ? "text-deep-charcoal" : "text-white"
            }`}>
              ครัวบ้านเจ็ม
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`text-sm font-bold uppercase tracking-widest transition-colors ${
                  pathname === link.href
                    ? "text-mala-600"
                    : (scrolled || pathname !== "/" ? "text-slate-500 hover:text-mala-600" : "text-white/80 hover:text-white")
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Desktop Cart */}
          <div className="flex items-center gap-4">
            <Link 
              href="/menu" 
              className="hidden md:flex h-11 px-6 bg-mala-600 text-white rounded-full items-center justify-center font-bold text-sm shadow-xl shadow-mala-600/20 active:scale-95 transition-all"
            >
              สั่งอาหารเลย
            </Link>
            
            <Link href="/menu" className="relative p-2 group">
              <ShoppingBag className={`w-6 h-6 transition-colors ${
                scrolled || pathname !== "/" ? "text-deep-charcoal" : "text-white"
              }`} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-mala-600 text-white text-[10px] font-black rounded-full flex items-center justify-center ring-2 ring-white">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Tab Bar - Professional iPhone Feel */}
      <div className="md:hidden fixed bottom-6 left-6 right-6 z-[100]">
        <div className="bg-deep-charcoal/90 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 shadow-2xl p-2 flex items-center justify-between">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link 
                key={link.name} 
                href={link.href}
                className={`flex-1 flex flex-col items-center gap-1 py-3 transition-all ${
                  isActive ? "text-white" : "text-white/40"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "scale-110" : "scale-100"} transition-transform`} />
                <span className="text-[10px] font-bold uppercase tracking-widest">{link.name}</span>
                {isActive && (
                  <motion.div 
                    layoutId="activeTab" 
                    className="w-1 h-1 bg-mala-500 rounded-full mt-0.5" 
                  />
                )}
              </Link>
            );
          })}
          
          {/* User / Profile or POS link for admin */}
          <Link 
            href="/pos"
            className="flex-1 flex flex-col items-center gap-1 py-3 text-white/40"
          >
            <User className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-widest">แอดมิน</span>
          </Link>
        </div>
      </div>

      <style jsx global>{`
        /* Hide navbar on scroll down, show on scroll up for mobile if needed */
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </>
  );
}
