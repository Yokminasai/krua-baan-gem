"use client";

import { useState, useEffect, useCallback } from "react";
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
  History,
  Printer,
  MapPin,
  Eye,
  Truck,
  Clock,
  ChevronRight,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

type OrderStatus = "pending" | "preparing" | "ready" | "delivering" | "delivered" | "cancelled";

interface Product { id: string; name: string; price: number; image: string; category: string; is_available: boolean; }
interface CartItem extends Product { quantity: number; }
interface Order { id: string; created_at: string; name: string; phone: string; address: string; location_url: string; total_amount: number; status: OrderStatus; payment_status: string; payment_method: string; slip_url: string; order_items: any[]; }

export default function StablePos() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<"pos" | "orders" | "inventory" | "analytics">("pos");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  
  // Data
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Modals/Selected
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [previewSlip, setPreviewSlip] = useState<string | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [payMethod, setPayMethod] = useState<"cash" | "credit">("cash");
  const [received, setReceived] = useState<string>("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: pData } = await supabase.from("products").select("*").order("name");
      const { data: oData } = await supabase.from("orders").select("*, order_items(*)").order("created_at", { ascending: false });
      if (pData) setProducts(pData);
      if (oData) setOrders(oData);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
      const channel = supabase.channel("pos_stable").on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => fetchData()).subscribe();
      return () => { supabase.removeChannel(channel); };
    }
  }, [isAuthenticated, fetchData]);

  const updateStatus = async (id: string, status: OrderStatus) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (!error) {
      fetchData();
      if (selectedOrder?.id === id) setSelectedOrder(prev => prev ? { ...prev, status } : null);
    }
  };

  const toggleStock = async (id: string, current: boolean) => {
    await supabase.from("products").update({ is_available: !current }).eq("id", id);
    fetchData();
  };

  const addToCart = (p: Product) => {
    setCart(prev => {
      const ex = prev.find(i => i.id === p.id);
      if (ex) return prev.map(i => i.id === p.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...p, quantity: 1 }];
    });
  };

  const cartTotal = cart.reduce((s, i) => s + (i.price * i.quantity), 0);
  const change = Math.max(0, (parseFloat(received) || 0) - cartTotal);

  const handleFinishSale = async () => {
    if (cart.length === 0) return;
    setLoading(true);
    try {
      const { data: order } = await supabase.from("orders").insert([{ 
        name: customerName || "Walk-in", phone: "0000000000", address: "หน้าเซเว่น (POS)", 
        total_amount: cartTotal, status: "delivered", payment_status: "verified", 
        payment_method: payMethod === 'cash' ? 'เงินสด' : 'บัตรเครดิต' 
      }]).select().single();
      
      if (order) {
        await supabase.from("order_items").insert(cart.map(i => ({ 
          order_id: order.id, product_id: i.id, name: i.name, price: i.price, quantity: i.quantity 
        })));
        setCart([]); setCustomerName(""); setReceived(""); setIsCheckoutOpen(false); fetchData();
        alert("บันทึกสำเร็จ");
      }
    } catch (e) { alert("เกิดข้อผิดพลาด"); }
    setLoading(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 font-sans">
        <div className="bg-white p-8 rounded-3xl w-full max-w-sm shadow-2xl">
          <div className="text-center mb-8"><div className="w-16 h-16 bg-orange-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg"><ChefHat className="text-white" /></div><h1 className="text-xl font-bold">GEM POS LOGIN</h1></div>
          <form onSubmit={(e) => { e.preventDefault(); if (username === "admin" && password === "1234") setIsAuthenticated(true); else alert("Wrong Key/PIN"); }} className="space-y-4">
            <input type="text" placeholder="Access Key" className="w-full bg-slate-50 border rounded-xl py-3 px-4 outline-none" value={username} onChange={e => setUsername(e.target.value)} />
            <input type="password" placeholder="PIN" className="w-full bg-slate-50 border rounded-xl py-3 px-4 outline-none text-xl tracking-widest" value={password} onChange={e => setPassword(e.target.value)} />
            <button className="w-full bg-orange-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-orange-600/20 active:scale-95 transition-all">Authorize</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f1f5f9] text-slate-800 font-sans pb-20 lg:pb-0">
      {/* Top Nav */}
      <header className="bg-orange-600 text-white py-4 px-6 shadow-md print:hidden">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 font-black text-lg">
            <ChefHat className="w-6 h-6" /> <span>Krua Baan Gem v8.0</span>
          </div>
          <nav className="hidden lg:flex gap-2">
            {[
              { id: "pos", icon: ShoppingBag, label: "ขายสินค้า" },
              { id: "orders", icon: History, label: "จัดการออเดอร์" },
              { id: "inventory", icon: Package, label: "สต็อก" },
              { id: "analytics", icon: BarChart3, label: "สถิติ" }
            ].map(tab => (
              <button key={tab.id} onClick={() => { setActiveTab(tab.id as any); setSelectedOrder(null); }} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${activeTab === tab.id ? "bg-white text-orange-600 shadow-md" : "hover:bg-white/10"}`}>
                <tab.icon className="w-4 h-4" /> <span>{tab.label}</span>
              </button>
            ))}
            <button onClick={() => setIsAuthenticated(false)} className="ml-4 p-2 bg-white/10 rounded-lg"><LogOut className="w-4 h-4" /></button>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 lg:p-8 print:hidden">
        {activeTab === "pos" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 space-y-4">
              <div className="relative"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" /><input type="text" placeholder="ค้นหาเมนู..." className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-12 pr-4 shadow-sm outline-none" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} /></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {products.filter(p => p.name.includes(searchQuery)).map(p => (
                  <div key={p.id} onClick={() => addToCart(p)} className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 cursor-pointer hover:border-orange-500 transition-all active:scale-95">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0"><Image src={p.image} alt={p.name} fill className="object-cover" unoptimized /></div>
                    <div className="flex-1 min-w-0"><h4 className="font-bold text-sm truncate">{p.name}</h4><p className="text-orange-600 font-black text-base">฿{p.price}</p></div>
                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400"><Plus className="w-4 h-4" /></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:col-span-5">
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-6 sticky top-8 space-y-4">
                <h3 className="font-black text-lg border-b pb-4">ตะกร้าสินค้า ({cart.reduce((s, i) => s + i.quantity, 0)})</h3>
                <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                  {cart.map(item => (
                    <div key={item.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border">
                      <div className="flex-1 text-xs font-bold">{item.name}</div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-lg border text-xs font-black"><button onClick={() => setCart(c => c.map(i => i.id === item.id ? {...i, quantity: Math.max(0, i.quantity - 1)} : i).filter(i => i.quantity > 0))}><Minus className="w-3 h-3" /></button><span>{item.quantity}</span><button onClick={() => addToCart(item)}><Plus className="w-3 h-3" /></button></div>
                        <p className="w-12 text-right font-black text-sm">฿{item.price * item.quantity}</p>
                      </div>
                    </div>
                  ))}
                  {cart.length === 0 && <p className="text-center py-10 text-slate-400 text-sm">ว่างเปล่า</p>}
                </div>
                <div className="pt-4 border-t space-y-4">
                  <input type="text" placeholder="ชื่อลูกค้า (ถ้ามี)" className="w-full bg-slate-50 border rounded-xl py-3 px-4 outline-none text-sm" value={customerName} onChange={e => setCustomerName(e.target.value)} />
                  <div className="flex justify-between items-center"><p className="font-bold text-slate-500">ยอดรวมทั้งหมด</p><p className="text-3xl font-black text-orange-600">฿{cartTotal.toLocaleString()}</p></div>
                  <button onClick={() => setIsCheckoutOpen(true)} disabled={cart.length === 0} className="w-full bg-orange-600 text-white py-4 rounded-xl font-black text-lg shadow-lg shadow-orange-600/20 active:scale-95 transition-all disabled:opacity-50">ชำระเงิน</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "orders" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className={`lg:col-span-6 space-y-3 ${selectedOrder ? 'hidden lg:block' : 'block'}`}>
              <div className="bg-white rounded-2xl border border-slate-100 shadow-md overflow-hidden">
                <div className="p-4 border-b flex justify-between items-center bg-slate-50"><h2 className="font-black">ออเดอร์ทั้งหมด</h2><button onClick={fetchData}><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /></button></div>
                <div className="divide-y">
                  {orders.map(o => (
                    <div key={o.id} onClick={() => setSelectedOrder(o)} className={`p-4 cursor-pointer hover:bg-slate-50 transition-colors flex justify-between items-center ${selectedOrder?.id === o.id ? 'bg-orange-50 border-l-4 border-orange-500' : ''}`}>
                      <div><p className="font-bold text-sm">{o.name || "Walk-in"}</p><p className="text-[10px] text-slate-400">#{o.id.slice(-6)} • {new Date(o.created_at).toLocaleTimeString()}</p></div>
                      <div className="text-right"><p className="font-black text-orange-600">฿{o.total_amount}</p><span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${o.status === 'delivered' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>{o.status}</span></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {selectedOrder && (
              <div className="lg:col-span-6 space-y-6 animate-in slide-in-from-right-4 duration-300">
                <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                  <div className="bg-slate-900 text-white p-6 flex justify-between items-center"><h3 className="font-bold">รายละเอียดออเดอร์</h3><button onClick={() => setSelectedOrder(null)}><X className="w-5 h-5" /></button></div>
                  <div className="p-6 space-y-6">
                    <div className="flex justify-between items-start">
                      <div><h4 className="text-2xl font-black">{selectedOrder.name}</h4><p className="text-orange-500 font-bold">{selectedOrder.phone}</p></div>
                      <div className="flex gap-2">
                        <a href={`tel:${selectedOrder.phone}`} className="p-3 bg-slate-100 rounded-xl text-slate-600 hover:bg-orange-500 hover:text-white transition-all"><Phone className="w-5 h-5" /></a>
                        <a href={selectedOrder.location_url} target="_blank" className="p-3 bg-slate-100 rounded-xl text-slate-600 hover:bg-orange-500 hover:text-white transition-all"><MapPin className="w-5 h-5" /></a>
                      </div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border text-sm"><p className="text-[10px] font-black text-slate-400 uppercase mb-1">ที่อยู่จัดส่ง</p><p>{selectedOrder.address}</p></div>
                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-slate-400 uppercase">รายการอาหาร</p>
                      {selectedOrder.order_items?.map((item, i) => (
                        <div key={i} className="flex justify-between p-3 bg-white border border-slate-100 rounded-xl text-sm font-bold">
                          <span>{item.name} x{item.quantity}</span>
                          <span>฿{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {['preparing', 'ready', 'delivering', 'delivered'].map(s => (
                        <button key={s} onClick={() => updateStatus(selectedOrder.id, s as any)} className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedOrder.status === s ? 'bg-orange-600 text-white shadow-md' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}>{s}</button>
                      ))}
                    </div>
                    <div className="flex gap-3 pt-4 border-t">
                      <button onClick={() => setPreviewSlip(selectedOrder.slip_url)} disabled={!selectedOrder.slip_url} className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-100 rounded-xl text-xs font-bold disabled:opacity-30"><Eye className="w-4 h-4" /> ดูสลิป</button>
                      <button onClick={() => window.print()} className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold"><Printer className="w-4 h-4" /> พิมพ์ใบเสร็จ</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "inventory" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {products.map(p => (
              <div key={p.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0"><Image src={p.image} alt={p.name} fill className={`object-cover ${!p.is_available ? 'grayscale opacity-30' : ''}`} unoptimized /></div>
                <div className="flex-1 min-w-0 text-sm font-bold truncate">{p.name}</div>
                <button onClick={() => toggleStock(p.id, p.is_available)} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${p.is_available ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-400'}`}>{p.is_available ? 'เปิด' : 'ปิด'}</button>
              </div>
            ))}
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border shadow-sm">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">รายได้วันนี้</p>
                <p className="text-3xl font-black text-orange-600">฿{orders.filter(o => o.created_at.startsWith(new Date().toISOString().split('T')[0])).reduce((s, o) => s + Number(o.total_amount), 0).toLocaleString()}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border shadow-sm">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">จำนวนบิล</p>
                <p className="text-3xl font-black text-slate-800">{orders.filter(o => o.created_at.startsWith(new Date().toISOString().split('T')[0])).length}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border shadow-sm">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">กำไร (EST. 40%)</p>
                <p className="text-3xl font-black text-green-600">฿{(orders.filter(o => o.created_at.startsWith(new Date().toISOString().split('T')[0])).reduce((s, o) => s + Number(o.total_amount), 0) * 0.4).toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Checkout Modal */}
      <AnimatePresence>
        {isCheckoutOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
              <div className="p-6 border-b flex justify-between items-center font-black">ชำระเงิน <X className="cursor-pointer" onClick={() => setIsCheckoutOpen(false)} /></div>
              <div className="p-8 space-y-6">
                <div className="bg-slate-50 p-6 rounded-2xl border flex justify-between items-center"><p className="font-bold text-slate-500">ยอดรวม:</p><p className="text-3xl font-black text-orange-600">฿{cartTotal.toLocaleString()}</p></div>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setPayMethod("cash")} className={`py-4 rounded-xl font-bold border-2 transition-all ${payMethod === 'cash' ? 'bg-slate-900 text-white border-slate-900' : 'text-slate-400'}`}>เงินสด</button>
                  <button onClick={() => setPayMethod("credit")} className={`py-4 rounded-xl font-bold border-2 transition-all ${payMethod === 'credit' ? 'bg-slate-900 text-white border-slate-900' : 'text-slate-400'}`}>บัตรเครดิต</button>
                </div>
                {payMethod === "cash" && (
                  <div className="space-y-3">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">เงินที่รับมา</p>
                    <input type="number" className="w-full bg-slate-50 border-2 rounded-2xl py-4 px-6 text-2xl font-black outline-none focus:border-orange-500" value={received} onChange={e => setReceived(e.target.value)} autoFocus />
                    <div className="flex justify-between items-center px-2"><p className="text-sm font-bold text-slate-400">เงินทอน:</p><p className="text-xl font-black text-green-600">฿{change.toLocaleString()}</p></div>
                  </div>
                )}
                <button onClick={handleFinishSale} className="w-full bg-green-600 text-white py-4 rounded-xl font-black text-lg shadow-lg shadow-green-600/20 active:scale-95 transition-all">ยืนยันการขาย</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Slip Modal */}
      <AnimatePresence>
        {previewSlip && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md" onClick={() => setPreviewSlip(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative max-w-sm w-full bg-white rounded-3xl p-2" onClick={e => e.stopPropagation()}>
              <button className="absolute -top-4 -right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-xl z-10" onClick={() => setPreviewSlip(null)}><X className="w-5 h-5" /></button>
              <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-slate-100">
                <Image src={previewSlip} alt="Slip" fill className="object-contain" unoptimized />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile Tab Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t px-6 py-3 flex items-center justify-between shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
        {[
          { id: "pos", icon: ShoppingBag, label: "ขาย" },
          { id: "orders", icon: History, label: "ออเดอร์" },
          { id: "inventory", icon: Package, label: "สต็อก" },
          { id: "analytics", icon: BarChart3, label: "สถิติ" }
        ].map(tab => (
          <button key={tab.id} onClick={() => { setActiveTab(tab.id as any); setSelectedOrder(null); }} className={`flex flex-col items-center gap-1 transition-all ${activeTab === tab.id ? "text-orange-600" : "text-slate-400"}`}>
            <tab.icon className="w-5 h-5" />
            <span className="text-[9px] font-bold uppercase">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Print Layout */}
      <div className="hidden print:block w-full max-w-[80mm] p-4 text-black font-sans bg-white mx-auto">
        <div className="text-center border-b pb-4 mb-4 font-black">
          <h2 className="text-lg">Krua Baan Gem</h2>
          <p className="text-[10px]">Homemade Quality</p>
        </div>
        {selectedOrder && (
          <div className="space-y-4 text-xs">
            <div className="flex justify-between font-bold"><span>Customer:</span><span>{selectedOrder.name}</span></div>
            <div className="flex justify-between font-bold"><span>Phone:</span><span>{selectedOrder.phone}</span></div>
            <div className="border-y py-2 space-y-1">
              {selectedOrder.order_items?.map((item, i) => (
                <div key={i} className="flex justify-between">
                  <span>[ ] {item.name} x{item.quantity}</span>
                  <span>฿{item.price * item.quantity}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between font-black text-sm"><span>Total:</span><span>฿{selectedOrder.total_amount}</span></div>
            <p className="text-center pt-6 text-[10px] opacity-50">ขอบคุณที่ใช้บริการครับ</p>
          </div>
        )}
      </div>

      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          .print\:block, .print\:block * { visibility: visible; }
          .print\:block { position: fixed; left: 0; top: 0; width: 100%; }
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
      `}</style>
    </div>
  );
}
