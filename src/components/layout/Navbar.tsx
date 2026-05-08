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
  ChefHat,
  ChevronRight
} from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const navLinks = [
  { name: "หน้าแรก", href: "/", icon: Home },
  { name: "เมนูอาหาร", href: "/menu", icon: UtensilsCrossed },
  { name: "เรื่องราวของเรา", href: "/story", icon: BookOpen },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const pathname = usePathname();
  const totalItems = useCartStore((state) => state.getTotalItems());
  const isHomePage = pathname === "/";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close drawer when route changes
  useEffect(() => {
    setIsDrawerOpen(false);
  }, [pathname]);

  const isTransparent = isHomePage && !scrolled;
  const textColor = isTransparent ? "text-white" : "text-deep-charcoal";

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 right-0 z-[60] transition-all duration-700 ${
          isTransparent 
            ? "bg-transparent py-8" 
            : "bg-white/90 backdrop-blur-2xl shadow-sm py-4"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-10 flex justify-between items-center">
          {/* Logo Section */}
          <Link href="/" className="flex items-center gap-4 group">
            <div className="relative w-12 h-12 rounded-2xl overflow-hidden shadow-2xl transition-transform group-hover:scale-110">
              <Image 
                src="/logo.jpg" 
                alt="Logo" 
                fill 
                className="object-cover"
                unoptimized
              />
            </div>
            <span className={`text-2xl font-serif font-bold tracking-tight transition-colors duration-500 ${textColor}`}>
              ครัวบ้านเจ็ม
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`text-[13px] font-bold uppercase tracking-[0.2em] transition-all duration-300 relative group ${
                  pathname === link.href
                    ? "text-mala-600"
                    : (isTransparent ? "text-white/80 hover:text-white" : "text-slate-500 hover:text-mala-600")
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-4 md:gap-8">
            <Link href="/menu" className="relative p-2 active:scale-90 transition-transform">
              <ShoppingBag className={`w-7 h-7 transition-colors duration-500 ${isTransparent ? "text-white" : "text-deep-charcoal"}`} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-6 h-6 bg-mala-600 text-white text-[10px] font-black rounded-full flex items-center justify-center ring-4 ring-white/10 animate-in zoom-in">
                  {totalItems}
                </span>
              )}
            </Link>

            <button 
              onClick={() => setIsDrawerOpen(true)}
              className={`p-2 rounded-xl transition-all active:scale-90 ${
                isTransparent ? "bg-white/10 text-white" : "bg-slate-100 text-deep-charcoal"
              }`}
            >
              <MenuIcon className="w-7 h-7" />
            </button>
          </div>
        </div>
      </nav>

      {/* Modern Glassmorphism Drawer */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70]"
            />
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-[85%] max-w-md bg-white z-[80] shadow-2xl p-10 flex flex-col"
            >
              <div className="flex justify-between items-center mb-16">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-mala-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                    <ChefHat className="w-6 h-6" />
                  </div>
                  <span className="text-xl font-serif font-bold text-deep-charcoal">เมนู</span>
                </div>
                <button 
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-3 bg-slate-100 rounded-2xl text-slate-500 hover:bg-slate-200 transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex flex-col gap-6">
                {navLinks.map((link, i) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href;
                  return (
                    <Link 
                      key={link.name} 
                      href={link.href}
                      className={`group flex items-center justify-between p-6 rounded-3xl transition-all ${
                        isActive ? "bg-mala-600 text-white shadow-xl shadow-mala-600/20" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <div className="flex items-center gap-5">
                        <Icon className={`w-6 h-6 ${isActive ? "text-white" : "text-mala-600"}`} />
                        <span className="text-lg font-bold tracking-tight">{link.name}</span>
                      </div>
                      <ChevronRight className={`w-5 h-5 transition-transform group-hover:translate-x-1 ${isActive ? "text-white/60" : "text-slate-300"}`} />
                    </Link>
                  );
                })}
              </div>

              <div className="mt-auto pt-10 border-t border-slate-100">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] text-center mb-6">
                  ศาสตร์แห่งข้อมูล ศิลป์แห่งรสชาติ
                </p>
                <Link 
                  href="/menu"
                  className="w-full bg-deep-charcoal text-white py-5 rounded-[2rem] font-bold text-center block shadow-2xl active:scale-[0.98] transition-all"
                >
                  สั่งอาหารเลย
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </>
  );
}
