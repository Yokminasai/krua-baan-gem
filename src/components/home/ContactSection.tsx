"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, MapPin, ExternalLink, X, MessageCircle } from "lucide-react";
import Image from "next/image";

export default function ContactSection() {
  const [isLineQrOpen, setIsLineQrOpen] = useState(false);
  const shopPhone = "095-5420726";
  const linemanUrl = "https://www.wongnai.com/delivery/businesses/3591648Kt/order";
  const googleMapsUrl = "https://www.google.com/maps/place/%E0%B8%84%E0%B8%A3%E0%B8%B1%E0%B8%A7%E0%B8%9B%E0%B8%Bา%E0%B8%99%E0%B9%80%E0%B8%88%E0%B9%87%E0%B8%A1+%E0%B8%AB%E0%B8%A1%E0%B9%88%E0%B8%B2%E0%B8%A5%E0%B9%88%E0%B8%B2%E0%B8%97%E0%B8%B1%E0%B9%88%E0%B8%87%2F%E0%B8%81%E0%B8%A5%E0%B9%83%E0%B8%A7%E0%B8%A2%E0%B8%97%E0%B8%AD%E0%B8%94%E0%B9%82%E0%B8%A1%E0%B9%80%E0%B8%A5%E0%B8%99+-+%E0%B8%8B%E0%B8%AD%E0%B8%A2%E0%B8%82%E0%B8%99%E0%B8%A1%E0%B8%AB%E0%B8%A7%E0%B8%B2%E0%B8%99/@13.6763556,100.3403502,178m";

  return (
    <section id="contact" className="py-24 bg-[#fcf9f5] overflow-hidden">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col md:flex-row gap-12 items-center">
          
          {/* Left Side: Contact Cards */}
          <div className="w-full md:w-1/2 space-y-6 order-2 md:order-1">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#2b1f1f] leading-tight">
                แวะมาหาเรา หรือ <br />
                <span className="text-mala-600">สั่งความอร่อยถึงบ้าน</span>
              </h2>
              <p className="text-gray-500 text-lg font-light leading-relaxed">
                เราตั้งใจปรุงทุกเมนูด้วยหัวใจ แวะมาทานร้อนๆ ที่ร้าน หรือจะสั่งผ่านช่องทางเดลิเวอรี่ที่เราเตรียมไว้ให้ก็ได้เช่นกัน
              </p>
            </motion.div>

            <div className="grid grid-cols-1 gap-4 pt-4">
              {/* Phone Card */}
              <motion.a
                href={`tel:${shopPhone.replace(/-/g, "")}`}
                whileHover={{ scale: 1.01 }}
                className="flex items-center gap-6 p-6 rounded-3xl border border-gray-100 shadow-sm bg-white transition-all group"
              >
                <div className="w-14 h-14 rounded-2xl bg-mala-50 flex items-center justify-center text-mala-600 group-hover:bg-mala-600 group-hover:text-white transition-colors">
                  <Phone className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">โทรสอบถาม / สั่งอาหาร</p>
                  <p className="text-2xl font-bold text-[#2b1f1f]">{shopPhone}</p>
                </div>
              </motion.a>

              {/* Location Card */}
              <motion.a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.01 }}
                className="flex items-center gap-6 p-6 rounded-3xl border border-gray-100 shadow-sm bg-white transition-all group"
              >
                <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <MapPin className="w-7 h-7" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">ที่ตั้งร้าน</p>
                  <p className="text-lg font-bold text-[#2b1f1f]">ซอยขนมหวาน หนองแขม</p>
                </div>
                <ExternalLink className="w-5 h-5 text-gray-300 group-hover:text-blue-500" />
              </motion.a>

              {/* LINEMAN Card with QR Toggle */}
              <motion.div
                whileHover={{ scale: 1.01 }}
                className="flex items-center gap-6 p-6 rounded-3xl border border-gray-100 shadow-sm bg-white transition-all"
              >
                <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center text-green-600">
                  <Image src="https://upload.wikimedia.org/wikipedia/commons/4/41/LINE_logo.svg" alt="Line" width={28} height={28} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">สั่งผ่านเดลิเวอรี่ / สอบถาม</p>
                  <div className="flex flex-wrap items-center gap-3 mt-1">
                    <a href={linemanUrl} target="_blank" rel="noopener noreferrer" className="text-xl font-bold text-green-700 hover:underline">LINE MAN</a>
                    <span className="h-4 w-px bg-gray-200 hidden sm:block" />
                    <button 
                      onClick={() => setIsLineQrOpen(true)}
                      className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full hover:bg-green-100 transition-colors"
                    >
                      ขยาย QR สแกน
                    </button>
                  </div>
                </div>
                <div 
                  onClick={() => setIsLineQrOpen(true)}
                  className="w-16 h-16 bg-white p-1 rounded-lg shadow-inner border border-green-100 overflow-hidden cursor-pointer hover:ring-2 hover:ring-green-500 transition-all"
                >
                  <img src="/line-qr.png" alt="LINE QR" className="w-full h-full object-contain" />
                </div>
              </motion.div>
            </div>
          </div>

          {/* Right Side: Map Image */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="w-full md:w-1/2 order-1 md:order-2"
          >
            <div className="relative aspect-square rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white">
              <img 
                src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=800" 
                alt="Gem's Kitchen Store Front" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-12">
                <div className="bg-white/90 backdrop-blur-md p-6 rounded-[2rem] shadow-xl inline-block self-start max-w-xs">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-xs font-bold text-green-600 uppercase tracking-widest">Open Now</span>
                  </div>
                  <h3 className="text-xl font-bold text-[#2b1f1f] mb-1">ครัวบ้านเจ็ม</h3>
                  <p className="text-sm text-gray-500">ซอยขนมหวาน (หนองแขม) ยินดีต้อนรับครับ!</p>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>

      {/* Fullscreen QR Modal */}
      <AnimatePresence>
        {isLineQrOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsLineQrOpen(false)}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-sm w-full bg-white rounded-[3rem] p-8 shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <button 
                onClick={() => setIsLineQrOpen(false)}
                className="absolute top-6 right-6 p-2 bg-slate-100 rounded-full text-slate-500 hover:text-mala-600"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="text-center mb-6 pt-4">
                <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/20">
                  <Image src="https://upload.wikimedia.org/wikipedia/commons/4/41/LINE_logo.svg" alt="Line" width={32} height={32} className="brightness-0 invert" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 leading-tight">แอดไลน์ร้านได้เลย</h3>
                <p className="text-slate-500 mt-1">สแกนเพื่อสั่งอาหารหรือสอบถาม</p>
              </div>
              
              <div className="aspect-square bg-slate-50 rounded-3xl p-6 mb-8 border-2 border-slate-100 shadow-inner">
                <img src="/line-qr.png" alt="LINE QR Full" className="w-full h-full object-contain" />
              </div>

              <button 
                onClick={() => setIsLineQrOpen(false)}
                className="w-full py-4 bg-mala-600 text-white rounded-2xl font-bold hover:bg-mala-700 transition-all shadow-lg shadow-mala-600/20"
              >
                ปิดหน้าต่าง
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
