import Navbar from "@/components/layout/Navbar";
import ContactForm from "@/components/forms/ContactForm";
import { MessageSquare, ShieldAlert, HeartHandshake } from "lucide-react";

export const metadata = {
  title: "ติดต่อสอบถาม / แจ้งปัญหา - ครัวบ้านเจ็ม",
  description: "พบปัญหาเกี่ยวกับอาหารหรือการบริการ หรือมีข้อเสนอแนะ? แจ้งเราได้ที่นี่ ครัวบ้านเจ็มยินดีรับฟังและแก้ไขเพื่อคุณ",
};

export default function SupportPage() {
  return (
    <main className="min-h-screen bg-[#fcf9f5]">
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-red-600 pt-32 pb-20 px-6 text-white text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6">ติดต่อ / แจ้งปัญหา</h1>
          <p className="text-red-100 text-lg md:text-xl font-light">
            เราให้ความสำคัญกับทุกความพึงพอใจของคุณ หากพบปัญหาหรือมีข้อเสนอแนะ <br className="hidden md:block" /> 
            กรุณาแจ้งให้เราทราบเพื่อให้เราได้ปรับปรุงบริการให้ดียิ่งขึ้นครับ
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-6 -mt-12 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Left Column: Info */}
          <div className="lg:col-span-1 space-y-8 pt-12">
            <div className="flex gap-6">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-red-600 shadow-xl shrink-0">
                <MessageSquare className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">รับฟังทุกเสียง</h3>
                <p className="text-slate-500 mt-1">ทุกคำติชมจะถูกส่งตรงถึงผู้บริหารเพื่อการแก้ไขที่รวดเร็ว</p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-red-600 shadow-xl shrink-0">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">การันตีคุณภาพ</h3>
                <p className="text-slate-500 mt-1">หากอาหารมีปัญหา เราพร้อมรับผิดชอบและดูแลคุณทันที</p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-red-600 shadow-xl shrink-0">
                <HeartHandshake className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">บริการด้วยใจ</h3>
                <p className="text-slate-500 mt-1">ครัวบ้านเจ็ม ขอบคุณที่ไว้วางใจให้เราดูแลมื้ออาหารของคุณครับ</p>
              </div>
            </div>

            <div className="pt-8 p-8 bg-white rounded-[2rem] border border-slate-100 shadow-sm">
                <h4 className="font-bold text-slate-800 mb-2">เวลาทำการ</h4>
                <p className="text-slate-500 text-sm">เปิดให้บริการทุกวัน <br /> 10:00 น. - 21:00 น.</p>
                <div className="h-px bg-slate-100 my-4" />
                <h4 className="font-bold text-slate-800 mb-2">โทรติดต่อโดยตรง</h4>
                <p className="text-red-600 font-bold text-xl">095-5420726</p>
            </div>
          </div>

          {/* Right Column: Form */}
          <div className="lg:col-span-2">
            <ContactForm />
          </div>

        </div>
      </div>
    </main>
  );
}
