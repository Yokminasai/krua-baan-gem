"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Send, 
  Loader2, 
  CheckCircle2,
  AlertCircle
} from "lucide-react";

export default function ContactForm() {
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
      setFormData({ name: "", contactInfo: "", orderId: "", type: "food", message: "" });
      
    } catch (error: any) {
      setStatus("error");
      setErrorMessage(error.message || "ไม่สามารถส่งข้อความได้ กรุณาลองใหม่อีกครั้ง");
    }
  };

  if (status === "success") {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-20 text-center space-y-6 bg-white rounded-[3rem] shadow-xl border border-slate-100"
      >
        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center shadow-lg">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <div>
          <h3 className="text-3xl font-bold text-slate-800">ส่งข้อมูลสำเร็จ!</h3>
          <p className="text-slate-500 mt-2 max-w-sm mx-auto">เราได้รับข้อมูลของคุณแล้ว และจะดำเนินการตรวจสอบโดยเร็วที่สุดครับ</p>
        </div>
        <button 
          onClick={() => setStatus("idle")}
          className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all"
        >
          ส่งข้อความอื่นเพิ่ม
        </button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 md:p-12 rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-50">
      {status === "error" && (
        <div className="bg-red-50 text-red-600 p-5 rounded-2xl flex items-start gap-4 border border-red-100">
          <AlertCircle className="w-6 h-6 shrink-0 mt-0.5" />
          <p className="font-medium">{errorMessage}</p>
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-bold text-slate-600 ml-1">ชื่อ - นามสกุล <span className="text-red-500">*</span></label>
        <input 
          required
          type="text" 
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="กรุณากรอกชื่อของคุณ"
          className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-5 focus:border-red-500 focus:bg-white outline-none transition-all shadow-sm placeholder:text-slate-400 text-lg"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold text-slate-600 ml-1">เบอร์โทรศัพท์ / อีเมล <span className="text-red-500">*</span></label>
        <input 
          required
          type="text" 
          name="contactInfo"
          value={formData.contactInfo}
          onChange={handleChange}
          placeholder="เพื่อการติดต่อกลับ (เบอร์โทร หรือ อีเมล)"
          className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-5 focus:border-red-500 focus:bg-white outline-none transition-all shadow-sm placeholder:text-slate-400 text-lg"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-600 ml-1">หมายเลขคำสั่งซื้อ <span className="text-slate-400 font-normal">(ถ้ามี)</span></label>
          <input 
            type="text" 
            name="orderId"
            value={formData.orderId}
            onChange={handleChange}
            placeholder="เช่น 12345"
            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-5 focus:border-red-500 focus:bg-white outline-none transition-all shadow-sm placeholder:text-slate-400 text-lg"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-600 ml-1">หัวข้อการติดต่อ <span className="text-red-500">*</span></label>
          <div className="relative">
            <select 
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-5 focus:border-red-500 focus:bg-white outline-none transition-all appearance-none cursor-pointer shadow-sm text-lg"
            >
              <option value="food">ปัญหาเกี่ยวกับอาหาร</option>
              <option value="service">ปัญหาการบริการ</option>
              <option value="suggestion">ข้อเสนอแนะ</option>
              <option value="other">อื่นๆ</option>
            </select>
            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold text-slate-600 ml-1">รายละเอียด <span className="text-red-500">*</span></label>
        <textarea 
          required
          name="message"
          value={formData.message}
          onChange={handleChange}
          rows={5}
          placeholder="อธิบายรายละเอียดปัญหาหรือข้อเสนอแนะ..."
          className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-5 focus:border-red-500 focus:bg-white outline-none transition-all resize-none shadow-sm placeholder:text-slate-400 text-lg"
        />
      </div>

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full bg-red-600 text-white py-6 rounded-[2rem] font-bold text-xl flex items-center justify-center gap-3 hover:bg-red-700 transition-all shadow-xl shadow-red-600/30 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-4"
      >
        {status === "loading" ? (
          <>
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>กำลังส่งข้อมูล...</span>
          </>
        ) : (
          <>
            <Send className="w-5 h-5" />
            <span>ส่งข้อความ</span>
          </>
        )}
      </button>
    </form>
  );
}
