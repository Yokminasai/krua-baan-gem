"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MessageCircle, 
  X, 
  Send, 
  Loader2, 
  CheckCircle2,
  AlertCircle
} from "lucide-react";

export default function ContactSupportModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    contactInfo: "",
    orderId: "",
    type: "food",
    message: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.contactInfo || !formData.message) return;

    setStatus("loading");
    setErrorMessage("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "เกิดข้อผิดพลาดในการส่งข้อมูล");
      }

      setStatus("success");
      setTimeout(() => {
        setIsOpen(false);
        setStatus("idle");
        setFormData({ name: "", contactInfo: "", orderId: "", type: "food", message: "" });
      }, 3000);
      
    } catch (error: any) {
      setStatus("error");
      setErrorMessage(error.message || "ไม่สามารถส่งข้อความได้ กรุณาลองใหม่อีกครั้ง");
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-40 bg-red-600 text-white p-4 rounded-full shadow-2xl hover:bg-red-700 transition-colors flex items-center justify-center group"
      >
        <MessageCircle className="w-7 h-7" />
        <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs group-hover:ml-2 transition-all duration-300 ease-in-out font-bold text-sm">
          ติดต่อ / ร้องเรียน
        </span>
      </motion.button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ y: 50, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="bg-red-600 p-6 text-white flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold font-serif">ติดต่อ / ร้องเรียน</h2>
                  <p className="text-red-100 text-sm mt-1">ครัวบ้านเจ็มยินดีรับฟังทุกความคิดเห็นครับ</p>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar">
                {status === "success" ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-10 text-center space-y-4"
                  >
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800">ส่งข้อความสำเร็จ!</h3>
                    <p className="text-slate-500">เราได้รับข้อมูลของคุณแล้ว และจะดำเนินการตรวจสอบโดยเร็วที่สุดครับ</p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {status === "error" && (
                      <div className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-start gap-3 border border-red-100">
                        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                        <p className="text-sm font-medium">{errorMessage}</p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 ml-1">ชื่อ - นามสกุล <span className="text-red-500">*</span></label>
                      <input 
                        required
                        type="text" 
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="กรุณากรอกชื่อของคุณ"
                        className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-4 focus:border-red-500 focus:bg-white outline-none transition-all"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 ml-1">เบอร์โทรศัพท์ / อีเมล <span className="text-red-500">*</span></label>
                      <input 
                        required
                        type="text" 
                        name="contactInfo"
                        value={formData.contactInfo}
                        onChange={handleChange}
                        placeholder="เพื่อการติดต่อกลับ"
                        className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-4 focus:border-red-500 focus:bg-white outline-none transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">หมายเลขคำสั่งซื้อ <span className="text-slate-400 font-normal">(ถ้ามี)</span></label>
                        <input 
                          type="text" 
                          name="orderId"
                          value={formData.orderId}
                          onChange={handleChange}
                          placeholder="เช่น 12345"
                          className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-4 focus:border-red-500 focus:bg-white outline-none transition-all"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">หัวข้อการติดต่อ <span className="text-red-500">*</span></label>
                        <select 
                          name="type"
                          value={formData.type}
                          onChange={handleChange}
                          className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-4 focus:border-red-500 focus:bg-white outline-none transition-all appearance-none cursor-pointer"
                        >
                          <option value="food">ปัญหาเกี่ยวกับอาหาร</option>
                          <option value="service">ปัญหาการบริการ</option>
                          <option value="suggestion">ข้อเสนอแนะ</option>
                          <option value="other">อื่นๆ</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 ml-1">รายละเอียด <span className="text-red-500">*</span></label>
                      <textarea 
                        required
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        rows={4}
                        placeholder="อธิบายรายละเอียดปัญหาหรือข้อเสนอแนะ..."
                        className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-4 focus:border-red-500 focus:bg-white outline-none transition-all resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={status === "loading"}
                      className="w-full bg-red-600 text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-red-700 transition-all shadow-lg shadow-red-600/30 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                    >
                      {status === "loading" ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>กำลังส่ง...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          <span>ส่งข้อความ</span>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
