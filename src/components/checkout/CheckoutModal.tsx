"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  ChevronRight, 
  MapPin, 
  Phone, 
  ShoppingBag, 
  ArrowLeft,
  Lock,
  Loader2,
  UploadCloud,
  FileCheck,
  AlertTriangle
} from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import LocationPicker from "./LocationPicker";
import PaymentSection from "./PaymentSection";
import { supabase } from "@/lib/supabase";
import { calculateDistance, SHOP_COORDINATES } from "@/lib/geoUtils";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (orderId: string) => void;
}

type CheckoutStep = "details" | "payment";
const MAX_DISTANCE_METERS = 1000; // 1KM Limit

export default function CheckoutModal({ isOpen, onClose, onConfirm }: CheckoutModalProps) {
  const [step, setStep] = useState<CheckoutStep>("details");
  const { items, getTotalPrice, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [slip, setSlip] = useState<File | null>(null);
  const [slipPreview, setSlipPreview] = useState<string | null>(null);

  const totalPrice = getTotalPrice();

  useEffect(() => {
    if (location) {
        const d = calculateDistance(SHOP_COORDINATES, location);
        setDistance(d);
    }
  }, [location]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSlip(file);
      const reader = new FileReader();
      reader.onloadend = () => setSlipPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const isTooFar = distance !== null && distance > MAX_DISTANCE_METERS;

  const handleSubmit = async () => {
    if (!name || !phone || !slip) {
        alert("กรุณากรอกข้อมูลและอัปโหลดสลิปชำระเงินครับ");
        return;
    }

    setLoading(true);
    try {
      const fileExt = slip.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `slips/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('order_slips')
        .upload(filePath, slip);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('order_slips')
        .getPublicUrl(filePath);

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          name,
          phone,
          address,
          location_url: location ? `https://www.google.com/maps?q=${location.lat},${location.lng}` : null,
          total_amount: totalPrice,
          status: 'pending',
          slip_url: publicUrl
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = items.map(item => ({
        order_id: order.id,
        menu_id: item.id, // เพิ่มบรรทัดนี้
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        options: item.options
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      localStorage.setItem("KruaBaanGem_OrderID", order.id);
      clearCart();
      onConfirm(order.id);
      
    } catch (error: any) {
      console.error(error);
      alert("เกิดข้อผิดพลาด: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="relative bg-[#fcf9f5] w-full max-w-2xl md:rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[96vh]"
          >
            {/* Header */}
            <div className="p-6 md:p-8 flex items-center justify-between border-b border-gray-100 bg-white/50 backdrop-blur-sm sticky top-0 z-20">
              <div className="flex items-center gap-4">
                {step !== "details" && (
                    <button 
                        onClick={() => setStep("details")}
                        className="p-3 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6 text-gray-500" />
                    </button>
                )}
                <div>
                  <h2 className="text-2xl font-serif font-bold text-[#2b1f1f]">ยืนยันการสั่งซื้อ</h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`w-2 h-2 rounded-full ${step === 'details' ? 'bg-mala-500' : 'bg-green-500'}`} />
                    <span className="text-xs uppercase tracking-[0.1em] font-bold text-gray-400">
                      {step === 'details' ? 'ส่วนที่ 1: ข้อมูลจัดส่ง' : 'ส่วนที่ 2: ชำระเงิน'}
                    </span>
                  </div>
                </div>
              </div>
              <button onClick={onClose} className="p-3 bg-gray-100 rounded-full text-gray-400 hover:text-red-500 transition-all">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar overscroll-contain">
              <div className="p-6 md:p-8 space-y-10 pb-24">
                
                {step === "details" ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                    {/* Customer Info Section */}
                    <section className="space-y-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-mala-50 flex items-center justify-center text-mala-600">
                          <Phone className="w-5 h-5" />
                        </div>
                        <h3 className="text-xl font-bold text-[#2b1f1f]">ข้อมูลติดต่อ</h3>
                      </div>
                      
                      <div className="space-y-5">
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-500 ml-1">ชื่อผู้รับ <span className="text-red-500">*</span></label>
                          <input 
                            type="text" 
                            placeholder="กรอกชื่อของคุณ"
                            className="w-full bg-white border-2 border-gray-100 rounded-2xl p-5 text-lg font-medium focus:border-mala-500 outline-none transition-all shadow-sm"
                            value={name}
                            onChange={e => setName(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-500 ml-1">เบอร์โทรศัพท์ <span className="text-red-500">*</span></label>
                          <input 
                            type="tel" 
                            placeholder="08X-XXX-XXXX"
                            className="w-full bg-white border-2 border-gray-100 rounded-2xl p-5 text-lg font-medium focus:border-mala-500 outline-none transition-all shadow-sm"
                            value={phone}
                            onChange={e => setPhone(e.target.value)}
                          />
                        </div>
                      </div>
                    </section>

                    {/* Delivery Section */}
                    <section className="space-y-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                          <MapPin className="w-5 h-5" />
                        </div>
                        <h3 className="text-xl font-bold text-[#2b1f1f]">สถานที่จัดส่ง (ไม่เกิน 1 กม.)</h3>
                      </div>

                      <div className="bg-white p-5 rounded-[2.5rem] border-2 border-gray-100 shadow-sm space-y-6">
                        <LocationPicker onLocationSelect={(lat, lng) => setLocation({ lat, lng })} />
                        
                        {isTooFar && (
                            <div className="flex items-start gap-3 p-4 bg-red-50 text-red-700 rounded-2xl border border-red-100 animate-pulse">
                                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                                <div className="text-sm font-bold">
                                    อยู่นอกรัศมี 1 กม. (ห่างไป {(distance!/1000).toFixed(2)} กม.)
                                    <p className="font-light text-xs mt-1">ขออภัยครับ ร้านให้บริการจัดส่งในระยะ 1 กม. เท่านั้น</p>
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-500 ml-1">รายละเอียดที่อยู่ / จุดสังเกต</label>
                            <textarea 
                                rows={3}
                                placeholder="เช่น บ้านเลขที่ 123 หรือ จุดสังเกตหน้าปากซอย..."
                                className="w-full bg-slate-50 border-none rounded-2xl p-5 text-lg font-medium focus:ring-2 focus:ring-mala-500 outline-none transition-all"
                                value={address}
                                onChange={e => setAddress(e.target.value)}
                            />
                        </div>
                      </div>
                    </section>
                  </motion.div>
                ) : (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                    {/* Simplified Order Summary */}
                    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <ShoppingBag className="w-6 h-6 text-mala-600" />
                                <span className="font-bold text-lg">ยอดชำระสุทธิ</span>
                            </div>
                            <span className="text-3xl font-bold text-mala-600 font-mono">฿{totalPrice.toLocaleString()}</span>
                        </div>
                    </div>

                    <PaymentSection />

                    {/* Slip Upload Area */}
                    <section className="space-y-5">
                        <div className="flex items-center gap-3">
                            <FileCheck className="w-6 h-6 text-green-600" />
                            <h3 className="text-xl font-bold text-[#2b1f1f]">แนบสลิปเพื่อยืนยัน</h3>
                        </div>
                        
                        {!slipPreview ? (
                            <label className="flex flex-col items-center justify-center w-full h-56 border-4 border-dashed border-gray-100 rounded-[2.5rem] bg-white cursor-pointer hover:bg-mala-50/30 hover:border-mala-200 transition-all">
                                <UploadCloud className="w-10 h-10 text-mala-300 mb-3" />
                                <p className="text-lg font-bold text-slate-600">แตะเพื่ออัปโหลดสลิป</p>
                                <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-bold italic">Click to upload</p>
                                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                            </label>
                        ) : (
                            <div className="relative aspect-[3/4] w-full max-w-[260px] mx-auto rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white">
                                <img src={slipPreview} alt="Slip Preview" className="w-full h-full object-cover" />
                                <button 
                                    onClick={() => { setSlip(null); setSlipPreview(null); }}
                                    className="absolute top-4 right-4 p-3 bg-red-500 text-white rounded-full shadow-lg active:scale-90"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                    </section>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Footer Button */}
            <div className="p-6 bg-white border-t border-gray-100">
                {step === "details" ? (
                    <button
                        onClick={() => {
                            if (!name || !phone) alert("กรุณากรอกชื่อและเบอร์โทรศัพท์ครับ");
                            else if (isTooFar) alert("ขออภัยครับ ระยะทางเกิน 1 กม. ไม่สามารถสั่งได้ครับ");
                            else setStep("payment");
                        }}
                        disabled={isTooFar || !location}
                        className="w-full bg-mala-600 text-white py-5 rounded-[2rem] font-bold text-xl flex items-center justify-center gap-3 hover:bg-mala-700 transition-all shadow-xl shadow-mala-600/20 active:scale-[0.98] disabled:opacity-50 disabled:grayscale"
                    >
                        <span>ไปหน้าชำระเงิน</span>
                        <ChevronRight className="w-6 h-6" />
                    </button>
                ) : (
                    <div className="flex flex-col gap-4">
                         <button
                            onClick={handleSubmit}
                            disabled={loading || !slip}
                            className="w-full bg-green-600 text-white py-5 rounded-[2rem] font-bold text-xl flex items-center justify-center gap-3 hover:bg-green-700 transition-all shadow-xl shadow-green-600/20 active:scale-[0.98] disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                    <span>กำลังส่งข้อมูล...</span>
                                </>
                            ) : (
                                <>
                                    <Lock className="w-5 h-5" />
                                    <span>สั่งอาหารเลย!</span>
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
