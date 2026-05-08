"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { 
  CheckCircle2, 
  Clock, 
  ChefHat, 
  PackageCheck, 
  ArrowLeft,
  MapPin,
  Receipt,
  Phone,
  Truck
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface Order {
  id: string;
  created_at: string;
  name: string;
  phone: string;
  total_amount: number;
  status: 'pending' | 'preparing' | 'ready' | 'delivering' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'verified' | 'failed';
  slip_url?: string;
}

export default function OrderTrackerPage({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();

    // Subscribe to real-time updates for this specific order
    const channel = supabase
      .channel(`order:${params.id}`)
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'orders',
        filter: `id=eq.${params.id}`
      }, (payload) => {
        console.log('Order update:', payload.new);
        setOrder(payload.new as Order);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [params.id]);

  const fetchOrder = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error) console.error("Error fetching order:", error);
    else setOrder(data);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-mala-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 font-medium">Loading your order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-xl border border-slate-100">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 text-red-600">
            <Receipt className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-slate-900 mb-2">Order Not Found</h1>
          <p className="text-slate-500 mb-8">We couldn't find an order with that ID. Please check your link and try again.</p>
          <Link href="/" className="inline-block w-full py-3 bg-mala-600 text-white rounded-xl font-bold shadow-lg shadow-mala-600/20">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const steps = [
    { id: 'pending', label: 'รับออเดอร์แล้ว', icon: Receipt, desc: 'เราได้รับคำสั่งซื้อของคุณแล้ว' },
    { id: 'preparing', label: 'กำลังปรุงอาหาร', icon: ChefHat, desc: 'เชฟกำลังตั้งใจปรุงอาหารให้คุณ' },
    { id: 'ready', label: 'เตรียมอาหารเสร็จแล้ว', icon: Clock, desc: 'อาหารของคุณพร้อมสำหรับการจัดส่ง' },
    { id: 'delivering', label: 'กำลังไปส่ง', icon: Truck, desc: 'ไรเดอร์กำลังนำอาหารไปส่งให้คุณ' },
    { id: 'delivered', label: 'ส่งเรียบร้อย', icon: CheckCircle2, desc: 'ขอให้มีความสุขกับมื้ออาหารนะครับ!' }
  ];

  const currentStepIndex = steps.findIndex(s => s.id === order.status);

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Top Navbar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-30">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="p-2 -ml-2 text-slate-400 hover:text-slate-600 transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-lg font-bold text-slate-900">Track Order</h1>
          <div className="w-10" /> {/* Spacer */}
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 pt-8">
        {/* Order ID & Status Banner */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-6"
        >
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Order ID</p>
              <p className="text-xl font-mono font-bold text-slate-900">#{order.id.slice(-6).toUpperCase()}</p>
            </div>
            <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
              order.payment_status === 'verified' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
            }`}>
              {order.payment_status === 'verified' ? 'Payment Verified' : 'Awaiting Payment'}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pb-6 border-b border-slate-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Total</p>
                <p className="text-sm font-bold text-slate-900">฿{order.total_amount}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Customer</p>
                <p className="text-sm font-bold text-slate-900">{order.name}</p>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <div className="relative">
              {/* Progress Line */}
              <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-slate-100" />
              
              <div className="space-y-8 relative">
                {steps.map((step, index) => {
                  const isCompleted = index < currentStepIndex || order.status === 'delivered';
                  const isCurrent = order.status === step.id;
                  const Icon = step.icon;

                  return (
                    <div key={step.id} className="flex gap-4">
                      <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-4 border-slate-50 transition-all duration-500 ${
                        isCompleted ? 'bg-green-500 text-white' : isCurrent ? 'bg-mala-600 text-white scale-110 shadow-lg shadow-mala-600/30' : 'bg-white text-slate-300 border-slate-100'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className={isCurrent ? 'opacity-100' : 'opacity-60'}>
                        <h4 className={`font-bold text-sm ${isCurrent ? 'text-slate-900' : 'text-slate-500'}`}>{step.label}</h4>
                        <p className="text-xs text-slate-400">{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action Call for Customer */}
        {order.payment_status !== 'verified' && (
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 mb-6">
            <p className="text-sm text-amber-800 font-medium leading-relaxed">
              <strong>Notice:</strong> Your payment is being verified by our team. Please stay tuned as we start preparing your order shortly.
            </p>
          </div>
        )}

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-900 mb-4">Support</h3>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-mala-100 rounded-xl flex items-center justify-center text-mala-600 font-bold">
                        G
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-900">Gem's Kitchen</p>
                        <p className="text-xs text-slate-400">Call us for any help</p>
                    </div>
                </div>
                <a href="tel:0812345678" className="p-3 bg-white shadow-sm border border-slate-100 rounded-full text-mala-600 hover:text-mala-700 transition-colors">
                    <Phone className="w-5 h-5" />
                </a>
            </div>
        </div>
      </main>
    </div>
  );
}
