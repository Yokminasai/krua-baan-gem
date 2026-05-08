"use client";

import { QrCode, CreditCard } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";

export default function PaymentSection() {
  const { items } = useCartStore();
  const totalPrice = items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);

  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm mt-6">
      <h3 className="text-xl font-serif font-bold text-deep-charcoal mb-6 flex items-center gap-2">
        <QrCode className="w-6 h-6 text-mala-600" />
        วิธีการชำระเงิน
      </h3>

      <div className="space-y-4">
        <div className="p-5 rounded-[2rem] border-2 border-mala-600 bg-mala-50/50 flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center shrink-0 border border-mala-100">
              <QrCode className="w-6 h-6 text-mala-600" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-slate-900 leading-tight">เรเน่การค้า (ReneShop)</p>
              <p className="text-xs text-slate-500 mt-0.5">ชื่อบัญชี: พธรรม สินสมบูรณ์ทอง</p>
            </div>
          </div>
          
          <div className="w-full max-w-[300px] mx-auto aspect-square bg-white rounded-[2rem] border border-gray-200 p-4 shadow-md overflow-hidden ring-4 ring-white">
             <img 
               src="/images/qr promptpay.jpg" 
               alt="PromptPay QR Code" 
               className="w-full h-full object-contain"
             />
          </div>
          
          <div className="bg-white rounded-2xl p-4 border border-mala-100 text-center shadow-sm">
            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-[0.2em] mb-1">ยอดชำระทั้งหมด</p>
            <p className="text-3xl font-bold text-mala-600">฿{totalPrice.toLocaleString()}</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-gray-100 flex items-center gap-4 opacity-40 grayscale cursor-not-allowed bg-slate-50">
           <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shrink-0 border border-gray-200">
            <CreditCard className="w-6 h-6 text-slate-400" />
          </div>
          <div>
            <p className="font-bold text-slate-500">บัตรเครดิต/เดบิต</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest italic">Coming soon</p>
          </div>
        </div>
      </div>
    </div>
  );
}
