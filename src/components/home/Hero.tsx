"use client";

import Image from "next/image";
import { Star, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative h-[85vh] md:h-[95vh] min-h-[600px] md:min-h-[800px] flex items-center justify-center overflow-hidden bg-black">
      {/* Background Image with subtle zoom */}
      <div className="absolute inset-0 z-0">
        <motion.div 
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 10, ease: "easeOut" }}
          className="w-full h-full relative"
        >
          <Image
            src="/images/hero_mala.png"
            alt="Signature Mala"
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
            unoptimized
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/90" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-start justify-center pt-20">
        <div className="max-w-3xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white text-sm font-medium tracking-wide"
          >
            <Star className="w-4 h-4 text-spice-500 fill-spice-500" />
            <span className="opacity-90">ครัวบ้านเจ็ม หม่าล่าทั่ง - ซอยขนมหวาน</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-8xl font-serif font-bold text-white mb-8 leading-tight tracking-tight"
          >
            <span className="text-3xl md:text-5xl block mb-2 opacity-80">ครัวบ้านเจ็ม</span>
            ศาสตร์แห่งข้อมูล<br />
            <span className="text-[#f59f00]">ศิลป์แห่งรสชาติ</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-lg md:text-2xl text-white/90 mb-12 font-light leading-relaxed max-w-2xl"
          >
            Gem's Kitchen Homemade เสิร์ฟความสุขผ่านรสชาติหม่าล่าต้นตำรับ 
            คัดสรรวัตถุดิบอย่างพิถีพิถันเพื่อคุณโดยเฉพาะ
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link
              href="/menu"
              className="group relative px-8 py-4 bg-white text-black font-bold rounded-full shadow-2xl flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <span>ดูเมนูของเรา</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/story"
              className="px-8 py-4 bg-transparent text-white border border-white/30 font-medium rounded-full hover:bg-white/10 transition-all text-center inline-flex items-center justify-center"
            >
              อ่านเรื่องราวของเรา
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
