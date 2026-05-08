"use client";

import Image from "next/image";
import Link from "next/link";

export default function StorySection() {
  return (
    <div className="bg-[#FAFAFA] min-h-screen pt-12 pb-40">
      
      {/* Editorial Header */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 pt-16 md:pt-24 pb-16">
        <div className="max-w-4xl">
          <p className="text-xs md:text-sm tracking-[0.25em] text-gray-400 uppercase mb-8 font-medium">Our Origins</p>
          <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-serif font-light text-[#1A1A1A] leading-[1.1] tracking-tight">
            The Art of <br />
            <span className="italic text-mala-700">Perfecting</span> Spice.
          </h1>
        </div>
      </section>

      {/* Cinematic Image */}
      <section className="w-full px-6 lg:px-12 max-w-[1400px] mx-auto">
        <div className="relative w-full aspect-[4/3] md:aspect-[21/9] overflow-hidden rounded-sm shadow-2xl">
          <Image
            src="/images/story_chef.png"
            alt="Chef preparing Mala broth"
            fill
            className="object-cover"
            priority
            unoptimized
          />
        </div>
      </section>

      {/* Two Column Editorial Text */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 pt-24 md:pt-40">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-24">
          
          <div className="md:col-span-5">
            <h2 className="text-3xl md:text-[2.5rem] font-serif text-[#1A1A1A] leading-[1.3] mb-8">
              จุดเริ่มต้นจากความหลงใหล <br />
              สู่รสชาติที่ทุกคนเข้าถึงได้
            </h2>
            <div className="w-12 h-[1px] bg-mala-700 mb-8"></div>
          </div>

          <div className="md:col-span-7 flex flex-col gap-8 text-[#4A4A4A] font-light leading-[1.8] text-lg md:text-xl">
            <p>
              ครัวบ้านเจ็ม (Gem's Kitchen) เริ่มต้นจากการเป็นครัวขนาดเล็กที่เต็มไปด้วยความมุ่งมั่น 
              เราเชื่อว่าอาหารที่ดีไม่จำเป็นต้องอยู่ในร้านหรูเสมอไป แต่คือรสชาติที่เข้าถึงใจคนทาน 
              เราเริ่มต้นจากการทดลองเคี่ยวน้ำซุปหม่าล่าครั้งแล้วครั้งเล่า เพื่อหารสชาติที่กลมกล่อม 
              ไม่เผ็ดชาจนเกินไป แต่ยังคงความหอมลึกซึ้งในแบบฉบับดั้งเดิม
            </p>
            <p>
              จากครัวเล็กๆ ในซอยขนมหวาน เราค่อยๆ เติบโตจากการบอกปากต่อปาก 
              สูตรน้ำซุปของเราถูกปรับแต่งให้ถูกปากคนไทย ผสานกับความใส่ใจในการคัดเลือกวัตถุดิบ 
              ทุกชิ้นที่เสิร์ฟ ต้องผ่านการชิมและคัดกรองอย่างพิถีพิถัน เสมือนทำอาหารให้คนในครอบครัวทาน
            </p>
            <p className="font-medium text-[#1A1A1A] mt-6 text-2xl italic font-serif">
              "เพราะเราไม่ได้แค่ทำอาหาร แต่เราส่งมอบความสุขผ่านรสชาติ"
            </p>
          </div>
        </div>
      </section>

      {/* Secondary Image & Conclusion */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 pt-32 md:pt-48">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 items-center">
          <div className="order-2 md:order-1 relative aspect-[4/5] w-full max-w-md mx-auto md:mr-auto md:ml-0 overflow-hidden rounded-sm shadow-xl">
            <Image
              src="/images/philosophy_mala.png"
              alt="Ingredients"
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          
          <div className="order-1 md:order-2">
            <p className="text-xs md:text-sm tracking-[0.25em] text-gray-400 uppercase mb-8 font-medium">The Rinen Philosophy</p>
            <h3 className="text-3xl md:text-4xl font-serif text-[#1A1A1A] leading-snug mb-8">
              ปรัชญาริเน็น (Rinen)
            </h3>
            <p className="text-[#4A4A4A] font-light leading-[1.8] text-lg md:text-xl mb-12">
              เรานำแนวคิด "ริเน็น" ของญี่ปุ่นมาประยุกต์ใช้ ธุรกิจของเราไม่ได้ขับเคลื่อนด้วยผลกำไรสูงสุด 
              แต่ขับเคลื่อนด้วยเจตนารมณ์ที่จะสร้างคุณค่าให้กับชุมชน 
              เรารับฟังความคิดเห็นจากลูกค้าทุกคน 
              เพื่อนำมาพัฒนาเมนูที่ตอบโจทย์และดีต่อสุขภาพมากยิ่งขึ้น
            </p>
            <Link 
              href="/#menu"
              className="inline-flex items-center gap-4 text-mala-700 font-medium hover:text-[#1A1A1A] transition-colors uppercase tracking-[0.15em] text-sm"
            >
              <span className="w-12 h-[1px] bg-current"></span>
              สัมผัสรสชาติของเรา
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
