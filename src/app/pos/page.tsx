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
  History,
  CheckCircle2,
  Printer,
  TrendingUp,
  Activity,
  DollarSign,
  MapPin,
  Eye,
  Truck,
  Clock,
  ChevronRight,
  ExternalLink,
  Maximize2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

type OrderStatus = "pending" | "preparing" | "ready" | "delivering" | "delivered" | "cancelled";

interface Product { id: string; name: string; price: number; image: string; category: string; is_available: boolean; }
interface CartItem extends Product { quantity: number; }
interface Order { id: string; created_at: string; name: string; phone: string; address: string; location_url: string; total_amount: number; status: OrderStatus; payment_status: string; payment_method: string; slip_url: string; order_items: any[]; }

export default function ProfessionalPos() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeView, setActiveView] = useState<"pos" | "orders" | "analytics" | "inventory">("pos");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "credit">("cash");
  const [amountReceived, setAmountReceived] = useState<string>("");
  
  // New States for v7.3
  const [previewSlipUrl, setPreviewSlipUrl] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data: pData } = await supabase.from("products").select("*").order("name");
    const { data: oData } = await supabase.from("orders").select("*, order_items(*)").order("created_at", { ascending: false });
    if (pData) setProducts(pData);
    if (oData) setOrders(oData);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
      const channel = supabase.channel("pos_v7_3").on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => fetchData()).subscribe();
      return () => { supabase.removeChannel(channel); };
    }
  }, [isAuthenticated, fetchData]);

  const updateStatus = async (id: string, status: OrderStatus) => {
    await supabase.from("orders").update({ status }).eq("id", id);
    fetchData();
    if (selectedOrder?.id === id) setSelectedOrder(prev => prev ? { ...prev, status } : null);
  };

  const analyticsData = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayOrders = orders.filter(o => o.created_at.startsWith(today) && o.status !== 'cancelled');
    const revenue = todayOrders.reduce((sum, o) => sum + Number(o.total_amount), 0);
    const productSales: { [key: string]: number } = {};
    orders.forEach(o => o.order_items?.forEach(item => { productSales[item.name] = (productSales[item.name] || 0) + item.quantity; }));
    const topProducts = Object.entries(productSales).map(([name, qty]) => ({ name, qty })).sort((a, b) => b.qty - a.qty).slice(0, 5);
    return { revenue, orderCount: todayOrders.length, topProducts };
  }, [orders]);

  const addToCart = (p: Product) => setCart(prev => {
    const ex = prev.find(i => i.id === p.id);
    return ex ? prev.map(i => i.id === p.id ? { ...i, quantity: i.quantity + 1 } : i) : [...prev, { ...p, quantity: 1 }];
  });

  const cartTotal = useMemo(() => cart.reduce((s, i) => s + (i.price * i.quantity), 0), [cart]);
  const changeAmount = useMemo(() => Math.max(0, (parseFloat(amountReceived) || 0) - cartTotal), [amountReceived, cartTotal]);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setLoading(true);
    try {
      const { data: order } = await supabase.from("orders").insert([{ name: customerName || "Walk-in Customer", phone: "0000000000", address: "ขายหน้าร้าน (POS)", total_amount: cartTotal, status: "delivered", payment_status: "verified", payment_method: paymentMethod === 'cash' ? 'เงินสด' : 'บัตรเครดิต' }]).select().single();
      await supabase.from("order_items").insert(cart.map(item => ({ order_id: order.id, product_id: item.id, name: item.name, price: item.price, quantity: item.quantity })));
      setCart([]); setCustomerName(""); setAmountReceived(""); setIsPaymentModalOpen(false); fetchData();
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="bg-slate-900 p-10 rounded-[2.5rem] w-full max-w-sm border border-slate-800 shadow-2xl text-center">
          <div className="w-20 h-20 bg-orange-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg"><ChefHat className="w-10 h-10 text-white" /></div>
          <h1 className="text-2xl font-black text-white italic">MERCHANT LOGIN</h1>
          <form onSubmit={(e) => { e.preventDefault(); if (username === "admin" && password === "1234") setIsAuthenticated(true); }} className="mt-8 space-y-4">
            <input type="text" placeholder="Key" className="w-full bg-slate-800 border-none rounded-2xl py-4 px-6 text-white font-bold outline-none" value={username} onChange={e => setUsername(e.target.value)} />
            <input type="password" placeholder="PIN" className="w-full bg-slate-800 border-none rounded-2xl py-4 px-6 text-white text-2xl tracking-widest outline-none" value={password} onChange={e => setPassword(e.target.value)} />
            <button className="w-full bg-orange-600 text-white py-5 rounded-2xl font-black">Authorize</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-slate-800 pb-24 lg:pb-0">
      <header className="bg-orange-600 text-white py-6 px-6 lg:px-12 shadow-lg print:hidden">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4"><div className="bg-white/20 p-2 rounded-xl"><ChefHat className="w-6 h-6" /></div><h1 className="text-xl font-black">ครัวบ้านเจ็ม POS</h1></div>
          <nav className="hidden lg:flex items-center gap-2">
            {[{ id: "pos", icon: ShoppingBag, label: "ขายสินค้า" }, { id: "orders", icon: History, label: "จัดการออเดอร์" }, { id: "analytics", icon: BarChart3, label: "วิเคราะห์" }, { id: "inventory", icon: Package, label: "สต็อก" }].map(item => (
              <button key={item.id} onClick={() => { setActiveView(item.id as any); setSelectedOrder(null); }} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all ${activeView === item.id ? "bg-white text-orange-600 shadow-md" : "hover:bg-white/10"}`}>
                <item.icon className="w-4 h-4" /> <span>{item.label}</span>
              </button>
            ))}
            <button onClick={() => setIsAuthenticated(false)} className="ml-4 p-3 bg-white/10 rounded-xl"><LogOut className="w-4 h-4" /></button>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 lg:p-10 print:hidden">
        {activeView === "pos" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 space-y-6">
              <div className="relative"><Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input type="text" placeholder="Search menu..." className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-12 pr-6 shadow-sm outline-none" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} /></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {products.filter(p => p.name.includes(searchQuery)).map(p => (
                  <div key={p.id} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 group transition-all hover:shadow-md">
                    <div className="relative w-20 h-20 rounded-2xl overflow-hidden shrink-0"><Image src={p.image} alt={p.name} fill className="object-cover" unoptimized /></div>
                    <div className="flex-1"><h4 className="font-bold text-slate-800 text-sm">{p.name}</h4><p className="text-orange-600 font-black text-lg">฿{p.price}</p></div>
                    <button onClick={() => addToCart(p)} className="w-10 h-10 bg-orange-600 text-white rounded-xl flex items-center justify-center hover:scale-110 active:scale-90 transition-all"><Plus className="w-5 h-5" /></button>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:col-span-5">
              <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl p-8 sticky top-10 flex flex-col gap-6">
                <div className="flex justify-between items-center font-black text-xl">ตะกร้าสินค้า <ShoppingCart className="text-orange-600" /></div>
                <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
                  {cart.map(item => (
                    <div key={item.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-2xl border">
                      <div className="flex-1 text-xs font-bold">{item.name}</div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-white px-2 rounded-lg border font-black text-xs"><button onClick={() => setCart(c => c.map(i => i.id === item.id ? {...i, quantity: Math.max(0, i.quantity - 1)} : i).filter(i => i.quantity > 0))}><Minus className="w-3 h-3" /></button><span>{item.quantity}</span><button onClick={() => addToCart(item)}><Plus className="w-3 h-3" /></button></div>
                        <p className="w-12 text-right font-black text-sm">฿{item.price * item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="pt-6 border-t space-y-4">
                  <input type="text" placeholder="ชื่อลูกค้า..." className="w-full bg-slate-50 border rounded-2xl py-4 px-6 outline-none" value={customerName} onChange={e => setCustomerName(e.target.value)} />
                  <div className="flex justify-between items-center"><p className="font-bold text-slate-500">ยอดรวม</p><p className="text-4xl font-black text-orange-600 tracking-tighter">฿{cartTotal.toLocaleString()}</p></div>
                  <button onClick={() => setIsPaymentModalOpen(true)} disabled={cart.length === 0} className="w-full bg-orange-600 text-white py-5 rounded-3xl font-black text-xl active:scale-95 transition-all">ชำระเงิน</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeView === "orders" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className={`lg:col-span-7 space-y-4 ${selectedOrder ? 'hidden lg:block' : 'block'}`}>
              <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl overflow-hidden">
                <div className="p-8 border-b flex justify-between items-center font-black text-xl">รายการออเดอร์ <button onClick={fetchData} className="p-2"><RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} /></button></div>
                <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400"><tr><th className="p-6">ID/Name</th><th className="p-6 text-right">ยอดรวม</th><th className="p-6">สถานะ</th><th className="p-6"></th></tr></thead><tbody className="divide-y">{orders.map(o => (<tr key={o.id} onClick={() => setSelectedOrder(o)} className={`cursor-pointer hover:bg-slate-50 ${selectedOrder?.id === o.id ? 'bg-orange-50' : ''}`}><td className="p-6"><p className="font-black">{o.name}</p><p className="text-[10px] text-slate-400">#{o.id.slice(-6)}</p></td><td className="p-6 text-right font-black text-orange-600">฿{o.total_amount}</td><td className="p-6"><span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${o.status === 'delivered' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>{o.status}</span></td><td className="p-6 text-slate-300"><ChevronRight className="w-5 h-5" /></td></tr>))}</tbody></table></div>
              </div>
            </div>

            <AnimatePresence>
              {selectedOrder && (
                <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="fixed inset-0 z-50 lg:static bg-white lg:rounded-[2.5rem] border shadow-2xl p-8 flex flex-col gap-6 overflow-y-auto">
                  <div className="flex justify-between items-center font-black">Customer Details <X className="cursor-pointer" onClick={() => setSelectedOrder(null)} /></div>
                  
                  <div className="bg-slate-900 text-white rounded-[2rem] p-8 space-y-6">
                    <div className="flex justify-between items-start">
                      <div><h4 className="text-2xl font-black">{selectedOrder.name}</h4><p className="text-orange-400 font-bold">{selectedOrder.phone}</p></div>
                      <a href={`tel:${selectedOrder.phone}`} className="p-4 bg-orange-600 rounded-2xl shadow-lg"><Phone className="w-6 h-6" /></a>
                    </div>
                    <div className="space-y-1"><p className="text-[10px] font-black uppercase text-white/40 tracking-widest">Address</p><p className="text-sm font-medium">{selectedOrder.address}</p></div>
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <a href={selectedOrder.location_url} target="_blank" className="flex items-center justify-center gap-2 bg-white/10 py-3 rounded-xl text-xs font-bold border border-white/5"><MapPin className="w-4 h-4" /> Maps</a>
                      <button onClick={() => setPreviewSlipUrl(selectedOrder.slip_url)} className="flex items-center justify-center gap-2 bg-white/10 py-3 rounded-xl text-xs font-bold border border-white/5"><Eye className="w-4 h-4" /> ดูสลิปที่นี่</button>
                    </div>
                  </div>

                  <div className="flex-1 space-y-4">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Order List</p>
                    <div className="space-y-2">
                      {selectedOrder.order_items?.map((item, i) => (
                        <div key={i} className="flex justify-between p-4 bg-slate-50 rounded-2xl border">
                          <p className="font-bold text-sm">{item.name} <span className="text-orange-600 ml-1">x{item.quantity}</span></p>
                          <p className="font-black text-sm">฿{item.price * item.quantity}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 border-t grid grid-cols-2 gap-3">
                    {['preparing', 'ready', 'delivering', 'delivered'].map(s => (
                      <button key={s} onClick={() => updateStatus(selectedOrder.id, s as any)} className={`py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedOrder.status === s ? 'bg-orange-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}>{s}</button>
                    ))}
                    <button onClick={() => window.print()} className="col-span-2 bg-slate-900 text-white py-5 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 mt-2 shadow-2xl active:scale-95 transition-all"><Printer className="w-5 h-5" /> PRINT FOR STICKER</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Inline Slip Preview Modal */}
      <AnimatePresence>
        {previewSlipUrl && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md" onClick={() => setPreviewSlipUrl(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative max-w-lg w-full bg-white rounded-[2.5rem] p-4 shadow-2xl" onClick={e => e.stopPropagation()}>
              <button className="absolute -top-4 -right-4 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-2xl z-10" onClick={() => setPreviewSlipUrl(null)}><X className="w-6 h-6" /></button>
              <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-slate-100">
                <Image src={previewSlipUrl} alt="Slip" fill className="object-contain" unoptimized />
              </div>
              <div className="mt-4 text-center pb-2"><p className="text-xs font-black text-slate-400 uppercase tracking-widest">Payment Verification</p></div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* POS Receipt / Sticker Print Layout (Hidden on Screen) */}
      <div className="hidden print:block w-full max-w-[80mm] p-4 text-black font-sans bg-white mx-auto">
        <div className="text-center border-b-2 border-black pb-4 mb-4">
          <h2 className="text-xl font-black uppercase italic">Krua Baan Gem</h2>
          <p className="text-[10px] font-bold mt-1 uppercase tracking-widest">Homemade Quality</p>
        </div>

        {selectedOrder && (
          <div className="space-y-4">
            <div className="text-center py-2 bg-black text-white rounded-lg">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Order Status: {selectedOrder.status}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-2xl font-black leading-none">{selectedOrder.name}</p>
              <p className="text-lg font-bold">{selectedOrder.phone}</p>
            </div>

            <div className="border-y border-dashed border-black py-4">
              <p className="text-[10px] font-black uppercase mb-3 tracking-widest">Items List</p>
              <div className="space-y-3">
                {selectedOrder.order_items?.map((item, i) => (
                  <div key={i} className="flex justify-between items-start gap-2">
                    <p className="text-base font-bold flex-1 underline decoration-dotted underline-offset-4">
                      [ ] {item.name} <span className="font-black text-lg">x{item.quantity}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-end pt-2">
              <div>
                <p className="text-[8px] font-black uppercase">Order ID</p>
                <p className="text-[10px] font-bold">#{selectedOrder.id.slice(-12).toUpperCase()}</p>
              </div>
              <div className="text-right">
                <p className="text-[8px] font-black uppercase">Grand Total</p>
                <p className="text-2xl font-black tracking-tighter">฿{selectedOrder.total_amount}</p>
              </div>
            </div>

            <p className="text-center text-[10px] font-bold uppercase tracking-[0.3em] pt-8 opacity-50">
              Thank You! Enjoy your meal
            </p>
          </div>
        )}
      </div>

      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          .print\:block, .print\:block * { visibility: visible; }
          .print\:block { position: fixed; left: 0; top: 0; width: 100%; height: auto; padding: 10px; }
          @page { margin: 0; size: 80mm auto; }
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </div>
  );
}
