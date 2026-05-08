"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  BarChart3, 
  Settings, 
  Plus, 
  Search, 
  RefreshCw, 
  LogOut, 
  Phone, 
  MapPin, 
  Eye, 
  CheckCircle, 
  Clock, 
  ChefHat, 
  Truck, 
  X, 
  MoreVertical,
  ChevronRight,
  TrendingUp,
  CreditCard,
  Printer
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

type OrderStatus = "pending" | "preparing" | "ready" | "delivering" | "delivered" | "cancelled";

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
  slip_url: string;
  order_items: any[];
}

export default function PosDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<"orders" | "inventory" | "stats">("orders");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState({ revenue: 0, orders: 0, preparing: 0 });

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data: orderData } = await supabase.from("orders").select("*, order_items(*)").order("created_at", { ascending: false });
    const { data: productData } = await supabase.from("products").select("*").order("name");
    
    if (orderData) {
      setOrders(orderData);
      const today = new Date().toISOString().split('T')[0];
      const todayOrders = orderData.filter(o => o.created_at.startsWith(today));
      setStats({
        revenue: todayOrders.reduce((sum, o) => sum + Number(o.total_amount), 0),
        orders: todayOrders.length,
        preparing: orderData.filter(o => o.status === 'preparing' || o.status === 'pending').length
      });
    }
    if (productData) setProducts(productData);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
      const channel = supabase.channel("pos_v6").on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => fetchData()).subscribe();
      return () => { supabase.removeChannel(channel); };
    }
  }, [isAuthenticated, fetchData]);

  const updateStatus = async (id: string, status: OrderStatus) => {
    await supabase.from("orders").update({ status }).eq("id", id);
    fetchData();
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6 font-sans">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#111] p-10 rounded-3xl w-full max-w-sm border border-white/5 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-mala-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <ChefHat className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Krua Baan Gem OS</h1>
            <p className="text-white/40 text-xs mt-1 uppercase tracking-widest">Enterprise Command Center</p>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); if (username === "admin" && password === "1234") setIsAuthenticated(true); else alert("Access Denied"); }} className="space-y-4">
            <input type="text" placeholder="Access Key" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:ring-1 focus:ring-mala-500 outline-none transition-all" value={username} onChange={e => setUsername(e.target.value)} />
            <input type="password" placeholder="Security PIN" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white text-2xl tracking-[0.5em] focus:ring-1 focus:ring-mala-500 outline-none transition-all" value={password} onChange={e => setPassword(e.target.value)} />
            <button className="w-full bg-mala-600 text-white py-4 rounded-2xl font-bold hover:bg-mala-700 active:scale-95 transition-all shadow-xl shadow-mala-600/20">Authorize</button>
          </form>
        </motion.div>
      </div>
    );
  }

  const filteredOrders = orders.filter(o => o.name.toLowerCase().includes(searchQuery.toLowerCase()) || o.phone.includes(searchQuery));

  return (
    <div className="min-h-screen bg-[#050505] text-[#eee] flex font-sans">
      {/* Sidebar - Desktop Only (Ury Inspired) */}
      <aside className="hidden lg:flex flex-col w-72 bg-[#0f0f0f] border-r border-white/5 p-8 fixed top-0 bottom-0 z-50">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-mala-600 rounded-xl flex items-center justify-center shadow-lg"><ChefHat className="w-6 h-6 text-white" /></div>
          <div>
            <h2 className="font-bold text-white leading-none">Gem Kitchen</h2>
            <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">v6.0 Enterprise</p>
          </div>
        </div>
        
        <nav className="flex-1 space-y-2">
          {[
            { id: "orders", icon: ShoppingBag, label: "Orders" },
            { id: "inventory", icon: Package, label: "Inventory" },
            { id: "stats", icon: BarChart3, label: "Analytics" }
          ].map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id as any)} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${activeTab === item.id ? "bg-mala-600 text-white shadow-xl shadow-mala-600/20" : "text-white/40 hover:bg-white/5 hover:text-white"}`}>
              <item.icon className="w-5 h-5" />
              <span className="font-bold text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

        <button onClick={() => setIsAuthenticated(false)} className="flex items-center gap-4 px-6 py-4 text-white/20 hover:text-red-500 transition-all mt-auto border-t border-white/5 pt-8">
          <LogOut className="w-5 h-5" />
          <span className="font-bold text-sm">Sign Out</span>
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-72 flex flex-col pb-24 lg:pb-0">
        {/* Header - Fixed Top */}
        <header className="sticky top-0 z-40 bg-[#050505]/80 backdrop-blur-xl border-b border-white/5 px-6 lg:px-12 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="lg:hidden w-10 h-10 bg-mala-600 rounded-xl flex items-center justify-center"><ChefHat className="w-5 h-5 text-white" /></div>
            <h1 className="text-xl font-bold text-white tracking-tight capitalize">{activeTab}</h1>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={fetchData} className={`p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all ${loading ? 'animate-spin' : ''}`}><RefreshCw className="w-4 h-4" /></button>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="p-6 lg:p-12">
          {activeTab === "orders" && (
            <div className="space-y-8">
              {/* Stats Cards (Ury Inspired) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-[#111] p-6 rounded-3xl border border-white/5 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mb-1">Today's Sales</p>
                    <p className="text-2xl font-black text-white">฿{stats.revenue.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-green-500/10 rounded-2xl text-green-500"><TrendingUp className="w-6 h-6" /></div>
                </div>
                <div className="bg-[#111] p-6 rounded-3xl border border-white/5 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mb-1">Orders Count</p>
                    <p className="text-2xl font-black text-white">{stats.orders}</p>
                  </div>
                  <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500"><ShoppingBag className="w-6 h-6" /></div>
                </div>
                <div className="bg-[#111] p-6 rounded-3xl border border-white/5 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mb-1">Active Queue</p>
                    <p className="text-2xl font-black text-mala-500">{stats.preparing}</p>
                  </div>
                  <div className="p-3 bg-mala-500/10 rounded-2xl text-mala-500"><Clock className="w-6 h-6" /></div>
                </div>
              </div>

              {/* Order List / Search */}
              <div className="space-y-4">
                <div className="relative group">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-mala-500 transition-all" />
                  <input type="text" placeholder="Search customer name or phone..." className="w-full bg-[#111] border border-white/5 rounded-[2rem] py-5 pl-14 pr-8 text-sm text-white focus:ring-1 focus:ring-mala-500 outline-none transition-all" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <AnimatePresence mode="popLayout">
                    {filteredOrders.map((order) => (
                      <motion.div 
                        layout key={order.id} 
                        onClick={() => setSelectedOrder(order)}
                        className={`group p-6 rounded-3xl border transition-all cursor-pointer flex items-center justify-between ${selectedOrder?.id === order.id ? 'bg-[#1a1a1a] border-mala-600/50 shadow-2xl' : 'bg-[#0f0f0f] border-white/5 hover:border-white/10'}`}
                      >
                        <div className="flex items-center gap-5">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                            order.status === 'pending' ? 'bg-amber-500/10 text-amber-500' :
                            order.status === 'preparing' ? 'bg-orange-500/10 text-orange-500' :
                            order.status === 'ready' ? 'bg-blue-500/10 text-blue-500' :
                            'bg-green-500/10 text-green-500'
                          }`}>
                            {order.status === 'pending' ? <Clock className="w-7 h-7" /> : 
                             order.status === 'preparing' ? <ChefHat className="w-7 h-7" /> :
                             order.status === 'ready' ? <Package className="w-7 h-7" /> :
                             <CheckCircle className="w-7 h-7" />}
                          </div>
                          <div>
                            <h4 className="font-bold text-white text-lg tracking-tight leading-none mb-2">{order.name}</h4>
                            <div className="flex items-center gap-3">
                              <span className="text-[10px] text-white/20 font-bold uppercase tracking-widest">ID: #{order.id.slice(-6).toUpperCase()}</span>
                              <span className="w-1 h-1 rounded-full bg-white/10" />
                              <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">{new Date(order.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-black text-white mb-1">฿{order.total_amount.toLocaleString()}</p>
                          <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full tracking-widest ${
                            order.status === 'pending' ? 'bg-amber-500/20 text-amber-500' :
                            'bg-white/5 text-white/40'
                          }`}>{order.status}</span>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          )}

          {activeTab === "inventory" && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {products.map(p => (
                <div key={p.id} className="bg-[#111] p-6 rounded-3xl border border-white/5 flex items-center gap-5">
                  <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-white/5 border border-white/10">
                    <Image src={p.image} alt={p.name} fill className={`object-cover ${!p.is_available ? 'grayscale opacity-30' : ''}`} unoptimized />
                    {!p.is_available && <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center"><X className="w-8 h-8 text-white" /></div>}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-white mb-1">{p.name}</h4>
                    <p className="text-sm font-black text-mala-500">฿{p.price}</p>
                  </div>
                  <button 
                    onClick={async () => { await supabase.from("products").update({ is_available: !p.is_available }).eq("id", p.id); fetchData(); }}
                    className={`px-6 py-3 rounded-2xl font-bold text-[10px] uppercase tracking-widest transition-all ${p.is_available ? 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white' : 'bg-green-500 text-white hover:bg-green-600'}`}
                  >
                    {p.is_available ? 'Off' : 'On'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Order Detail Side Sheet (Mobile Responsive) */}
        <AnimatePresence>
          {selectedOrder && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedOrder(null)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]" />
              <motion.div 
                initial={{ x: "100%" }} 
                animate={{ x: 0 }} 
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="fixed top-0 right-0 bottom-0 w-full lg:w-[600px] bg-[#0d0d0d] z-[110] shadow-2xl flex flex-col"
              >
                {/* Side Sheet Header */}
                <div className="p-8 border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-mala-500"><ShoppingBag className="w-6 h-6" /></div>
                    <div>
                      <h3 className="text-xl font-bold text-white tracking-tight leading-none mb-1">Order Details</h3>
                      <p className="text-[10px] text-white/30 uppercase tracking-[0.3em] font-bold">Transaction Record</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedOrder(null)} className="p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all"><X className="w-6 h-6" /></button>
                </div>

                {/* Side Sheet Body */}
                <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                  {/* Customer Insight Card */}
                  <div className="bg-[#111] p-8 rounded-[2.5rem] border border-white/5">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h4 className="text-3xl font-black text-white tracking-tighter mb-1">{selectedOrder.name}</h4>
                        <p className="text-base font-bold text-white/40">{selectedOrder.phone}</p>
                      </div>
                      <a href={`tel:${selectedOrder.phone}`} className="w-14 h-14 bg-mala-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-mala-600/20 active:scale-90 transition-transform"><Phone className="w-6 h-6" /></a>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <a href={selectedOrder.location_url} target="_blank" className="flex items-center justify-center gap-3 bg-white/5 py-4 rounded-2xl text-xs font-bold border border-white/10 hover:bg-white/10 transition-all"><MapPin className="w-4 h-4 text-mala-500" /> View Map</a>
                      <button onClick={() => window.open(selectedOrder.slip_url, '_blank')} className="flex items-center justify-center gap-3 bg-white/5 py-4 rounded-2xl text-xs font-bold border border-white/10 hover:bg-white/10 transition-all"><CreditCard className="w-4 h-4 text-mala-500" /> View Slip</button>
                    </div>
                  </div>

                  {/* Items Table (Ury Inspired) */}
                  <div className="space-y-4">
                    <h5 className="text-[11px] font-bold text-white/30 uppercase tracking-[0.4em] px-2">Order Items</h5>
                    <div className="space-y-3">
                      {selectedOrder.order_items?.map((item, i) => (
                        <div key={i} className="flex justify-between items-center p-6 bg-white/5 rounded-3xl border border-white/5">
                          <div>
                            <p className="font-bold text-white leading-none mb-2">{item.name} <span className="text-mala-600 ml-2">x{item.quantity}</span></p>
                            {item.options && <p className="text-[10px] text-white/30 italic">{item.options}</p>}
                          </div>
                          <p className="font-black text-white">฿{(item.price * item.quantity).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Side Sheet Footer / Actions */}
                <div className="p-8 bg-[#0a0a0a] border-t border-white/5 space-y-4">
                  <div className="flex justify-between items-center mb-6 px-2">
                    <p className="text-sm font-bold text-white/40">Total Amount</p>
                    <p className="text-4xl font-black text-white tracking-tighter">฿{selectedOrder.total_amount.toLocaleString()}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => updateStatus(selectedOrder.id, 'preparing')} className={`flex items-center justify-center gap-3 py-5 rounded-2xl font-bold text-[11px] uppercase tracking-widest transition-all ${selectedOrder.status === 'preparing' ? 'bg-orange-600 text-white shadow-xl shadow-orange-600/20' : 'bg-white/5 text-white/40 border border-white/5 hover:border-orange-500'}`}><ChefHat className="w-5 h-5" /> Cooking</button>
                    <button onClick={() => updateStatus(selectedOrder.id, 'ready')} className={`flex items-center justify-center gap-3 py-5 rounded-2xl font-bold text-[11px] uppercase tracking-widest transition-all ${selectedOrder.status === 'ready' ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'bg-white/5 text-white/40 border border-white/5 hover:border-blue-500'}`}><Package className="w-5 h-5" /> Ready</button>
                    <button onClick={() => updateStatus(selectedOrder.id, 'delivering')} className={`flex items-center justify-center gap-3 py-5 rounded-2xl font-bold text-[11px] uppercase tracking-widest transition-all ${selectedOrder.status === 'delivering' ? 'bg-purple-600 text-white shadow-xl shadow-purple-600/20' : 'bg-white/5 text-white/40 border border-white/5 hover:border-purple-500'}`}><Truck className="w-5 h-5" /> Shipping</button>
                    <button onClick={() => updateStatus(selectedOrder.id, 'delivered')} className={`flex items-center justify-center gap-3 py-5 rounded-2xl font-bold text-[11px] uppercase tracking-widest transition-all ${selectedOrder.status === 'delivered' ? 'bg-green-600 text-white shadow-xl shadow-green-600/20' : 'bg-white/5 text-white/40 border border-white/5 hover:border-green-500'}`}><CheckCircle className="w-5 h-5" /> Archive</button>
                  </div>
                  <button className="w-full bg-white text-black py-5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-[#eee] transition-all"><Printer className="w-5 h-5" /> Print Receipt</button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Mobile Tab Bar (Ury Style) */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#0f0f0f]/90 backdrop-blur-xl border-t border-white/5 px-8 py-4 flex items-center justify-between z-40">
          {[
            { id: "orders", icon: ShoppingBag, label: "Orders" },
            { id: "inventory", icon: Package, label: "Items" },
            { id: "stats", icon: BarChart3, label: "Stats" }
          ].map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id as any)} className={`flex flex-col items-center gap-1 transition-all ${activeTab === item.id ? "text-mala-600" : "text-white/20"}`}>
              <item.icon className="w-5 h-5" />
              <span className="text-[8px] font-bold uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
          <button onClick={() => setIsAuthenticated(false)} className="flex flex-col items-center gap-1 text-white/10">
            <LogOut className="w-5 h-5" />
            <span className="text-[8px] font-bold uppercase tracking-widest">Quit</span>
          </button>
        </div>
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #222; border-radius: 10px; }
      `}</style>
    </div>
  );
}
