"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/layout/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChefHat, 
  Utensils, 
  Plus, 
  Loader2, 
  ChevronRight,
  Flame,
  Leaf,
  AlertCircle,
  RefreshCw,
  ShoppingBag
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import ProductModal, { Product } from "@/components/home/ProductModal";
import { useCartStore } from "@/store/useCartStore";

const CATEGORIES = [
  { id: "all", name: "ทั้งหมด", icon: Utensils },
  { id: "mala", name: "หม่าล่า", icon: Flame },
  { id: "main", name: "จานเดียว", icon: ChefHat },
  { id: "healthy", name: "สุขภาพ", icon: Leaf },
];

export default function MenuPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const totalItems = useCartStore((state) => state.getTotalItems());

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    const timeoutId = setTimeout(() => {
      if (loading) {
        setLoading(false);
        setError("การเชื่อมต่อล้มเหลว กรุณาลองใหม่อีกครั้ง");
      }
    }, 12000);

    try {
      const { data, error: sbError } = await supabase.from('products').select('*');
      if (sbError) throw sbError;
      if (data) {
        const mappedData = data.map(item => ({
          ...item,
          optionGroups: item.option_groups
        }));
        setProducts(mappedData);
      }
    } catch (err: any) {
      console.error("Fetch Error:", err);
      setError(err.message || "ไม่สามารถดึงข้อมูลเมนูได้");
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  }, [loading]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = activeCategory === "all" 
    ? products 
    : products.filter(p => p.category === activeCategory);

  return (
    <main className="min-h-screen bg-[#f8f9fa] pb-32">
      <Navbar />
      
      {/* Header - Minimal & Elegant */}
      <div className="pt-32 pb-12 px-6 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto">
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[10px] font-black text-mala-600 uppercase tracking-[0.3em] mb-3 block"
            >
                Authentic Flavors
            </motion.span>
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-deep-charcoal mb-4">เมนู ครัวบ้านเจ็ม</h1>
            <p className="text-gray-500 text-sm md:text-lg max-w-xl font-light">สัมผัสรสชาติหม่าล่าและอาหารตามสั่งที่รังสรรค์อย่างพิถีพิถันจากวัตถุดิบคุณภาพ</p>
        </div>
      </div>

      {/* Categories Scroller - Native App Style */}
      <div className="sticky top-20 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center gap-3 overflow-x-auto py-5 no-scrollbar">
                {CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    const isActive = activeCategory === cat.id;
                    return (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[13px] font-bold transition-all whitespace-nowrap active:scale-95 ${
                                isActive 
                                  ? "bg-deep-charcoal text-white shadow-xl shadow-slate-900/10" 
                                  : "bg-white text-slate-500 border border-slate-200 hover:border-mala-200 hover:text-mala-600"
                            }`}
                        >
                            <Icon className={`w-4 h-4 ${isActive ? "text-mala-400" : ""}`} />
                            {cat.name}
                        </button>
                    );
                })}
            </div>
        </div>
      </div>

      {/* Menu Grid - Professional iPhone Feel */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {loading ? (
            <div className="py-32 flex flex-col items-center justify-center gap-4 text-center">
                <Loader2 className="w-12 h-12 text-mala-600 animate-spin" />
                <p className="text-slate-300 font-bold uppercase tracking-widest text-[10px]">Refreshing Flavors...</p>
            </div>
        ) : error ? (
            <div className="py-32 flex flex-col items-center justify-center gap-4 text-center">
                <AlertCircle className="w-12 h-12 text-red-400" />
                <p className="text-gray-500 font-medium">{error}</p>
                <button onClick={fetchProducts} className="mt-4 px-8 py-3 bg-mala-600 text-white rounded-full font-bold active:scale-95 shadow-lg">
                    ลองใหม่อีกครั้ง
                </button>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <AnimatePresence mode="wait">
                  {filteredProducts.map((item, index) => (
                      <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 15 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true, amount: 0.1 }}
                          transition={{ delay: index * 0.05 }}
                          className="group bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl border border-slate-100 transition-all cursor-pointer active:scale-[0.98]"
                          onClick={() => setSelectedProduct(item)}
                      >
                          <div className="relative aspect-[16/11] overflow-hidden">
                              <Image src={item.image} alt={item.name} fill className="object-cover transition-transform duration-700 group-hover:scale-105" unoptimized />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                              <div className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-mala-600 shadow-lg scale-0 group-hover:scale-100 transition-transform">
                                <Plus className="w-5 h-5" />
                              </div>
                          </div>
                          <div className="p-7">
                              <div className="flex justify-between items-start mb-3">
                                  <h3 className="text-lg font-bold text-deep-charcoal leading-tight">{item.name}</h3>
                                  <span className="text-lg font-black text-mala-600">฿{item.price}</span>
                              </div>
                              <p className="text-slate-400 text-xs font-light line-clamp-2 leading-relaxed">{item.description}</p>
                              <div className="mt-6 pt-5 border-t border-slate-50 flex items-center justify-between">
                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{item.category}</span>
                                <button className="text-xs font-bold text-mala-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                                  สั่งเลย <ChevronRight className="w-4 h-4" />
                                </button>
                              </div>
                          </div>
                      </motion.div>
                  ))}
                </AnimatePresence>
            </div>
        )}
      </div>

      {/* Professional Floating Cart Button */}
      <AnimatePresence>
        {totalItems > 0 && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-28 left-6 right-6 z-[90] md:hidden"
          >
            <Link 
              href="/menu" // Should lead to checkout/cart modal or page
              className="bg-mala-600 text-white p-5 rounded-[2rem] shadow-2xl flex items-center justify-between shadow-mala-600/30 active:scale-[0.98] transition-transform"
            >
              <div className="flex items-center gap-4">
                <div className="relative">
                  <ShoppingBag className="w-6 h-6" />
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-white text-mala-600 text-[10px] font-black rounded-full flex items-center justify-center shadow-md">
                    {totalItems}
                  </span>
                </div>
                <div>
                  <p className="text-[10px] font-black text-white/60 uppercase tracking-widest">Your Order</p>
                  <p className="text-sm font-bold">ดูตะกร้าสินค้า</p>
                </div>
              </div>
              <ChevronRight className="w-6 h-6" />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      <ProductModal product={selectedProduct} isOpen={!!selectedProduct} onClose={() => setSelectedProduct(null)} />
    </main>
  );
}
