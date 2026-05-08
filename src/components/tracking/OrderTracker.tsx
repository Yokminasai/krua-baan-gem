"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, Flame, Truck, CheckCircle, XCircle, Package } from "lucide-react";
import { supabase } from "@/lib/supabase";

export type OrderStatus = "pending" | "preparing" | "ready" | "delivering" | "delivered" | "cancelled";

interface OrderTrackerProps {
  orderId: string;
  initialStatus?: OrderStatus;
}

export default function OrderTracker({ orderId, initialStatus = "pending" }: OrderTrackerProps) {
  const [status, setStatus] = useState<OrderStatus>(initialStatus);

  useEffect(() => {
    // 1. Initial fetch to get the current status
    const getInitialStatus = async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("status")
        .eq("id", orderId)
        .single();
      
      if (!error && data?.status) {
        setStatus(data.status as OrderStatus);
      }
    };

    getInitialStatus();

    // 2. Real-time subscription to status changes
    const channel = supabase
      .channel(`order_tracking_${orderId}`)
      .on(
        "postgres_changes" as any,
        { event: "UPDATE", table: "orders", filter: `id=eq.${orderId}` },
        (payload: any) => {
          if (payload.new && payload.new.status) {
            setStatus(payload.new.status as OrderStatus);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId]);

  const stages = [
    { id: "pending", label: "รับออเดอร์แล้ว", icon: Clock, color: "text-yellow-500", bgColor: "bg-yellow-500", pulse: true },
    { id: "preparing", label: "กำลังปรุงอาหาร", icon: Flame, color: "text-orange-500", bgColor: "bg-orange-500", bounce: true },
    { id: "ready", label: "เตรียมเสร็จแล้ว", icon: Package, color: "text-blue-500", bgColor: "bg-blue-500" },
    { id: "delivering", label: "กำลังไปส่ง", icon: Truck, color: "text-green-500", bgColor: "bg-green-500", move: true },
    { id: "delivered", label: "ส่งเรียบร้อย", icon: CheckCircle, color: "text-mala-600", bgColor: "bg-mala-600" },
  ];

  if (status === "cancelled") {
    return (
      <div className="bg-white rounded-3xl p-8 shadow-lg max-w-2xl mx-auto border border-red-100 text-center">
        <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-serif font-bold text-red-600 mb-2">Order Cancelled</h2>
        <p className="text-gray-500">ขออภัย ออเดอร์ของคุณถูกยกเลิก กรุณาติดต่อที่ร้านครับ</p>
        <p className="text-gray-400 text-xs mt-4">Order #{orderId}</p>
      </div>
    );
  }

  const currentStageIndex = stages.findIndex((s) => s.id === status);

  return (
    <div className="bg-white rounded-3xl p-8 shadow-lg max-w-2xl mx-auto border border-gray-100">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-serif font-bold text-deep-charcoal mb-2">Track Your Order</h2>
        <p className="text-gray-500 text-sm">Order #{orderId}</p>
      </div>

      <div className="relative">
        {/* Progress Bar Background */}
        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -translate-y-1/2 rounded-full" />
        
        {/* Active Progress Bar */}
        <motion.div 
          className="absolute top-1/2 left-0 h-1 bg-mala-500 -translate-y-1/2 rounded-full"
          initial={{ width: "0%" }}
          animate={{ width: `${(currentStageIndex / (stages.length - 1)) * 100}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />

        {/* Stage Indicators */}
        <div className="relative flex justify-between">
          {stages.map((stage, index) => {
            const Icon = stage.icon;
            const isActive = index === currentStageIndex;
            const isPast = index < currentStageIndex;

            return (
              <div key={stage.id} className="flex flex-col items-center relative">
                <motion.div
                  className={`w-12 h-12 rounded-full flex items-center justify-center border-4 border-white shadow-sm z-10 transition-colors duration-300 ${
                    isActive || isPast ? stage.bgColor : "bg-gray-200"
                  }`}
                  animate={isActive ? { scale: [1, 1.1, 1] } : { scale: 1 }}
                  transition={{ repeat: isActive ? Infinity : 0, duration: 2 }}
                >
                  <Icon 
                    className={`w-5 h-5 text-white ${
                      isActive && stage.pulse ? "animate-pulse" : ""
                    } ${
                      isActive && stage.bounce ? "animate-bounce" : ""
                    }`} 
                  />
                </motion.div>
                
                <span className={`mt-3 text-xs font-semibold text-center w-20 transition-colors duration-300 ${
                  isActive ? stage.color : isPast ? "text-gray-700" : "text-gray-400"
                }`}>
                  {stage.label}
                </span>

                {/* Specific active animations (Flame / Truck) */}
                {isActive && stage.move && (
                  <motion.div 
                    className="absolute -top-6 text-green-500"
                    animate={{ x: [0, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    <Truck className="w-6 h-6" />
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
