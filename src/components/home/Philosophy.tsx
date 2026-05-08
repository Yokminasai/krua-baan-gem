"use client";

import { motion } from "framer-motion";
import { Heart, Leaf, CheckCircle2 } from "lucide-react";
import Image from "next/image";

export default function Philosophy() {
  return (
    <section className="py-32 bg-creamy-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Image Side - Use animate for reliability */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative aspect-[4/5] w-full rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white">
              <Image
                src="/images/philosophy_mala.png"
                alt="Quality"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            {/* Floating Badge */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ delay: 0.4 }}
              className="absolute -bottom-8 -right-8 bg-white p-6 rounded-[2rem] shadow-xl border border-gray-100 max-w-xs hidden sm:block"
            >
              <div className="flex items-center gap-4 mb-2">
                <div className="bg-mala-50 p-3 rounded-full text-mala-600">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-deep-charcoal">คุณภาพระดับท็อป</h4>
                  <p className="text-sm text-gray-500">ใส่ใจทุกรายละเอียด</p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Content Side */}
          <div className="lg:pl-8">
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.1 }}
              className="text-spice-500 font-bold tracking-[0.2em] uppercase text-xs mb-6 block"
            >
              Our Philosophy
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              className="text-4xl md:text-5xl font-serif text-deep-charcoal mb-8 leading-tight tracking-tight"
            >
              ไม่ใช่แค่ความอร่อย <br />
              <span className="text-mala-600 italic font-light">แต่คือความใส่ใจ</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-gray-600 leading-relaxed font-light mb-12"
            >
              ที่ครัวบ้านเจ็ม เราเชื่อว่าอาหารที่ดีที่สุดคืออาหารที่ทำด้วยใจ เราผสมผสานความอบอุ่นของการทำอาหารกินเองที่บ้าน เข้ากับเทคนิคและมาตรฐานระดับมืออาชีพ เพื่อส่งมอบประสบการณ์มื้ออาหารที่น่าจดจำส่งตรงถึงบ้านคุณ
            </motion.p>

            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ delay: 0.3 }}
                className="flex gap-6"
              >
                <div className="shrink-0">
                  <div className="w-14 h-14 rounded-2xl bg-mala-50 flex items-center justify-center text-mala-600">
                    <Heart className="w-6 h-6" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-deep-charcoal mb-2">อาหารที่ซื่อสัตย์</h3>
                  <p className="text-gray-600 font-light leading-relaxed">
                    ปรุงด้วยความใส่ใจและพิถีพิถันเสมือนทำให้คนในครอบครัวทาน ไม่มีทางลัด มีเพียงความทุ่มเทในทุกจาน
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ delay: 0.4 }}
                className="flex gap-6"
              >
                <div className="shrink-0">
                  <div className="w-14 h-14 rounded-2xl bg-spice-50 flex items-center justify-center text-spice-500">
                    <Leaf className="w-6 h-6" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-deep-charcoal mb-2">วัตถุดิบเกรดอาร์ติซาน</h3>
                  <p className="text-gray-600 font-light leading-relaxed">
                    คัดสรรวัตถุดิบคุณภาพดีจากท้องถิ่นเพื่อความสดใหม่ ทุกคำที่ทานคือการสนับสนุนเกษตรกรไทย
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
