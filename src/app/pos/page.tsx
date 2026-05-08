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
  Printer,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  DollarSign
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

  // Analytics Logic
  const analyticsData = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayOrders = orders.filter(o => o.created_at.startsWith(today));
    
    const revenue = todayOrders.reduce((sum, o) => sum + Number(o.total_amount), 0);
    const cost = revenue * 0.55; // Simulated cost (55%)
    const profit = revenue - cost;
    
    // Calculate top products
    const productSales: { [key: string]: number } = {};
    orders.forEach(o => {
      o.order_items?.forEach(item => {
        productSales[item.name] = (productSales[item.name] || 0) + item.quantity;
      });
    });
    
    const topProducts = Object.entries(productSales)
      .map(([name, qty]) => ({ name, qty }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    return { revenue, cost, profit, orderCount: todayOrders.length, topProducts };
  }, [orders]);

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
      const orderItems = cart.map(item => ({ order_id: order.id, product_id: item.id, name: item.name, price: item.price, quantity: item.quantity }));
      await supabase.from("order_items").insert(orderItems);
      setCart([]); setCustomerName(""); setAmountReceived(""); setIsPaymentModalOpen(false); fetchData();
      alert("ชำระเงินสำเร็จ!");
    } catch (err) { console.error(err); alert("เกิดข้อผิดพลาด"); } finally { setLoading(false); }
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
            <input type="text" placeholder="Access Key" className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 text-slate-800 font-bold focus:ring-2 focus:ring-orange-500 outline-none" value={username} onChange={e => setUsername(e.target.value)} />
            <input type="password" placeholder="PIN" className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 text-slate-800 text-2xl tracking-[0.5em] focus:ring-2 focus:ring-orange-500 outline-none" value={password} onChange={e => setPassword(e.target.value)} />
            <button className="w-full bg-orange-600 text-white py-5 rounded-2xl font-black shadow-xl shadow-orange-600/20">เข้าสู่ระบบ</button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-slate-800 font-sans pb-24 lg:pb-0">
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
              { id: "analytics", icon: BarChart3, label: "วิเคราะห์ธุรกิจ" },
              { id: "inventory", icon: Package, label: "สต็อกสินค้า" }
            ].map(item => (
              <button key={item.id} onClick={() => setActiveView(item.id as any)} className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-bold transition-all ${activeView === item.id ? "bg-white text-orange-600 shadow-xl" : "hover:bg-white/10"}`}>
                <item.icon className="w-5 h-5" /> <span>{item.label}</span>
              </button>
            ))}
            <button onClick={() => setIsAuthenticated(false)} className="ml-6 p-4 bg-white/10 rounded-2xl"><LogOut className="w-5 h-5" /></button>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 lg:p-10">
        {activeView === "pos" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-black text-slate-800">เมนูอาหาร</h2>
                <div className="relative"><Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input type="text" placeholder="ค้นหา..." className="bg-white border border-slate-200 rounded-2xl py-3 pl-12 pr-6 text-sm focus:ring-2 focus:ring-orange-500 outline-none w-64 shadow-sm" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} /></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {products.filter(p => p.name.includes(searchQuery)).map(product => (
                  <div key={product.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5 group hover:shadow-md transition-all">
                    <div className="relative w-24 h-24 rounded-2xl overflow-hidden shrink-0 border border-slate-50"><Image src={product.image} alt={product.name} fill className="object-cover transition-transform group-hover:scale-110" unoptimized /></div>
                    <div className="flex-1 min-w-0"><h4 className="font-bold text-slate-800 text-lg truncate">{product.name}</h4><p className="text-orange-600 font-black text-xl mt-1">{product.price} <span className="text-xs font-bold text-slate-400">บาท</span></p></div>
                    <button onClick={() => addToCart(product)} className="w-12 h-12 bg-orange-600 text-white rounded-2xl flex items-center justify-center hover:bg-orange-700 active:scale-90 transition-all"><Plus className="w-6 h-6" /></button>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:col-span-5">
              <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden flex flex-col sticky top-10">
                <div className="p-8 border-b flex justify-between items-center"><h3 className="text-xl font-black text-slate-800">ตะกร้าสินค้า</h3><div className="bg-slate-50 px-4 py-2 rounded-xl text-xs font-black text-slate-600">{cart.reduce((s, i) => s + i.quantity, 0)} รายการ</div></div>
                <div className="p-8 space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar">
                  {cart.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                      <div className="flex-1 text-sm font-bold text-slate-800">{item.name}</div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-xl border border-slate-200">
                          <button onClick={() => updateQuantity(item.id, -1)} className="p-1"><Minus className="w-4 h-4" /></button>
                          <span className="w-4 text-center font-black">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)} className="p-1"><Plus className="w-4 h-4" /></button>
                        </div>
                        <p className="w-16 text-right font-black">฿{item.price * item.quantity}</p>
                      </div>
                    </div>
                  ))}
                  {cart.length === 0 && <div className="py-10 text-center text-slate-400 text-sm font-bold">ว่างเปล่า</div>}
                </div>
                <div className="p-8 bg-slate-50 border-t space-y-6">
                  <input type="text" placeholder="ชื่อลูกค้า..." className="w-full bg-white border border-slate-200 rounded-2xl py-4 px-6 text-sm focus:ring-2 focus:ring-orange-500 outline-none" value={customerName} onChange={e => setCustomerName(e.target.value)} />
                  <div className="flex justify-between items-center px-2"><p className="text-lg font-bold text-slate-500">ยอดรวม</p><p className="text-4xl font-black text-orange-600">฿{cartTotal.toLocaleString()}</p></div>
                  <button onClick={() => setIsPaymentModalOpen(true)} disabled={cart.length === 0} className="w-full bg-orange-600 text-white py-6 rounded-3xl font-black text-xl shadow-xl shadow-orange-600/20 active:scale-95 transition-all disabled:opacity-50">ชำระเงิน</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeView === "orders" && (
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
            <div className="p-8 border-b flex justify-between items-center"><h2 className="text-2xl font-black text-slate-800">Order History</h2><button onClick={fetchData} className="p-3 bg-slate-50 rounded-xl"><RefreshCw className="w-5 h-5" /></button></div>
            <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400"><tr><th className="p-6">Order ID</th><th className="p-6">Customer</th><th className="p-6 text-right">Total</th><th className="p-6">Payment</th><th className="p-6">Date</th></tr></thead><tbody className="divide-y">{orders.map(o => (<tr key={o.id} className="hover:bg-slate-50"><td className="p-6 font-bold text-slate-400">#{o.id.slice(-6)}</td><td className="p-6 font-black">{o.name}</td><td className="p-6 text-right font-black">฿{o.total_amount.toLocaleString()}</td><td className="p-6"><span className="px-3 py-1 bg-slate-100 rounded-lg font-bold">{o.payment_method}</span></td><td className="p-6 text-slate-400">{new Date(o.created_at).toLocaleString()}</td></tr>))}</tbody></table></div>
          </div>
        )}

        {activeView === "analytics" && (
          <div className="space-y-10">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: "รายได้วันนี้", value: `฿${analyticsData.revenue.toLocaleString()}`, icon: DollarSign, color: "text-blue-600", bg: "bg-blue-50" },
                { label: "ต้นทุน (Est.)", value: `฿${analyticsData.cost.toLocaleString()}`, icon: Activity, color: "text-orange-600", bg: "bg-orange-50" },
                { label: "กำไรสุทธิ", value: `฿${analyticsData.profit.toLocaleString()}`, icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" }
              ].map((kpi, i) => (
                <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl flex items-center justify-between overflow-hidden relative group">
                  <div className={`absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity ${kpi.color}`}><kpi.icon className="w-24 h-24 -mr-6 -mt-6" /></div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{kpi.label}</p>
                    <p className={`text-4xl font-black ${kpi.color} tracking-tighter`}>{kpi.value}</p>
                  </div>
                  <div className={`p-4 ${kpi.bg} rounded-2xl ${kpi.color}`}><kpi.icon className="w-6 h-6" /></div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Custom Bar Chart - Top Selling */}
              <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl">
                <h3 className="text-xl font-black text-slate-800 mb-10 flex items-center gap-3">
                  <div className="w-2 h-8 bg-orange-600 rounded-full" /> เมนูขายดี (TOP 5)
                </h3>
                <div className="space-y-8">
                  {analyticsData.topProducts.map((p, i) => (
                    <div key={i} className="space-y-3">
                      <div className="flex justify-between text-sm font-bold text-slate-600">
                        <span>{p.name}</span>
                        <span className="text-orange-600 font-black">{p.qty} จาน</span>
                      </div>
                      <div className="w-full h-4 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                        <motion.div 
                          initial={{ width: 0 }} 
                          animate={{ width: `${(p.qty / analyticsData.topProducts[0].qty) * 100}%` }} 
                          transition={{ duration: 1.5, ease: "easeOut" }}
                          className="h-full bg-gradient-to-r from-orange-400 to-orange-600 shadow-lg shadow-orange-500/20" 
                        />
                      </div>
                    </div>
                  ))}
                  {analyticsData.topProducts.length === 0 && <p className="text-center text-slate-400 py-10 font-bold">ไม่มีข้อมูล</p>}
                </div>
              </div>

              {/* Profitability Index */}
              <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl">
                <h3 className="text-xl font-black text-slate-800 mb-10 flex items-center gap-3">
                  <div className="w-2 h-8 bg-green-600 rounded-full" /> ความคุ้มค่าของร้าน (Efficiency)
                </h3>
                <div className="flex flex-col items-center justify-center h-full pb-10">
                  <div className="relative w-48 h-48 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90">
                      <circle cx="96" cy="96" r="80" fill="transparent" stroke="#f1f5f9" strokeWidth="20" />
                      <motion.circle 
                        cx="96" cy="96" r="80" fill="transparent" stroke="#16a34a" strokeWidth="20" 
                        strokeDasharray={502.4} 
                        initial={{ strokeDashoffset: 502.4 }} 
                        animate={{ strokeDashoffset: 502.4 * (1 - 0.45) }} 
                        transition={{ duration: 2 }}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <p className="text-4xl font-black text-green-600 tracking-tighter">45%</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase">Profit Margin</p>
                    </div>
                  </div>
                  <div className="mt-10 grid grid-cols-2 gap-10 w-full px-4">
                    <div className="text-center">
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Avg. Order</p>
                      <p className="text-xl font-black text-slate-800">฿{(analyticsData.revenue / (analyticsData.orderCount || 1)).toFixed(0)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Loyalty Rank</p>
                      <p className="text-xl font-black text-orange-600 tracking-tighter">GOLD</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeView === "inventory" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {products.map(p => (
              <div key={p.id} className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0"><Image src={p.image} alt={p.name} fill className="object-cover" unoptimized /></div>
                <div className="flex-1"><h4 className="text-sm font-bold truncate">{p.name}</h4><p className="text-xs text-orange-600 font-black">฿{p.price}</p></div>
                <button 
                  onClick={async () => { await supabase.from("products").update({ is_available: !p.is_available }).eq("id", p.id); fetchData(); }}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase ${p.is_available ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-400'}`}
                >
                  {p.is_available ? 'เปิดอยู่' : 'ปิด'}
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      <AnimatePresence>
        {isPaymentModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-[3rem] w-full max-w-md shadow-2xl overflow-hidden">
              <div className="p-8 border-b flex justify-between items-center"><h3 className="text-xl font-black">ชำระเงิน</h3><button onClick={() => setIsPaymentModalOpen(false)} className="p-3 bg-slate-50 rounded-2xl"><X className="w-6 h-6" /></button></div>
              <div className="p-10 space-y-8">
                <div className="bg-slate-50 p-8 rounded-3xl border flex justify-between items-center"><p className="text-lg font-bold text-slate-500">ยอดรวม:</p><p className="text-4xl font-black text-orange-600">฿{cartTotal.toLocaleString()}</p></div>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => setPaymentMethod("cash")} className={`flex items-center justify-center gap-3 py-5 rounded-2xl font-black border-2 transition-all ${paymentMethod === 'cash' ? 'bg-slate-900 text-white border-slate-900 shadow-xl' : 'bg-white text-slate-400 border-slate-100'}`}><Banknote className="w-5 h-5" /> เงินสด</button>
                  <button onClick={() => setPaymentMethod("credit")} className={`flex items-center justify-center gap-3 py-5 rounded-2xl font-black border-2 transition-all ${paymentMethod === 'credit' ? 'bg-slate-900 text-white border-slate-900 shadow-xl' : 'bg-white text-slate-400 border-slate-100'}`}><CreditCard className="w-5 h-5" /> บัตรเครดิต</button>
                </div>
                {paymentMethod === "cash" && (
                  <div className="space-y-4">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">เงินที่รับมา</p>
                    <input type="number" className="w-full bg-slate-50 border-2 rounded-3xl py-6 px-8 text-3xl font-black outline-none focus:border-orange-500 transition-all" value={amountReceived} onChange={e => setAmountReceived(e.target.value)} />
                    <div className="flex justify-between items-center px-4"><p className="text-sm font-bold text-slate-400">เงินทอน:</p><p className="text-2xl font-black text-green-600">฿{changeAmount.toLocaleString()}</p></div>
                  </div>
                )}
                <button onClick={handleCheckout} disabled={loading || (paymentMethod === 'cash' && (parseFloat(amountReceived) < cartTotal || !amountReceived))} className="w-full bg-green-600 text-white py-6 rounded-3xl font-black text-xl shadow-2xl shadow-green-600/20 active:scale-95 transition-all">ยืนยันการชำระเงิน</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t px-8 py-4 flex items-center justify-between shadow-2xl">
        {[{ id: "pos", icon: ShoppingBag, label: "ขาย" }, { id: "orders", icon: History, label: "ประวัติ" }, { id: "analytics", icon: BarChart3, label: "สถิติ" }, { id: "inventory", icon: Package, label: "สต็อก" }].map(item => (
          <button key={item.id} onClick={() => setActiveView(item.id as any)} className={`flex flex-col items-center gap-1 transition-all ${activeView === item.id ? "text-orange-600 scale-110" : "text-slate-400"}`}><item.icon className="w-6 h-6" /><span className="text-[9px] font-bold uppercase">{item.label}</span></button>
        ))}
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
      `}</style>
    </div>
  );
}
