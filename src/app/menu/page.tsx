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
  RefreshCw
} from "lucide-react";
import Image from "next/image";
import ProductModal, { Product } from "@/components/home/ProductModal";

const CATEGORIES = [
  { id: "all", name: "ทั้งหมด", icon: Utensils },
  { id: "mala", name: "หม่าล่า & มาม่าเกาหลี", icon: Flame },
  { id: "main", name: "อาหารจานเดียว", icon: ChefHat },
  { id: "healthy", name: "สุขภาพ & ของหวาน", icon: Leaf },
];

export default function MenuPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

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
    <main className="min-h-screen bg-[#fcf9f5]">
      <Navbar />
      
      <div className="pt-32 pb-16 px-4 bg-white border-b border-mala-100">
        <div className="max-w-7xl mx-auto text-center">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-mala-50 text-mala-600 text-xs font-black uppercase tracking-widest mb-6"
            >
                <ChefHat className="w-4 h-4" />
                Gem's Kitchen Selection
            </motion.div>
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-deep-charcoal mb-6">เมนูทั้งหมดของเรา</h1>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto font-light">สัมผัสรสชาติที่รังสรรค์อย่างพิถีพิถัน แบ่งตามความชอบของคุณ</p>
        </div>
      </div>

      <div className="sticky top-20 z-30 bg-white/80 backdrop-blur-xl border-b border-mala-100 px-4">
        <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-start md:justify-center gap-2 md:gap-8 overflow-x-auto py-4 no-scrollbar">
                {CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    const isActive = activeCategory === cat.id;
                    return (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-black transition-all whitespace-nowrap active:scale-95 ${
                                isActive ? "bg-mala-600 text-white shadow-lg" : "text-gray-400 hover:text-mala-600"
                            }`}
                        >
                            <Icon className="w-4 h-4" />
                            {cat.name}
                        </button>
                    );
                })}
            </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16">
        {loading ? (
            <div className="py-32 flex flex-col items-center justify-center gap-4 text-center">
                <Loader2 className="w-12 h-12 text-mala-600 animate-spin" />
                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Preparing your menu...</p>
            </div>
        ) : error ? (
            <div className="py-32 flex flex-col items-center justify-center gap-4 text-center">
                <AlertCircle className="w-12 h-12 text-red-400" />
                <p className="text-gray-500 font-medium">{error}</p>
                <button onClick={fetchProducts} className="mt-4 flex items-center gap-2 px-8 py-3 bg-mala-600 text-white rounded-full font-bold active:scale-95 shadow-lg">
                    <RefreshCw className="w-4 h-4" /> ลองอีกครั้ง
                </button>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                <AnimatePresence mode="wait">
                  {filteredProducts.map((item) => (
                      <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true, amount: 0.1 }}
                          className="group bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl border border-mala-50 transition-all cursor-pointer active:scale-[0.98]"
                          onClick={() => setSelectedProduct(item)}
                      >
                          <div className="relative aspect-[4/3] overflow-hidden">
                              <Image src={item.image} alt={item.name} fill className="object-cover" unoptimized />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <div className="p-8">
                              <div className="flex justify-between items-start mb-4">
                                  <h3 className="text-xl font-serif font-bold text-deep-charcoal">{item.name}</h3>
                                  <span className="text-xl font-black text-mala-600">฿{item.price}</span>
                              </div>
                              <p className="text-gray-500 text-sm font-light line-clamp-2">{item.description}</p>
                          </div>
                      </motion.div>
                  ))}
                </AnimatePresence>
            </div>
        )}
      </div>

      <ProductModal product={selectedProduct} isOpen={!!selectedProduct} onClose={() => setSelectedProduct(null)} />
    </main>
  );
}
