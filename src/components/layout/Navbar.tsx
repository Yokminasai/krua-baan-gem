"use client";

import { useState, useEffect } from "react";
import { ShoppingBag, Menu, X, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/store/useCartStore";
import { motion } from "framer-motion";

export default function Navbar() {
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 150) {
        setHidden(true);
        setMobileMenuOpen(false);
      } else {
        setHidden(false);
      }
      setScrolled(currentScrollY > 50);
      setLastScrollY(currentScrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const navLinks = [
    { name: "เมนูทั้งหมด", href: "/menu" },
    { name: "เรื่องราวของเรา", href: "/story" },
    { name: "ติดต่อเรา", href: "/#contact" },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 inset-x-0 z-[100] transition-all duration-500 ease-in-out ${
          hidden ? "-translate-y-full" : "translate-y-0"
        } ${
          scrolled || mobileMenuOpen
            ? "bg-white/90 backdrop-blur-xl shadow-lg py-3"
            : "bg-white md:bg-transparent py-4 md:py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20 md:h-24">
            {/* Logo Section */}
            <Link href="/" className="flex-shrink-0 flex items-center cursor-pointer gap-3 group">
              <div className="relative w-10 h-10 md:w-14 md:h-14 rounded-2xl overflow-hidden shadow-lg border-2 border-white transition-transform duration-300 rotate-2 group-active:scale-95">
                <Image src="/logo.jpg" alt="Logo" fill className="object-cover" unoptimized />
              </div>
              <div className="flex flex-col">
                <span className={`font-serif text-xl md:text-2xl font-bold leading-none mb-1 ${
                  scrolled || mobileMenuOpen ? "text-mala-800" : "text-mala-800 md:text-white"
                }`}>
                  ครัวบ้านเจ็ม
                </span>
                <span className={`hidden md:block text-[10px] uppercase tracking-widest font-bold ${
                  scrolled || mobileMenuOpen ? "text-mala-600/60" : "text-white/80"
                }`}>
                  Gem's Kitchen
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-10">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-sm font-bold transition-colors relative group ${
                    scrolled || mobileMenuOpen ? "text-slate-700" : "text-slate-700 md:text-white"
                  }`}
                >
                  {link.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-mala-600 transition-all group-hover:w-full" />
                </Link>
              ))}
              <Link
                href="/menu"
                className="px-8 py-3 bg-mala-600 text-white text-sm font-bold rounded-2xl hover:bg-mala-700 shadow-lg shadow-mala-600/20 active:scale-95 transition-all"
              >
                สั่งอาหาร
              </Link>
            </div>

            {/* Mobile Actions */}
            <div className="flex md:hidden items-center gap-3">
              <Link href="/menu" className="p-2.5 bg-mala-600 text-white rounded-xl shadow-md active:scale-95">
                <ShoppingBag className="w-5 h-5" />
              </Link>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2.5 bg-slate-100 text-slate-600 rounded-xl active:scale-95"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Drawer - Smooth Height with CSS */}
        <div className={`md:hidden bg-white border-t border-gray-50 overflow-hidden transition-all duration-300 ease-in-out ${
          mobileMenuOpen ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
        }`}>
          <div className="p-6 space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 text-slate-700 font-bold active:bg-mala-50 active:text-mala-600 transition-all"
              >
                {link.name}
                <ChevronRight className="w-4 h-4 text-slate-300" />
              </Link>
            ))}
          </div>
        </div>
      </nav>
      <div className="h-20 md:h-24" />
    </>
  );
}
