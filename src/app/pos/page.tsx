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
  ExternalLink
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
  address: string;
  location_url: string;
  total_amount: number;
  status: OrderStatus;
  payment_status: string;
  payment_method: string;
  slip_url: string;
  order_items: any[];
}

export default function ProfessionalPos() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeView, setActiveView] = useState<"pos" | "orders" | "analytics" | "inventory">("pos");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  
  // Data State
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  
  // UI State
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
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
    if (isAuthenticated) {
      fetchData();
      const channel = supabase.channel("pos_v7_2").on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => fetchData()).subscribe();
      return () => { supabase.removeChannel(channel); };
    }
  }, [isAuthenticated, fetchData]);

  const updateStatus = async (id: string, status: OrderStatus) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (!error) {
      fetchData();
      if (selectedOrder?.id === id) {
        setSelectedOrder(prev => prev ? { ...prev, status } : null);
      }
    }
  };

  const toggleAvailability = async (id: string, current: boolean) => {
    await supabase.from("products").update({ is_available: !current }).eq("id", id);
    fetchData();
  };

  // Analytics Logic
  const analyticsData = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayOrders = orders.filter(o => o.created_at.startsWith(today) && o.status !== 'cancelled');
    const revenue = todayOrders.reduce((sum, o) => sum + Number(o.total_amount), 0);
    const productSales: { [key: string]: number } = {};
    orders.forEach(o => o.order_items?.forEach(item => { productSales[item.name] = (productSales[item.name] || 0) + item.quantity; }));
    const topProducts = Object.entries(productSales).map(([name, qty]) => ({ name, qty })).sort((a, b) => b.qty - a.qty).slice(0, 5);
    return { revenue, orderCount: todayOrders.length, topProducts };
  }, [orders]);

  // Cart Logic
  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => item.id === id ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item).filter(item => item.quantity > 0));
  };

  const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + (item.price * item.quantity), 0), [cart]);
  const changeAmount = useMemo(() => Math.max(0, (parseFloat(amountReceived) || 0) - cartTotal), [amountReceived, cartTotal]);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setLoading(true);
    try {
      const { data: order, error: orderError } = await supabase.from("orders").insert([{ name: customerName || "Walk-in Customer", phone: "0000000000", address: "ขายหน้าร้าน (POS)", total_amount: cartTotal, status: "delivered", payment_status: "verified", payment_method: paymentMethod === 'cash' ? 'เงินสด' : 'บัตรเครดิต' }]).select().single();
      if (orderError) throw orderError;
      await supabase.from("order_items").insert(cart.map(item => ({ order_id: order.id, product_id: item.id, name: item.name, price: item.price, quantity: item.quantity })));
      setCart([]); setCustomerName(""); setAmountReceived(""); setIsPaymentModalOpen(false); fetchData(); alert("ชำระเงินสำเร็จ!");
    } catch (err) { alert("เกิดข้อผิดพลาด"); } finally { setLoading(false); }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-10 rounded-3xl w-full max-w-sm shadow-2xl border border-slate-100">
          <div className="text-center mb-8"><div className="w-20 h-20 bg-orange-500 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg"><ChefHat className="w-10 h-10 text-white" /></div><h1 className="text-2xl font-black text-slate-800">ระบบขายหน้าร้าน</h1><p className="text-slate-400 text-sm font-medium mt-1">Krua Baan Gem v7.2</p></div>
          <form onSubmit={(e) => { e.preventDefault(); if (username === "admin" && password === "1234") setIsAuthenticated(true); else alert("รหัสผ่านไม่ถูกต้อง"); }} className="space-y-4">
            <input type="text" placeholder="Access Key" className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 text-slate-800 font-bold outline-none" value={username} onChange={e => setUsername(e.target.value)} />
            <input type="password" placeholder="PIN" className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 text-slate-800 text-2xl tracking-[0.5em] outline-none" value={password} onChange={e => setPassword(e.target.value)} />
            <button className="w-full bg-orange-600 text-white py-5 rounded-2xl font-black">เข้าสู่ระบบ</button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-slate-800 pb-24 lg:pb-0">
      <header className="bg-orange-600 text-white py-6 px-6 lg:px-12 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="hidden lg:block bg-white/20 p-2 rounded-xl"><ChefHat className="w-6 h-6" /></div>
            <h1 className="text-xl font-black">ครัวบ้านเจ็ม POS</h1>
          </div>
          <nav className="hidden lg:flex items-center gap-2">
            {[{ id: "pos", icon: ShoppingBag, label: "ขายสินค้า" }, { id: "orders", icon: History, label: "จัดการออเดอร์" }, { id: "analytics", icon: BarChart3, label: "วิเคราะห์" }, { id: "inventory", icon: Package, label: "สต็อก" }].map(item => (
              <button key={item.id} onClick={() => { setActiveView(item.id as any); setSelectedOrder(null); }} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all ${activeView === item.id ? "bg-white text-orange-600" : "hover:bg-white/10"}`}>
                <item.icon className="w-4 h-4" /> <span>{item.label}</span>
              </button>
            ))}
            <button onClick={() => setIsAuthenticated(false)} className="ml-4 p-3 bg-white/10 rounded-xl"><LogOut className="w-4 h-4" /></button>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 lg:p-10">
        {activeView === "pos" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 space-y-6">
              <div className="relative"><Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input type="text" placeholder="ค้นหาเมนู..." className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-12 pr-6 shadow-sm outline-none" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} /></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {products.filter(p => p.name.includes(searchQuery)).map(p => (
                  <div key={p.id} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 group">
                    <div className="relative w-20 h-20 rounded-2xl overflow-hidden shrink-0"><Image src={p.image} alt={p.name} fill className="object-cover" unoptimized /></div>
                    <div className="flex-1 min-w-0"><h4 className="font-bold text-slate-800 truncate">{p.name}</h4><p className="text-orange-600 font-black text-lg">฿{p.price}</p></div>
                    <button onClick={() => addToCart(p)} className="w-10 h-10 bg-orange-600 text-white rounded-xl flex items-center justify-center"><Plus className="w-5 h-5" /></button>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:col-span-5">
              <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl p-8 sticky top-10 flex flex-col gap-6">
                <div className="flex justify-between items-center"><h3 className="text-xl font-black">ตะกร้าสินค้า</h3><ShoppingCart className="text-orange-600" /></div>
                <div className="space-y-3 max-h-[350px] overflow-y-auto custom-scrollbar">
                  {cart.map(item => (
                    <div key={item.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex-1 font-bold text-sm">{item.name}</div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-white px-2 rounded-lg border"><button onClick={() => updateQuantity(item.id, -1)}><Minus className="w-3 h-3" /></button><span className="w-4 text-center text-xs font-black">{item.quantity}</span><button onClick={() => updateQuantity(item.id, 1)}><Plus className="w-3 h-3" /></button></div>
                        <p className="w-12 text-right font-black text-sm">฿{item.price * item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="pt-6 border-t space-y-4">
                  <input type="text" placeholder="ชื่อลูกค้า..." className="w-full bg-slate-50 border rounded-2xl py-4 px-6 outline-none" value={customerName} onChange={e => setCustomerName(e.target.value)} />
                  <div className="flex justify-between items-center"><p className="font-bold text-slate-500">ยอดรวม</p><p className="text-4xl font-black text-orange-600">฿{cartTotal.toLocaleString()}</p></div>
                  <button onClick={() => setIsPaymentModalOpen(true)} disabled={cart.length === 0} className="w-full bg-orange-600 text-white py-5 rounded-2xl font-black text-xl shadow-xl shadow-orange-600/20 active:scale-95 transition-all">ชำระเงิน</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeView === "orders" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className={`lg:col-span-7 space-y-4 ${selectedOrder ? 'hidden lg:block' : 'block'}`}>
              <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl overflow-hidden">
                <div className="p-8 border-b flex justify-between items-center"><h2 className="text-xl font-black">รายการออเดอร์</h2><button onClick={fetchData} className="p-3 bg-slate-50 rounded-xl"><RefreshCw className="w-4 h-4" /></button></div>
                <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400"><tr><th className="p-6">ID/Name</th><th className="p-6 text-right">ยอดรวม</th><th className="p-6">สถานะ</th><th className="p-6"></th></tr></thead><tbody className="divide-y">{orders.map(o => (<tr key={o.id} onClick={() => setSelectedOrder(o)} className={`cursor-pointer hover:bg-slate-50 ${selectedOrder?.id === o.id ? 'bg-orange-50' : ''}`}><td className="p-6"><p className="font-black">{o.name}</p><p className="text-[10px] text-slate-400">#{o.id.slice(-6)}</p></td><td className="p-6 text-right font-black">฿{o.total_amount}</td><td className="p-6"><span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${o.status === 'delivered' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>{o.status}</span></td><td className="p-6 text-slate-300"><ChevronRight className="w-5 h-5" /></td></tr>))}</tbody></table></div>
              </div>
            </div>

            {/* Detail Drawer - THE RETURN */}
            <AnimatePresence>
              {selectedOrder && (
                <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="fixed inset-0 z-50 lg:static lg:inset-auto lg:col-span-5 bg-white lg:rounded-[2.5rem] border shadow-2xl p-8 flex flex-col gap-6 overflow-y-auto">
                  <div className="flex justify-between items-center">
                    <button onClick={() => setSelectedOrder(null)} className="lg:hidden p-2 bg-slate-100 rounded-full"><X className="w-6 h-6" /></button>
                    <h3 className="text-xl font-black uppercase italic">Customer Info</h3>
                    <button onClick={() => setSelectedOrder(null)} className="hidden lg:block p-2 hover:bg-slate-100 rounded-xl"><X className="w-5 h-5" /></button>
                  </div>

                  <div className="bg-slate-900 text-white rounded-[2rem] p-8 space-y-4">
                    <div className="flex justify-between items-start">
                      <div><h4 className="text-2xl font-black">{selectedOrder.name}</h4><p className="text-orange-400 font-bold">{selectedOrder.phone}</p></div>
                      <a href={`tel:${selectedOrder.phone}`} className="p-4 bg-orange-600 rounded-2xl"><Phone className="w-6 h-6" /></a>
                    </div>
                    <div className="space-y-2 pt-4 border-t border-white/10">
                      <p className="text-[10px] font-black uppercase text-white/40 tracking-widest">Delivery Address</p>
                      <p className="text-sm font-medium leading-relaxed">{selectedOrder.address}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 pt-4">
                      <a href={selectedOrder.location_url} target="_blank" className="flex items-center justify-center gap-2 bg-white/10 py-3 rounded-xl text-xs font-bold"><MapPin className="w-4 h-4" /> แผนที่</a>
                      <button onClick={() => window.open(selectedOrder.slip_url, '_blank')} className="flex items-center justify-center gap-2 bg-white/10 py-3 rounded-xl text-xs font-bold"><Eye className="w-4 h-4" /> ดูสลิป</button>
                    </div>
                  </div>

                  <div className="flex-1 space-y-4">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Order Items</p>
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
                    <button className="col-span-2 bg-slate-900 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 mt-2"><Printer className="w-4 h-4" /> Print Receipt</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {activeView === "analytics" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-white p-8 rounded-[2rem] border shadow-xl flex items-center justify-between">
              <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">ยอดขายวันนี้</p><p className="text-4xl font-black text-blue-600 italic">฿{analyticsData.revenue.toLocaleString()}</p></div>
              <DollarSign className="w-10 h-10 text-blue-100" />
            </div>
            <div className="bg-white p-8 rounded-[2rem] border shadow-xl flex items-center justify-between">
              <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">จำนวนออเดอร์</p><p className="text-4xl font-black text-orange-600 italic">{analyticsData.orderCount}</p></div>
              <ShoppingBag className="w-10 h-10 text-orange-100" />
            </div>
            <div className="bg-white p-8 rounded-[2rem] border shadow-xl flex items-center justify-between">
              <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">กำไร (EST.)</p><p className="text-4xl font-black text-green-600 italic">฿{(analyticsData.revenue * 0.4).toLocaleString()}</p></div>
              <TrendingUp className="w-10 h-10 text-green-100" />
            </div>
          </div>
        )}

        {activeView === "inventory" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {products.map(p => (
              <div key={p.id} className="bg-white p-6 rounded-3xl border shadow-sm flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0"><Image src={p.image} alt={p.name} fill className={`object-cover ${!p.is_available ? 'grayscale opacity-30' : ''}`} unoptimized /></div>
                <div className="flex-1 min-w-0"><h4 className="font-bold truncate text-sm">{p.name}</h4><p className="text-xs text-orange-600 font-black">฿{p.price}</p></div>
                <button onClick={() => toggleAvailability(p.id, p.is_available)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${p.is_available ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-400'}`}>{p.is_available ? 'เปิด' : 'ปิด'}</button>
              </div>
            ))}
          </div>
        )}
      </main>

      <AnimatePresence>
        {isPaymentModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-[3rem] w-full max-w-md shadow-2xl overflow-hidden">
              <div className="p-8 border-b flex justify-between items-center font-black">ชำระเงิน <X className="cursor-pointer" onClick={() => setIsPaymentModalOpen(false)} /></div>
              <div className="p-10 space-y-8">
                <div className="bg-slate-50 p-8 rounded-3xl flex justify-between items-center"><p className="font-bold text-slate-500">ยอดรวม:</p><p className="text-4xl font-black text-orange-600">฿{cartTotal.toLocaleString()}</p></div>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => setPaymentMethod("cash")} className={`py-5 rounded-2xl font-black border-2 transition-all ${paymentMethod === 'cash' ? 'bg-slate-900 text-white' : 'text-slate-400'}`}>เงินสด</button>
                  <button onClick={() => setPaymentMethod("credit")} className={`py-5 rounded-2xl font-black border-2 transition-all ${paymentMethod === 'credit' ? 'bg-slate-900 text-white' : 'text-slate-400'}`}>บัตรเครดิต</button>
                </div>
                {paymentMethod === "cash" && (
                  <div className="space-y-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">เงินที่รับมา</p>
                    <input type="number" className="w-full bg-slate-50 border-2 rounded-3xl py-6 px-8 text-3xl font-black outline-none focus:border-orange-500" value={amountReceived} onChange={e => setAmountReceived(e.target.value)} />
                    <div className="flex justify-between items-center px-4"><p className="text-sm font-bold text-slate-400">เงินทอน:</p><p className="text-2xl font-black text-green-600">฿{changeAmount.toLocaleString()} บาท</p></div>
                  </div>
                )}
                <button onClick={handleCheckout} className="w-full bg-green-600 text-white py-6 rounded-3xl font-black text-xl shadow-xl shadow-green-600/20 active:scale-95 transition-all">ยืนยันการชำระเงิน</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t px-8 py-4 flex items-center justify-between shadow-2xl">
        {[{ id: "pos", icon: ShoppingBag, label: "ขาย" }, { id: "orders", icon: History, label: "จัดการ" }, { id: "analytics", icon: BarChart3, label: "สถิติ" }, { id: "inventory", icon: Package, label: "สต็อก" }].map(item => (
          <button key={item.id} onClick={() => { setActiveView(item.id as any); setSelectedOrder(null); }} className={`flex flex-col items-center gap-1 transition-all ${activeView === item.id ? "text-orange-600 scale-110" : "text-slate-400"}`}><item.icon className="w-6 h-6" /><span className="text-[9px] font-bold uppercase">{item.label}</span></button>
        ))}
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </div>
  );
}
