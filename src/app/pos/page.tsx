"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { 
  ShoppingBag, 
  Package, 
  BarChart3, 
  Search, 
  RefreshCw, 
  LogOut, 
  Phone, 
  ChefHat, 
  X, 
  Plus, 
  Minus, 
  ShoppingCart, 
  User, 
  CreditCard, 
  Banknote, 
  Trash2, 
  History,
  CheckCircle2,
  Printer
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

type OrderStatus = "pending" | "preparing" | "ready" | "delivering" | "delivered" | "cancelled";

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  is_available: boolean;
}

interface CartItem extends Product {
  quantity: number;
}

interface Order {
  id: string;
  created_at: string;
  name: string;
  phone: string;
  total_amount: number;
  status: string;
  payment_status: string;
  payment_method: string;
  order_items: any[];
}

export default function ProfessionalPos() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeView, setActiveView] = useState<"pos" | "orders" | "inventory">("pos");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  
  // Data State
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "credit">("cash");
  const [amountReceived, setAmountReceived] = useState<string>("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data: pData } = await supabase.from("products").select("*").order("name");
    const { data: oData } = await supabase.from("orders").select("*, order_items(*)").order("created_at", { ascending: false });
    if (pData) setProducts(pData);
    if (oData) setOrders(oData);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isAuthenticated) fetchData();
  }, [isAuthenticated, fetchData]);

  // Cart Logic
  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + (item.price * item.quantity), 0), [cart]);
  const changeAmount = useMemo(() => {
    const received = parseFloat(amountReceived) || 0;
    return Math.max(0, received - cartTotal);
  }, [amountReceived, cartTotal]);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    
    setLoading(true);
    try {
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert([{
          name: customerName || "Walk-in Customer",
          phone: "0000000000",
          address: "ขายหน้าร้าน (POS)",
          total_amount: cartTotal,
          status: "delivered",
          payment_status: "verified",
          payment_method: paymentMethod === 'cash' ? 'เงินสด' : 'บัตรเครดิต'
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = cart.map(item => ({
        order_id: order.id,
        product_id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      }));

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
      if (itemsError) throw itemsError;

      // Reset
      setCart([]);
      setCustomerName("");
      setAmountReceived("");
      setIsPaymentModalOpen(false);
      fetchData();
      alert("ชำระเงินสำเร็จ!");
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการบันทึกออเดอร์");
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-10 rounded-3xl w-full max-w-sm shadow-2xl border border-slate-100">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-orange-500 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-orange-500/20">
              <ChefHat className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-black text-slate-800">ระบบขายหน้าร้าน</h1>
            <p className="text-slate-400 text-sm font-medium mt-1">ครัวบ้านเจ็ม Digital OS</p>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); if (username === "admin" && password === "1234") setIsAuthenticated(true); else alert("รหัสผ่านไม่ถูกต้อง"); }} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Access Key</label>
              <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 text-slate-800 font-bold focus:ring-2 focus:ring-orange-500 outline-none" value={username} onChange={e => setUsername(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Security PIN</label>
              <input type="password" placeholder="••••" className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 text-slate-800 text-2xl tracking-[0.5em] focus:ring-2 focus:ring-orange-500 outline-none" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <button className="w-full bg-orange-600 hover:bg-orange-700 text-white py-5 rounded-2xl font-black text-lg transition-all active:scale-95 shadow-xl shadow-orange-600/20">เข้าสู่ระบบ</button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-slate-800 font-sans pb-24 lg:pb-0">
      {/* Dynamic Header */}
      <header className="bg-orange-600 text-white py-8 px-6 lg:px-12 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="lg:hidden" onClick={() => setIsAuthenticated(false)}><LogOut className="w-6 h-6" /></div>
            <div className="hidden lg:block bg-white/20 p-3 rounded-2xl"><ChefHat className="w-8 h-8" /></div>
            <div>
              <h1 className="text-2xl font-black tracking-tight">ระบบขายหน้าร้าน</h1>
              <p className="text-sm font-bold text-orange-100 opacity-80">ร้านครัวบ้านเจ็ม (Homemade)</p>
            </div>
          </div>
          
          <nav className="hidden lg:flex items-center gap-4">
            {[
              { id: "pos", icon: ShoppingBag, label: "ขายสินค้า" },
              { id: "orders", icon: History, label: "ประวัติการขาย" },
              { id: "inventory", icon: Package, label: "สต็อกสินค้า" }
            ].map(item => (
              <button 
                key={item.id} 
                onClick={() => setActiveView(item.id as any)}
                className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-bold transition-all ${activeView === item.id ? "bg-white text-orange-600 shadow-xl" : "hover:bg-white/10"}`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            ))}
            <button onClick={() => setIsAuthenticated(false)} className="ml-6 p-4 bg-white/10 hover:bg-red-500 rounded-2xl transition-all"><LogOut className="w-5 h-5" /></button>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto p-4 lg:p-10">
        {activeView === "pos" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Menu Items (Inspired by Screenshot 1) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-black text-slate-800 flex items-center gap-3">เมนูอาหาร</h2>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="ค้นหาชื่อเมนู..." 
                    className="bg-white border border-slate-200 rounded-2xl py-3 pl-12 pr-6 text-sm focus:ring-2 focus:ring-orange-500 outline-none w-64 shadow-sm"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-fit">
                {products.filter(p => p.name.includes(searchQuery)).map(product => (
                  <div key={product.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5 group hover:shadow-md transition-all">
                    <div className="relative w-24 h-24 rounded-2xl overflow-hidden shrink-0 border border-slate-50">
                      <Image src={product.image} alt={product.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" unoptimized />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-800 text-lg leading-tight truncate">{product.name}</h4>
                      <p className="text-orange-600 font-black text-xl mt-1">{product.price} <span className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">บาท</span></p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">{product.category}</p>
                    </div>
                    <button 
                      onClick={() => addToCart(product)}
                      className="w-12 h-12 bg-orange-600 text-white rounded-2xl flex items-center justify-center shadow-lg hover:bg-orange-700 active:scale-90 transition-all"
                    >
                      <Plus className="w-6 h-6" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Cart (Inspired by Screenshot 2) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden flex flex-col h-fit sticky top-10">
                <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                  <h3 className="text-xl font-black text-slate-800">ตะกร้าสินค้า</h3>
                  <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                    <ShoppingCart className="w-4 h-4 text-orange-600" />
                    <span className="text-xs font-black text-slate-600">{cart.reduce((s, i) => s + i.quantity, 0)} รายการ</span>
                  </div>
                </div>

                <div className="p-8 space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar">
                  <AnimatePresence mode="popLayout">
                    {cart.map(item => (
                      <motion.div 
                        layout initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                        key={item.id} 
                        className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100"
                      >
                        <div className="flex-1">
                          <p className="font-bold text-slate-800">{item.name}</p>
                          <p className="text-xs font-bold text-orange-600">{item.price} บาท</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-3 bg-white p-1.5 rounded-xl border border-slate-200">
                            <button onClick={() => updateQuantity(item.id, -1)} className="p-2 hover:bg-slate-50 rounded-lg transition-colors"><Minus className="w-4 h-4" /></button>
                            <span className="w-6 text-center font-black text-sm">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, 1)} className="p-2 hover:bg-slate-50 rounded-lg transition-colors"><Plus className="w-4 h-4" /></button>
                          </div>
                          <p className="w-20 text-right font-black text-slate-800">฿{item.price * item.quantity}</p>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  {cart.length === 0 && (
                    <div className="py-20 text-center space-y-4">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-300">
                        <ShoppingBag className="w-8 h-8" />
                      </div>
                      <p className="text-sm font-bold text-slate-400">ยังไม่มีสินค้าในตะกร้า</p>
                    </div>
                  )}
                </div>

                <div className="p-8 bg-slate-50 border-t border-slate-100 space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">ชื่อลูกค้า (ไม่บังคับ)</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                      <input 
                        type="text" 
                        placeholder="กรอกชื่อลูกค้า..." 
                        className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-12 pr-6 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                        value={customerName}
                        onChange={e => setCustomerName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center px-2">
                    <p className="text-lg font-bold text-slate-500">ยอดรวมทั้งหมด</p>
                    <p className="text-4xl font-black text-orange-600 tracking-tighter">฿{cartTotal.toLocaleString()}</p>
                  </div>

                  <button 
                    onClick={() => setIsPaymentModalOpen(true)}
                    disabled={cart.length === 0}
                    className="w-full bg-orange-600 text-white py-6 rounded-3xl font-black text-xl shadow-2xl shadow-orange-600/20 hover:bg-orange-700 active:scale-95 transition-all disabled:opacity-50"
                  >
                    ชำระเงิน
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeView === "orders" && (
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
            <div className="p-10 border-b border-slate-50 flex justify-between items-center">
              <h2 className="text-2xl font-black text-slate-800">Orders History</h2>
              <button onClick={fetchData} className="p-4 bg-slate-50 rounded-2xl border border-slate-100"><RefreshCw className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    <th className="px-10 py-6">Order ID</th>
                    <th className="px-10 py-6">Customer</th>
                    <th className="px-10 py-6 text-right">Total</th>
                    <th className="px-10 py-6">Payment</th>
                    <th className="px-10 py-6">Status</th>
                    <th className="px-10 py-6">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/30 transition-colors">
                      <td className="px-10 py-6 font-bold text-slate-400 text-xs tracking-widest">ORD-{order.id.slice(-12).toUpperCase()}</td>
                      <td className="px-10 py-6 font-black text-slate-800">{order.name}</td>
                      <td className="px-10 py-6 font-black text-slate-800 text-right">฿{order.total_amount.toLocaleString()}</td>
                      <td className="px-10 py-6">
                        <span className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg w-fit">
                          {order.payment_method === 'บัตรเครดิต' ? <CreditCard className="w-3 h-3" /> : <Banknote className="w-3 h-3" />}
                          {order.payment_method}
                        </span>
                      </td>
                      <td className="px-10 py-6">
                        <span className="text-[10px] font-black uppercase text-green-600 bg-green-50 px-3 py-1.5 rounded-lg border border-green-100">completed</span>
                      </td>
                      <td className="px-10 py-6 text-slate-400 text-xs font-bold">{new Date(order.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Payment Modal (Inspired by Screenshot 4) */}
      <AnimatePresence>
        {isPaymentModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[3rem] w-full max-w-md shadow-[0_50px_100px_rgba(0,0,0,0.2)] overflow-hidden"
            >
              <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                <h3 className="text-xl font-black text-slate-800 uppercase italic">ชำระเงิน</h3>
                <button onClick={() => setIsPaymentModalOpen(false)} className="p-3 bg-slate-50 rounded-2xl"><X className="w-6 h-6" /></button>
              </div>

              <div className="p-10 space-y-8">
                <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 flex justify-between items-center">
                  <p className="text-lg font-bold text-slate-500">ยอดรวม:</p>
                  <p className="text-4xl font-black text-orange-600 tracking-tighter">{cartTotal.toLocaleString()} <span className="text-base">บาท</span></p>
                </div>

                <div className="space-y-4">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">วิธีการชำระเงิน</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => setPaymentMethod("cash")}
                      className={`flex items-center justify-center gap-3 py-5 rounded-2xl font-black transition-all border-2 ${paymentMethod === 'cash' ? 'bg-slate-900 text-white border-slate-900 shadow-xl' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'}`}
                    >
                      <Banknote className="w-5 h-5" /> เงินสด
                    </button>
                    <button 
                      onClick={() => setPaymentMethod("credit")}
                      className={`flex items-center justify-center gap-3 py-5 rounded-2xl font-black transition-all border-2 ${paymentMethod === 'credit' ? 'bg-slate-900 text-white border-slate-900 shadow-xl' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'}`}
                    >
                      <CreditCard className="w-5 h-5" /> บัตรเครดิต
                    </button>
                  </div>
                </div>

                {paymentMethod === "cash" && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">เงินที่รับมา (บาท)</p>
                    <input 
                      type="number" 
                      className="w-full bg-slate-50 border-2 border-slate-200 rounded-3xl py-6 px-8 text-3xl font-black text-slate-800 outline-none focus:border-orange-500 transition-all"
                      placeholder="0.00"
                      autoFocus
                      value={amountReceived}
                      onChange={e => setAmountReceived(e.target.value)}
                    />
                    <div className="flex justify-between items-center px-4">
                      <p className="text-sm font-bold text-slate-400">เงินทอน:</p>
                      <p className="text-2xl font-black text-green-600">{changeAmount.toLocaleString()} บาท</p>
                    </div>
                  </div>
                )}

                <button 
                  onClick={handleCheckout}
                  disabled={loading || (paymentMethod === 'cash' && (parseFloat(amountReceived) < cartTotal || !amountReceived))}
                  className="w-full bg-green-600 text-white py-6 rounded-3xl font-black text-xl shadow-2xl shadow-green-600/20 hover:bg-green-700 active:scale-95 transition-all disabled:opacity-50"
                >
                  {loading ? "กำลังบันทึก..." : "ยืนยันการชำระเงิน"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile Tab Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-slate-100 px-8 py-4 flex items-center justify-between shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
        {[
          { id: "pos", icon: ShoppingBag, label: "ขายสินค้า" },
          { id: "orders", icon: History, label: "ประวัติ" },
          { id: "inventory", icon: Package, label: "สต็อก" }
        ].map(item => (
          <button key={item.id} onClick={() => setActiveView(item.id as any)} className={`flex flex-col items-center gap-1 transition-all ${activeView === item.id ? "text-orange-600 scale-110" : "text-slate-400"}`}>
            <item.icon className="w-6 h-6" />
            <span className="text-[9px] font-bold uppercase tracking-widest">{item.label}</span>
          </button>
        ))}
        <button onClick={() => setIsAuthenticated(false)} className="flex flex-col items-center gap-1 text-red-300">
          <LogOut className="w-6 h-6" />
          <span className="text-[9px] font-bold uppercase tracking-widest">ออก</span>
        </button>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        input[type=number]::-webkit-inner-spin-button, 
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
      `}</style>
    </div>
  );
}
