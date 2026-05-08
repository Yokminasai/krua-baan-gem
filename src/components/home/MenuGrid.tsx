"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { MapPin, Navigation, AlertCircle, Plus, Loader2, RefreshCw } from "lucide-react";
import { calculateDistance, Coordinates } from "@/lib/geoUtils";
import ProductModal, { Product } from "./ProductModal";
import { supabase } from "@/lib/supabase";

const SHOP_COORDINATES: Coordinates = {
  lat: 13.7128, 
  lng: 100.3541,
};

const MAX_DELIVERY_RADIUS_METERS = 1000; 

export default function MenuGrid() {
  const [menuItems, setMenuItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [locationStatus, setLocationStatus] = useState<"loading" | "success" | "error" | "idle">("idle");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    // Add a safety timeout of 10 seconds
    const timeoutId = setTimeout(() => {
      if (loading) {
        setLoading(false);
        setError("การเชื่อมต่อล่าช้า กรุณาลองใหม่อีกครั้ง");
      }
    }, 10000);

    try {
      const { data, error: sbError } = await supabase
        .from('products')
        .select('*')
        .eq('is_available', true)
        .order('name', { ascending: true });

      if (sbError) throw sbError;

      if (data) {
        const mappedData = data.map((item: any) => ({
          ...item,
          optionGroups: item.option_groups
        }));
        setMenuItems(mappedData);
      }
    } catch (err: any) {
      console.error("Fetch error:", err);
      setError(err.message || "ไม่สามารถโหลดข้อมูลเมนูได้");
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  }, [loading]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const checkLocation = () => {
    setLocationStatus("loading");
    if (!navigator.geolocation) {
      setLocationStatus("error");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userCoords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(userCoords);
        const dist = calculateDistance(SHOP_COORDINATES, userCoords);
        setDistance(dist);
        setLocationStatus("success");
      },
      (error) => {
        console.error("Error getting location:", error);
        setLocationStatus("error");
      }
    );
  };

  const isDeliverable = distance !== null && distance <= MAX_DELIVERY_RADIUS_METERS;

  return (
    <section id="menu" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            className="max-w-xl"
          >
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-deep-charcoal mb-4 tracking-tight">Our Curated Menu</h2>
            <p className="text-gray-500 text-lg leading-relaxed font-light">
              รังสรรค์อย่างพิถีพิถันจากวัตถุดิบคุณภาพสู่จานโปรดของคุณ สัมผัสรสชาติอันเป็นเอกลักษณ์ของครัวบ้านเจ็ม
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.1 }}
            className="bg-creamy-white p-5 rounded-3xl flex items-center max-w-sm w-full md:w-auto shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white"
          >
            <div className="flex-1">
              <p className="text-sm font-medium text-deep-charcoal flex items-center gap-2">
                <MapPin className="w-4 h-4 text-mala-600" />
                ตรวจสอบพื้นที่จัดส่ง
              </p>
              {locationStatus === "idle" && (
                <p className="text-xs text-gray-500 mt-1">รัศมี 1 กิโลเมตรจากร้าน</p>
              )}
              {locationStatus === "loading" && (
                <p className="text-xs text-gray-500 mt-1 animate-pulse">กำลังดึงตำแหน่ง...</p>
              )}
              {locationStatus === "success" && distance !== null && (
                <div className="mt-1.5">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${isDeliverable ? 'bg-green-100 text-green-700' : 'bg-red-50 text-red-600'}`}>
                    {isDeliverable ? "อยู่ในพื้นที่จัดส่ง" : `อยู่นอกพื้นที่ (${(distance/1000).toFixed(1)} กม.)`}
                  </span>
                </div>
              )}
            </div>
            <button 
              onClick={checkLocation}
              disabled={locationStatus === "loading"}
              className="ml-5 p-3 bg-deep-charcoal text-white rounded-full hover:bg-black transition-transform active:scale-95 disabled:opacity-50"
            >
              <Navigation className={`w-4 h-4 ${locationStatus === "loading" ? "animate-spin" : ""}`} />
            </button>
          </motion.div>
        </div>

        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-12 h-12 text-mala-600 animate-spin" />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading Fresh Menu...</p>
          </div>
        ) : error ? (
          <div className="py-24 flex flex-col items-center justify-center gap-4 text-center">
            <AlertCircle className="w-12 h-12 text-red-400" />
            <p className="text-gray-500 font-medium">{error}</p>
            <button 
              onClick={fetchProducts}
              className="mt-4 flex items-center gap-2 px-6 py-2 bg-mala-600 text-white rounded-full font-bold active:scale-95 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              ลองใหม่อีกครั้ง
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {menuItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ delay: index * 0.05 }}
                className="group flex flex-col cursor-pointer active:scale-[0.98] transition-transform"
                onClick={() => setSelectedProduct(item)}
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[2.5rem] mb-5 bg-gray-100 shadow-sm isolate">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="absolute bottom-4 right-4 w-12 h-12 bg-white rounded-full flex items-center justify-center text-mala-600 shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <Plus className="w-6 h-6" />
                  </div>
                </div>
                
                <div className="px-2">
                  <div className="flex justify-between items-start gap-4 mb-2">
                    <h3 className="text-xl font-serif font-semibold text-deep-charcoal leading-tight group-hover:text-mala-600 transition-colors">{item.name}</h3>
                    <span className="text-lg font-bold text-mala-600 shrink-0">฿{item.price}</span>
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-2 mt-1 font-light leading-relaxed">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <ProductModal 
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </section>
  );
}
